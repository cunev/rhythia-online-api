import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";
import { getUserBySession } from "../utils/getUserBySession";
import { User } from "@supabase/supabase-js";
import { getScoreActivityCutoffIso } from "../utils/activityStatus";
import { getCacheValue, setCacheValue } from "../utils/cache";
import { LEADERBOARD_CACHE_INVALIDATE_KEY } from "../utils/leaderboardCache";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    page: z.number().default(1),
    flag: z.string().optional(),
    spin: z.boolean().default(false),
    include_inactive: z.boolean().optional().default(false),
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
    data.flag,
    data.include_inactive
  );
  return NextResponse.json(result);
}

const VIEW_PER_PAGE = 50;
const CACHE_TTL_MS = 4 * 60 * 1000;

export async function getLeaderboard(
  page = 1,
  session: string,
  spin: boolean,
  flag?: string,
  includeInactive = false
) {
  const cutoffIso = getScoreActivityCutoffIso();
  const userPromise = getUserBySession(session) as Promise<User | null>;
  const invalidateAtPromise = getCacheValue<number>(
    LEADERBOARD_CACHE_INVALIDATE_KEY
  );

  const startPage = (page - 1) * VIEW_PER_PAGE;
  const endPage = startPage + VIEW_PER_PAGE - 1;
  const cacheKey = `leaderboard:page=${page}:spin=${spin ? 1 : 0}:flag=${
    flag || "all"
  }:include_inactive=${includeInactive ? 1 : 0}`;
  const cachedPagePromise = getCacheValue<{
    cachedAt: number;
    total: number;
    leaderboard: (typeof Schema)["output"]["_type"]["leaderboard"];
  }>(cacheKey);

  const [user, invalidateAt, cachedPage] = await Promise.all([
    userPromise,
    invalidateAtPromise,
    cachedPagePromise,
  ]);

  const cutoffInvalidation = invalidateAt || 0;
  const now = Date.now();
  const cacheFresh = Boolean(
    cachedPage &&
      cachedPage.cachedAt >= cutoffInvalidation &&
      now - cachedPage.cachedAt < CACHE_TTL_MS
  );

  const pageDataPromise = (async () => {
    if (cachedPage && cacheFresh) {
      return cachedPage;
    }

    let countQuery;
    let query;

    if (includeInactive) {
      countQuery = supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .neq("ban", "excluded");

      query = supabase
        .from("profiles")
        .select(
          "flag,id,avatar_url,username,play_count,skill_points,spin_skill_points,total_score,verified,clans:clan(id, acronym)"
        )
        .neq("ban", "excluded");
    } else {
      countQuery = supabase
        .from("profiles")
        .select("id,scores!inner(id)", { count: "exact", head: true })
        .neq("ban", "excluded")
        .gte("scores.created_at", cutoffIso);

      query = supabase
        .from("profiles")
        .select(
          "flag,id,avatar_url,username,play_count,skill_points,spin_skill_points,total_score,verified,clans:clan(id, acronym),scores!inner(id)"
        )
        .neq("ban", "excluded")
        .gte("scores.created_at", cutoffIso)
        .limit(1, { foreignTable: "scores" });
    }

    if (flag) {
      countQuery.eq("flag", flag);
      query.eq("flag", flag);
    }

    if (spin) {
      query.order("spin_skill_points", { ascending: false });
    } else {
      query.order("skill_points", { ascending: false });
    }

    query.range(startPage, endPage);

    const [countQueryResult, { data: queryData }] = await Promise.all([
      countQuery,
      query,
    ]);

    const leaderboard = queryData?.map((user) => ({
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
    }));

    const data = {
      cachedAt: Date.now(),
      total: countQueryResult.count || 0,
      leaderboard,
    };

    await setCacheValue(cacheKey, data);

    return data;
  })();

  const leaderPositionPromise = (async () => {
    if (!user) return 0;

    const posCacheKey = `leaderboard:userPosition:uid=${user.id}:include_inactive=${
      includeInactive ? 1 : 0
    }`;

    const cachedPosition = await getCacheValue<{
      cachedAt: number;
      position: number;
    }>(posCacheKey);

    const positionCacheFresh =
      cachedPosition &&
      cachedPosition.cachedAt >= cutoffInvalidation &&
      now - cachedPosition.cachedAt < CACHE_TTL_MS;

    if (positionCacheFresh) {
      return cachedPosition.position;
    }

    if (includeInactive) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id,skill_points")
        .eq("uid", user.id)
        .maybeSingle();

      if (!profile) return 0;

      const { count: playersWithMorePoints } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .neq("ban", "excluded")
        .gt("skill_points", profile.skill_points);

      const position = (playersWithMorePoints || 0) + 1;
      await setCacheValue(posCacheKey, { cachedAt: Date.now(), position });
      return position;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id,skill_points,scores!inner(id)")
      .eq("uid", user.id)
      .gte("scores.created_at", cutoffIso)
      .limit(1, { foreignTable: "scores" })
      .maybeSingle();

    if (!profile) return 0;

    const { count: playersWithMorePoints } = await supabase
      .from("profiles")
      .select("id,scores!inner(id)", { count: "exact", head: true })
      .neq("ban", "excluded")
      .gte("scores.created_at", cutoffIso)
      .gt("skill_points", profile.skill_points);

    const position = (playersWithMorePoints || 0) + 1;
    await setCacheValue(posCacheKey, { cachedAt: Date.now(), position });
    return position;
  })();

  const [pageData, leaderPosition] = await Promise.all([
    pageDataPromise,
    leaderPositionPromise,
  ]);

  return {
    total: pageData.total,
    viewPerPage: VIEW_PER_PAGE,
    currentPage: page,
    userPosition: leaderPosition,
    leaderboard: pageData.leaderboard,
  };
}
