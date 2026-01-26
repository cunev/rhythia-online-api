import { NextResponse } from "next/server";
import z from "zod";
import { supabase } from "../utils/supabase";
import { getActiveProfileIdSet } from "../utils/activityStatus";

export const Schema = {
  input: z.strictObject({
    limit: z.number().min(1).max(100).optional().default(100),
    include_inactive: z.boolean().optional().default(false),
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
  let body: unknown = {};
  try {
    body = await request.json();
  } catch {}

  return handler(Schema.input.parse(body));
}

export async function handler({
  limit = 100,
  include_inactive = false,
}: {
  limit?: number;
  include_inactive?: boolean;
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

    const entries = leaderboard || [];

    if (include_inactive) {
      return NextResponse.json({
        leaderboard: entries,
        total_count: entries.length,
      });
    }

    const activeIds = await getActiveProfileIdSet(entries.map((entry) => entry.id));

    const filteredLeaderboard = entries.filter((entry) => activeIds.has(entry.id));

    return NextResponse.json({
      leaderboard: filteredLeaderboard,
      total_count: filteredLeaderboard.length,
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
