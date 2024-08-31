import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    id: z.number(),
  }),
  output: z.object({
    error: z.string().optional(),
    score: z
      .object({
        awarded_sp: z.number().nullable(),
        beatmapHash: z.string().nullable(),
        created_at: z.string(),
        id: z.number(),
        misses: z.number().nullable(),
        passed: z.boolean().nullable(),
        songId: z.string().nullable(),
        userId: z.number().nullable(),
        beatmapDifficulty: z.number().optional().nullable(),
        beatmapNotes: z.number().optional().nullable(),
        beatmapTitle: z.string().optional().nullable(),
        username: z.string().optional().nullable(),
      })
      .optional(),
  }),
};

export async function POST(request: Request): Promise<NextResponse> {
  return protectedApi({
    request,
    schema: Schema,
    authorization: () => {},
    activity: handler,
  });
}

export async function handler(
  data: (typeof Schema)["input"]["_type"],
  req: Request
): Promise<NextResponse<(typeof Schema)["output"]["_type"]>> {
  let { data: score, error: errorlast } = await supabase
    .from("scores")
    .select(
      `
      *,
      beatmaps (
        difficulty,
        noteCount,
        title
      ),
      profiles (
        username
      )
    `
    )
    .eq("id", data.id)
    .single();

  if (!score) return NextResponse.json({});

  return NextResponse.json({
    score: {
      created_at: score.created_at,
      id: score.id,
      passed: score.passed,
      userId: score.userId,
      awarded_sp: score.awarded_sp,
      beatmapHash: score.beatmapHash,
      misses: score.misses,
      songId: score.songId,
      beatmapDifficulty: score.beatmaps?.difficulty,
      beatmapNotes: score.beatmaps?.noteCount,
      beatmapTitle: score.beatmaps?.title,
      username: score.profiles?.username,
    },
  });
}
