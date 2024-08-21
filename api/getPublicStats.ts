import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";

export const Schema = {
  input: z.strictObject({
    text: z.string(),
  }),
  output: z.object({
    players: z.number(),
    beatmaps: z.number(),
    scores: z.number(),
  }),
};

export async function POST(request: Request) {
  return protectedApi({
    request,
    schema: Schema,
    authorization: () => {},
    activity: handler,
  });
}

export async function handler(data: (typeof Schema)["input"]["_type"]) {
  const countProfilesQuery = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const countBeatmapsQuery = await supabase
    .from("beatmaps")
    .select("*", { count: "exact", head: true });

  const countScoresQuery = await supabase
    .from("scores")
    .select("*", { count: "exact", head: true });

  return NextResponse.json({
    beatmaps: countBeatmapsQuery.count,
    profiles: countProfilesQuery.count,
    scores: countScoresQuery.count,
  });
}
