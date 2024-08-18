import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";

export const Schema = {
  input: z
    .object({
      session: z.string(),
      page: z.number().optional(),
    })
    .strict(),
  output: z.object({
    error: z.string().optional(),
    total: z.number().optional(),
    leaderboard: z
      .array(
        z.object({
          flag: z.string().nullable(),
          id: z.number(),
          username: z.string().nullable(),
          play_count: z.number().nullable(),
          skill_points: z.number().nullable(),
          total_score: z.number().nullable(),
        })
      )
      .optional(),
  }),
};

export async function POST(res: Response): Promise<NextResponse> {
  return protectedApi({
    response: res,
    schema: Schema,
    authorization: validUser,
    activity: handler,
  });
}

export async function handler(
  data: (typeof Schema)["input"]["_type"]
): Promise<NextResponse<(typeof Schema)["output"]["_type"]>> {
  const range = [0, 100];
  if (data.page) {
    range[0] = 100 * data.page;
    range[1] = range[0] + 100;
  }

  const countQuery = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  let { data: queryData, error } = await supabase
    .from("profiles")
    .select("*")
    .order("skill_points", { ascending: false })
    .range(range[0], range[1]);

  return NextResponse.json({
    total: countQuery.count || 0,
    leaderboard: queryData?.map((user) => ({
      flag: user.flag,
      id: user.id,
      play_count: user.play_count,
      skill_points: user.skill_points,
      total_score: user.total_score,
      username: user.username,
    })),
  });
}
