import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi } from "../utils/requestUtils";
import { kv, supabase } from "../utils/supabase";

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
    reign: z
      .array(
        z.object({
          id: z.number(),
          awarded_sp: z.number().nullable(),
          created_at: z.string(),
          misses: z.number().nullable(),
          mods: z.record(z.unknown()),
          passed: z.boolean().nullable(),
          songId: z.string().nullable(),
          speed: z.number().nullable(),
          spin: z.boolean(),
          beatmapHash: z.string().nullable(),
          beatmapTitle: z.string().nullable(),
          difficulty: z.number().nullable(),
          beatmapNotes: z.number().optional().nullable(),
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
  // parallel RPCs
  const [
    { data: lastDay, error: err1 },
    { data: topAndStats, error: err2 },
    { data: reign, error: err3 },
  ] = await Promise.all([
    supabase.rpc("get_user_scores_lastday", {
      userid: data.id,
      limit_param: data.limit,
    }),
    supabase.rpc("get_user_scores_top_and_stats", {
      userid: data.id,
      limit_param: data.limit,
    }),
    supabase.rpc("get_user_scores_reign", {
      userid: data.id,
    }),
  ]);

  const err = err1 || err2 || err3;
  if (err) {
    return NextResponse.json({ error: JSON.stringify(err) });
  }

  // Extract pieces from the { top, stats } object
  let top: unknown[] | undefined;
  let stats: { totalScores: number; spinScores: number } | undefined;

  if (topAndStats && typeof topAndStats === "object") {
    top = (topAndStats as any).top ?? [];
    stats = (topAndStats as any).stats;
  }

  try {
    await kv.put(
      `userscore:${data.id}`,
      JSON.stringify({
        lastDay: (lastDay as any) ?? [],
        top: (top as any) ?? [],
        stats,
        reign: (reign as any) ?? [],
      })
    );
  } catch (error) {}

  return NextResponse.json({
    lastDay: (lastDay as any) ?? [],
    top: (top as any) ?? [],
    stats,
    reign: (reign as any) ?? [],
  });
}
