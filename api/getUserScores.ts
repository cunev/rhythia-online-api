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
    lastDay: z
      .array(
        z.object({
          awarded_sp: z.number().nullable(),
          beatmapHash: z.string().nullable(),
          created_at: z.string(),
          id: z.number(),
          misses: z.number().nullable(),
          passed: z.boolean().nullable(),
          rank: z.string().nullable(),
          songId: z.string().nullable(),
          userId: z.number().nullable(),
          beatmapDifficulty: z.number().optional().nullable(),
          beatmapNotes: z.number().optional().nullable(),
          beatmapTitle: z.string().optional().nullable(),
        })
      )
      .optional(),
    top: z
      .array(
        z.object({
          awarded_sp: z.number().nullable(),
          beatmapHash: z.string().nullable(),
          created_at: z.string(),
          id: z.number(),
          misses: z.number().nullable(),
          passed: z.boolean().nullable(),
          rank: z.string().nullable(),
          songId: z.string().nullable(),
          userId: z.number().nullable(),
          beatmapDifficulty: z.number().optional().nullable(),
          beatmapNotes: z.number().optional().nullable(),
          beatmapTitle: z.string().optional().nullable(),
        })
      )
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
  let { data: scores1, error: errorlast } = await supabase
    .from("scores")
    .select(
      `
      *,
      beatmaps (
        difficulty,
        noteCount,
        title
      )
    `
    )
    .eq("userId", data.id)
    .eq("passed", true)
    .order("created_at", { ascending: false })
    .limit(10);

  let { data: scores2, error: errorsp } = await supabase
    .from("scores")
    .select(
      `
      *,
      beatmaps (
        difficulty,
        noteCount,
        title
      )
    `
    )
    .eq("userId", data.id)
    .neq("awarded_sp", 0)
    .eq("passed", true)
    .order("awarded_sp", { ascending: false })
    .limit(10);

  return NextResponse.json({
    lastDay: scores1?.map((s) => ({
      created_at: s.created_at,
      id: s.id,
      passed: s.passed,
      userId: s.userId,
      awarded_sp: s.awarded_sp,
      beatmapHash: s.beatmapHash,
      misses: s.misses,
      rank: s.rank,
      songId: s.songId,
      beatmapDifficulty: s.beatmaps?.difficulty,
      beatmapNotes: s.beatmaps?.noteCount,
      beatmapTitle: s.beatmaps?.title,
    })),
    top: scores2?.map((s) => ({
      created_at: s.created_at,
      id: s.id,
      passed: s.passed,
      userId: s.userId,
      awarded_sp: s.awarded_sp,
      beatmapHash: s.beatmapHash,
      misses: s.misses,
      rank: s.rank,
      songId: s.songId,
      beatmapDifficulty: s.beatmaps?.difficulty,
      beatmapNotes: s.beatmaps?.noteCount,
      beatmapTitle: s.beatmaps?.title,
    })),
  });
}
