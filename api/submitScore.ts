import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    data: z.strictObject({
      token: z.string(),
      relayHwid: z.string(),
      songId: z.string(),
      noteResults: z.record(z.boolean()),
      triggers: z.array(z.array(z.number())),
      mapHash: z.string(),
      mapTitle: z.string(),
      mapDifficulty: z.number(),
      mapNoteCount: z.number(),
      mapLength: z.number(),
    }),
  }),
  output: z.object({
    error: z.string().optional(),
  }),
};

export async function POST(res: Response): Promise<NextResponse> {
  return protectedApi({
    response: res,
    schema: Schema,
    authorization: () => {},
    activity: handler,
  });
}

export async function handler({
  data,
  session,
}: (typeof Schema)["input"]["_type"]): Promise<
  NextResponse<(typeof Schema)["output"]["_type"]>
> {
  const user = (await supabase.auth.getUser(session)).data.user!;

  let { data: userData, error: userError } = await supabase
    .from("profiles")
    .select("*")
    .eq("uid", user.id);

  if (!userData?.length)
    return NextResponse.json(
      {
        error: "User doesn't exist",
      },
      { status: 500 }
    );

  let { data: beatmaps, error } = await supabase
    .from("beatmaps")
    .select("*")
    .eq("beatmapHash", data.mapHash);

  let newPlaycount = 1;

  if (beatmaps?.length) {
    newPlaycount = (beatmaps[0].playcount || 1) + 1;
  }

  const upsertData = await supabase
    .from("beatmaps")
    .upsert({
      beatmapHash: data.mapHash,
      title: data.mapTitle,
      playcount: newPlaycount,
      difficulty: data.mapDifficulty,
      noteCount: data.mapNoteCount,
      length: data.mapLength,
    })
    .select();

  const insertData = await supabase
    .from("scores")
    .upsert({
      beatmapHash: data.mapHash,
      noteResults: data.noteResults,
      replayHwid: data.relayHwid,
      songId: data.songId,
      triggers: data.triggers,
      userId: userData[0].id,
      passed: data.mapNoteCount == Object.keys(data.noteResults).length,
      misses: Object.values(data.noteResults).filter((e) => !e).length,
    })
    .select();

  return NextResponse.json({});
}
