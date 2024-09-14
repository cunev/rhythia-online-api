import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";
import { SSPMParser } from "../utils/star-calc/sspmParser";
import { supabase } from "../utils/supabase";
import { createHash } from "crypto";

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

  const upserted = await supabase.from("beatmaps").upsert({
    beatmapHash: sum.digest("hex"),
    title: parsedData.strings.songName,
    playcount: 0,
    difficulty: parsedData.metadata.difficulty,
    noteCount: parsedData.metadata.noteCount,
    length: parsedData.pointers.audioLength,
  });

  if (upserted.error?.message.length) {
    return NextResponse.json({ error: upserted.error.message });
  }
  return NextResponse.json({});
}
