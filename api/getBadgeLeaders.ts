import { NextResponse } from "next/server";
import z from "zod";
import { supabase } from "../utils/supabase";

export const Schema = {
  input: z.strictObject({
    limit: z.number().min(1).max(100).optional().default(100),
  }),
  output: z.object({
    leaderboard: z.array(
      z.object({
        id: z.number(),
        display_name: z.string(),
        avatar_url: z.string().nullable(),
        special_badge_count: z.number(),
      })
    ),
    total_count: z.number(),
    error: z.string().optional(),
  }),
};

export async function POST(request: Request): Promise<NextResponse> {
  return handler({ limit: 100 });
}

export async function handler({
  limit = 100,
}: {
  limit?: number;
}): Promise<NextResponse<(typeof Schema)["output"]["_type"]>> {
  try {
    const { data: leaderboard, error } = await supabase.rpc(
      "get_badge_leaderboard",
      {
        p_limit: limit,
      }
    );

    if (error) {
      console.error("Badge leaderboard error:", error);
      return NextResponse.json(
        {
          leaderboard: [],
          total_count: 0,
          error: "Failed to fetch badge leaderboard",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      leaderboard: leaderboard || [],
      total_count: leaderboard?.length || 0,
    });
  } catch (error) {
    console.error("Badge leaderboard exception:", error);
    return NextResponse.json(
      {
        leaderboard: [],
        total_count: 0,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
