import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    id: z.number(),
  }),
  output: z.object({
    error: z.string().optional(),
    acronym: z.string(),
    avatar_url: z.string(),
    created_at: z.number(),
    description: z.string(),
    id: z.number(),
    name: z.string(),
    owner: z.number(),
    users: z.array(
      z.object({
        about_me: z.string().nullable(),
        avatar_url: z.string().nullable(),
        profile_image: z.string().nullable(),
        badges: z.any().nullable(),
        created_at: z.number().nullable(),
        flag: z.string().nullable(),
        id: z.number(),
        uid: z.string().nullable(),
        ban: z.string().nullable(),
        username: z.string().nullable(),
        verified: z.boolean().nullable(),
        play_count: z.number().nullable(),
        skill_points: z.number().nullable(),
        squares_hit: z.number().nullable(),
        total_score: z.number().nullable(),
      })
    ),
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
  let { data: queryClanData, error: clanError } = await supabase
    .from("clans")
    .select("*")
    .eq("id", data.id)
    .single();

  if (!queryClanData) {
    return NextResponse.json({ error: "No such clan ID" });
  }

  let { data: queryUsers, error: usersError } = await supabase
    .from("profiles")
    .select("*")
    .eq("clan", queryClanData.id);

  return NextResponse.json({
    acronym: queryClanData.acronym,
    avatar_url: queryClanData.avatar_url,
    created_at: queryClanData.created_at,
    description: queryClanData.description,
    id: queryClanData.id,
    name: queryClanData.name,
    owner: queryClanData.owner,
    users: queryUsers,
  });
}
