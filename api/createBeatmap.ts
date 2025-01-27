import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";
import { SSPMParser } from "../utils/star-calc/sspmParser";
import { supabase } from "../utils/supabase";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { rateMap } from "../utils/star-calc";
import { getUserBySession } from "../utils/getUserBySession";
import { User } from "@supabase/supabase-js";
const s3Client = new S3Client({
  region: "auto",
  endpoint: "https://s3.eu-central-003.backblazeb2.com",
  credentials: {
    secretAccessKey: process.env.SECRET_BUCKET || "",
    accessKeyId: process.env.ACCESS_BUCKET || "",
  },
});

export const Schema = {
  input: z.strictObject({
    url: z.string(),
    session: z.string(),
    updateFlag: z.boolean().optional(),
  }),
  output: z.strictObject({
    hash: z.string().optional(),
    error: z.string().optional(),
  }),
};

export async function POST(request: Request): Promise<NextResponse> {
  return protectedApi({
    request,
    schema: Schema,
    authorization: validUser,
    activity: handler,
  });
}

export async function handler({
  url,
  session,
  updateFlag,
}: (typeof Schema)["input"]["_type"]): Promise<
  NextResponse<(typeof Schema)["output"]["_type"]>
> {
  if (!url.startsWith(`https://static.rhythia.com/`))
    return NextResponse.json({ error: "Invalid url" });

  const request = await fetch(url);
  const bytes = await request.arrayBuffer();
  const parser = new SSPMParser(Buffer.from(bytes));

  const parsedData = parser.parse();
  const digested = parsedData.strings.mapID;

  const user = (await getUserBySession(session)) as User;
  let { data: userData, error: userError } = await supabase
    .from("profiles")
    .select("*")
    .eq("uid", user.id)
    .single();

  if (!userData) {
    return NextResponse.json({ error: "Bad user" });
  }

  if (
    !parsedData.strings.mappers
      .map((mapper) => mapper.toLowerCase().trim())
      .includes((userData.username?.trim() || "").toLowerCase())
  ) {
    return NextResponse.json({
      error: `You are not among the authors of the map. If you made the map, please add yourself as an author in the editor. Mappers: ${JSON.stringify(
        parsedData.strings.mappers
      )}, Your name: ${userData.username}`,
    });
  }

  if (
    userData.ban == "excluded" ||
    userData.ban == "restricted" ||
    userData.ban == "silenced"
  ) {
    return NextResponse.json(
      {
        error:
          "Silenced, restricted or excluded players can't create beatmaps their profile.",
      },
      { status: 404 }
    );
  }

  let { data: beatmapPage, error: errorlast } = await supabase
    .from("beatmapPages")
    .select(`*`)
    .eq("latestBeatmapHash", digested)
    .single();

  if (beatmapPage) {
    if (beatmapPage?.status !== "UNRANKED")
      return NextResponse.json({ error: "Only unranked maps can be updated" });

    if (!updateFlag) {
      return NextResponse.json({ error: "Already Exists" });
    } else if (beatmapPage.owner !== userData.id) {
      return NextResponse.json({ error: "Already Exists" });
    }
  }

  const imgkey = `beatmap-img-${Date.now()}-${digested}`;

  let buffer = Buffer.from([]);
  try {
    buffer = await require("sharp")(parsedData.cover)
      .resize(250)
      .jpeg({ mozjpeg: true })
      .toBuffer();
  } catch (error) {}

  let largeBuffer = Buffer.from([]);
  try {
    largeBuffer = await require("sharp")(parsedData.cover)
      .resize(850)
      .jpeg({ mozjpeg: true })
      .toBuffer();
  } catch (error) {}

  // Images
  const command = new PutObjectCommand({
    Bucket: "rhthia-avatars",
    Key: imgkey,
    Body: buffer,
    ContentType: "image/jpeg",
  });

  await s3Client.send(command);

  const command2 = new PutObjectCommand({
    Bucket: "rhthia-avatars",
    Key: imgkey + "large",
    Body: largeBuffer,
    ContentType: "image/jpeg",
  });

  await s3Client.send(command2);
  // Images End

  const markers = parsedData.markers.sort((a, b) => a.position - b.position);

  const upserted = await supabase.from("beatmaps").upsert({
    beatmapHash: digested,
    title: parsedData.strings.mapName,
    playcount: 0,
    difficulty: parsedData.metadata.difficulty,
    noteCount: parsedData.metadata.noteCount,
    length: markers[markers.length - 1].position,
    beatmapFile: url,
    image: `https://static.rhythia.com/${imgkey}`,
    imageLarge: `https://static.rhythia.com/${imgkey}large`,
    starRating: rateMap(parsedData),
  });

  if (upserted.error?.message.length) {
    return NextResponse.json({ error: upserted.error.message });
  }
  return NextResponse.json({ hash: digested });
}
