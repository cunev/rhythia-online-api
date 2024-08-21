import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    page: z.number().default(1),
  }),
  output: z.object({
    error: z.string().optional(),
    total: z.number(),
    viewPerPage: z.number(),
    currentPage: z.number(),
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

export async function POST(request: Request): Promise<NextResponse> {
  return protectedApi({
    request,
    schema: Schema,
    authorization: validUser,
    activity: handler,
  });
}

export async function handler(
  data: (typeof Schema)["input"]["_type"]
): Promise<NextResponse<(typeof Schema)["output"]["_type"]>> {
  const result = await getLeaderboard(data.page);
  return NextResponse.json(result);
}

const VIEW_PER_PAGE = 100;

export async function getLeaderboard(page = 1) {
  const startPage = (page - 1) * VIEW_PER_PAGE;
  const endPage = startPage + VIEW_PER_PAGE - 1;
  console.log(startPage, endPage);
  const countQuery = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  let { data: queryData, error } = await supabase
    .from("profiles")
    .select("*")
    .order("skill_points", { ascending: false })
    .range(startPage, endPage);

  return {
    total: countQuery.count || 0,
    viewPerPage: VIEW_PER_PAGE,
    currentPage: page,
    leaderboard: queryData?.map((user) => ({
      flag: user.flag,
      id: user.id,
      play_count: user.play_count,
      skill_points: user.skill_points,
      total_score: user.total_score,
      username: user.username,
    })),
  };
}
