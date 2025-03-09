import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";
import { getUserBySession } from "../utils/getUserBySession";
import { User } from "@supabase/supabase-js";

export const Schema = {
  input: z.strictObject({
    page: z.number(),
    session: z.any(),
  }),
  output: z.object({
    clanData: z.array(
      z.object({
        id: z.number(),
        name: z.string(),
        acronym: z.string().nullable(),
        avatar_url: z.string().nullable(),
        description: z.string().nullable(),
        member_count: z.number(),
        total_skill_points: z.number(),
        total_pages: z.number(),
      })
    ),
    error: z.string().optional(),
  }),
};

export async function POST(request: Request) {
  return protectedApi({
    request,
    schema: Schema,
    authorization: validUser,
    activity: handler,
  });
}

export async function handler(data: (typeof Schema)["input"]["_type"]) {
  const { data: clanData, error } = await supabase.rpc("get_clan_leaderboard", {
    page_number: data.page,
    items_per_page: 25,
  });
  return NextResponse.json({ clanData, error });
}
