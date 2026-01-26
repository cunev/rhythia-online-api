import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";
import { getScoreActivityCutoffIso } from "../utils/activityStatus";

export const Schema = {
  input: z.strictObject({
    badge: z.string(),
  }),
  output: z.object({
    error: z.string().optional(),
    leaderboard: z
      .array(
        z.object({
          flag: z.string().nullable(),
          id: z.number(),
          username: z.string().nullable(),
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
  const result = await getLeaderboard(data.badge);
  return NextResponse.json(result);
}

export async function getLeaderboard(badge: string) {
  const cutoffIso = getScoreActivityCutoffIso();
  let { data: queryData, error } = await supabase
    .from("profiles")
    .select("flag,id,username,badges,scores!inner(id)")
    .gte("scores.created_at", cutoffIso)
    .limit(1, { foreignTable: "scores" });

  const users = queryData?.filter((e) =>
    ((e.badges || []) as string[]).includes(badge)
  );

  return {
    leaderboard: users?.map((user) => ({
      flag: user.flag,
      id: user.id,
      username: user.username,
    })),
  };
}
