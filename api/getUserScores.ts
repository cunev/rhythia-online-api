import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    id: z.number(),
    limit: z.number().default(10),
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
          songId: z.string().nullable(),
          userId: z.number().nullable(),
          beatmapDifficulty: z.number().optional().nullable(),
          beatmapNotes: z.number().optional().nullable(),
          beatmapTitle: z.string().optional().nullable(),
          speed: z.number().optional().nullable(),
          spin: z.boolean().optional().nullable(),
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
          speed: z.number().optional().nullable(),
          spin: z.boolean().optional().nullable(),
        })
      )
      .optional(),
    stats: z
      .object({
        totalScores: z.number(),
        spinScores: z.number(),
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
  if (data.limit > 100) {
    return NextResponse.json({ error: "Limit breached" });
  }
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
    .limit(data.limit);

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
    .order("awarded_sp", { ascending: false });

  if (scores2 == null) return NextResponse.json({ error: "No scores" });

  let spinScores = 0;
  let totalScores = scores2.length;
  let hashMap: Record<string, { awarded_sp: number; score: any }> = {};

  for (const score of scores2) {
    const { beatmapHash, awarded_sp, spin } = score;

    if (!beatmapHash || !awarded_sp) continue;

    if (score.spin) {
      spinScores++;
    }

    if (!hashMap[beatmapHash] || hashMap[beatmapHash].awarded_sp < awarded_sp) {
      hashMap[beatmapHash] = { awarded_sp, score };
    }
  }

  const values = Object.values(hashMap);
  let vals = values
    .sort((a, b) => b.awarded_sp - a.awarded_sp)
    .slice(0, data.limit)
    .map((e) => e.score);

  return NextResponse.json({
    lastDay: scores1?.map((s) => ({
      created_at: s.created_at,
      id: s.id,
      passed: s.passed,
      userId: s.userId,
      awarded_sp: s.awarded_sp,
      beatmapHash: s.beatmapHash,
      misses: s.misses,
      songId: s.songId,
      beatmapDifficulty: s.beatmaps?.difficulty,
      beatmapNotes: s.beatmaps?.noteCount,
      beatmapTitle: s.beatmaps?.title,
      speed: s.speed,
      spin: s.spin,
    })),
    top: vals?.map((s) => ({
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
      speed: s.speed,
      spin: s.spin,
    })),
    stats: {
      totalScores,
      spinScores,
    },
  });
}
