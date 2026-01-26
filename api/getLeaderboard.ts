import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";
import { getUserBySession } from "../utils/getUserBySession";
import { User } from "@supabase/supabase-js";
import {
  getActivityStatusForUserId,
  getScoreActivityCutoffIso,
} from "../utils/activityStatus";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    page: z.number().default(1),
    flag: z.string().optional(),
    spin: z.boolean().default(false),
  }),
  output: z.object({
    error: z.string().optional(),
    total: z.number(),
    viewPerPage: z.number(),
    currentPage: z.number(),
    userPosition: z.number(),
    leaderboard: z
      .array(
        z.object({
          flag: z.string().nullable(),
          id: z.number(),
          avatar_url: z.string().nullable(),
          username: z.string().nullable(),
          play_count: z.number().nullable(),
          skill_points: z.number().nullable(),
          spin_skill_points: z.number().nullable(),
          total_score: z.number().nullable(),
          verified: z.boolean().nullable(),
          clans: z
            .object({
              id: z.number(),
              acronym: z.string(),
            })
            .optional()
            .nullable(),
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
  data: (typeof Schema)["input"]["_type"]
): Promise<NextResponse<(typeof Schema)["output"]["_type"]>> {
  const result = await getLeaderboard(
    data.page,
    data.session,
    data.spin,
    data.flag
  );
  return NextResponse.json(result);
}

const VIEW_PER_PAGE = 50;

export async function getLeaderboard(
  page = 1,
  session: string,
  spin: boolean,
  flag?: string
) {
  const cutoffIso = getScoreActivityCutoffIso();
  const getUserData = (await getUserBySession(session)) as User;

  let leaderPosition = 0;

  if (getUserData) {
    let { data: queryData, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("uid", getUserData.id)
      .single();

    if (queryData) {
      const activityStatus = await getActivityStatusForUserId(queryData.id);
      if (activityStatus === "active") {
        const { count: playersWithMorePoints } = await supabase
          .from("profiles")
          .select("id,scores!inner(id)", { count: "exact", head: true })
          .neq("ban", "excluded")
          .gte("scores.created_at", cutoffIso)
          .gt("skill_points", queryData.skill_points);

        leaderPosition = (playersWithMorePoints || 0) + 1;
      }
    }
  }

  const startPage = (page - 1) * VIEW_PER_PAGE;
  const endPage = startPage + VIEW_PER_PAGE - 1;
  let countQuery = supabase
    .from("profiles")
    .select("id,scores!inner(id)", { count: "exact", head: true })
    .neq("ban", "excluded")
    .gte("scores.created_at", cutoffIso);

  if (flag) {
    countQuery.eq("flag", flag);
  }

  const countResult = await countQuery;

  let query = supabase
    .from("profiles")
    .select("*,clans:clan(id, acronym),scores!inner(id)")
    .neq("ban", "excluded")
    .gte("scores.created_at", cutoffIso)
    .limit(1, { foreignTable: "scores" });

  if (flag) {
    query.eq("flag", flag);
  }

  if (spin) {
    query.order("spin_skill_points", { ascending: false });
  } else {
    query.order("skill_points", { ascending: false });
  }

  query.range(startPage, endPage);

  let { data: queryData, error } = await query;
  return {
    total: countResult.count || 0,
    viewPerPage: VIEW_PER_PAGE,
    currentPage: page,
    userPosition: leaderPosition,
    leaderboard: queryData?.map((user) => ({
      flag: user.flag,
      id: user.id,
      avatar_url: user.avatar_url,
      play_count: user.play_count,
      skill_points: user.skill_points,
      spin_skill_points: user.spin_skill_points,
      total_score: user.total_score,
      username: user.username,
      clans: user.clans as any,
      verified: user.verified,
    })),
  };
}
