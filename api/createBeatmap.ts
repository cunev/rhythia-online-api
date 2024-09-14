import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";
import { SSPMParser } from "../utils/star-calc/sspmParser";
import { supabase } from "../utils/supabase";
import { createHash } from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { rateMap } from "../utils/star-calc";

const s3Client = new S3Client({
  region: "auto",
  endpoint: "https://s3.eu-central-003.backblazeb2.com",
  credentials: {
    secretAccessKey: "K0039mm4iKsteQOXpZSzf0+VDzuH89U",
    accessKeyId: "003c245e893e8060000000001",
  },
});

export const Schema = {
  input: z.strictObject({
    url: z.string(),
    session: z.string(),
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
}: (typeof Schema)["input"]["_type"]): Promise<
  NextResponse<(typeof Schema)["output"]["_type"]>
> {
  if (
    !url.startsWith(`https://rhthia-avatars.s3.eu-central-003.backblazeb2.com/`)
  )
    return NextResponse.json({ error: "Invalid url" });

  const request = await fetch(url);
  const bytes = await request.arrayBuffer();
  const parser = new SSPMParser(Buffer.from(bytes));

  const parsedData = parser.parse();
  let sum = createHash("sha1");
  sum.update(Buffer.from(bytes));
  const digested = sum.digest("hex");
  const imgkey = `beatmap-img-${Date.now()}-${digested}`;
  const command = new PutObjectCommand({
    Bucket: "rhthia-avatars",
    Key: imgkey,
    Body: parsedData.cover,
    ContentType: "image/jpeg",
  });

  await s3Client.send(command);
  parsedData.markers.sort((a, b) => a.position - b.position);
  const upserted = await supabase.from("beatmaps").upsert({
    beatmapHash: digested,
    title: parsedData.strings.mapName,
    playcount: 0,
    difficulty: parsedData.metadata.difficulty,
    noteCount: parsedData.metadata.noteCount,
    length: parsedData.pointers.audioLength,
    beatmapFile: url,
    image: `https://rhthia-avatars.s3.eu-central-003.backblazeb2.com/${imgkey}`,
    starRating: rateMap(parsedData),
  });

  if (upserted.error?.message.length) {
    return NextResponse.json({ error: upserted.error.message });
  }
  return NextResponse.json({ hash: digested });
}
