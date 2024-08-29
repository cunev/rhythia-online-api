import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";
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
      sspp: z.number(),
    }),
  }),
  output: z.object({
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
  data,
  session,
}: (typeof Schema)["input"]["_type"]): Promise<
  NextResponse<(typeof Schema)["output"]["_type"]>
> {
  const user = (await supabase.auth.getUser(session)).data.user!;

  let { data: userData, error: userError } = await supabase
    .from("profiles")
    .select("*")
    .eq("uid", user.id)
    .single();

  if (!userData)
    return NextResponse.json(
      {
        error: "User doesn't exist",
      },
      { status: 500 }
    );

  console.log(userData);
  let { data: beatmaps, error } = await supabase
    .from("beatmaps")
    .select("playcount")
    .eq("beatmapHash", data.mapHash)
    .single();

  let newPlaycount = 1;

  if (beatmaps) {
    newPlaycount = (beatmaps.playcount || 1) + 1;
  }

  console.log(newPlaycount);
  const p1 = await supabase.from("beatmaps").upsert({
    beatmapHash: data.mapHash,
    title: data.mapTitle,
    playcount: newPlaycount,
    difficulty: data.mapDifficulty,
    noteCount: data.mapNoteCount,
    length: data.mapLength,
  });

  console.log("p1");
  const p2 = await supabase.from("scores").upsert({
    beatmapHash: data.mapHash,
    noteResults: data.noteResults,
    replayHwid: data.relayHwid,
    songId: data.songId,
    triggers: data.triggers,
    userId: userData.id,
    passed: data.mapNoteCount == Object.keys(data.noteResults).length,
    misses: Object.values(data.noteResults).filter((e) => !e).length,
    awarded_sp: data.sspp,
    rank: "A",
  });
  console.log("p2");

  const p3 = await supabase.from("profiles").upsert({
    id: userData.id,
    play_count: (userData.play_count || 0) + 1,
    squares_hit:
      (userData.squares_hit || 0) +
      Object.values(data.noteResults).filter((e) => e).length,
  });
  console.log("p3");

  // await Promise.all([p1, p2, p3]);

  return NextResponse.json({});
}
