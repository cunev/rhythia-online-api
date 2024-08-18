import { NextResponse } from "next/server";
import z from "zod";
import { Database } from "../types/database";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";

export const Schema = {
  input: z.object({
    session: z.string(),
    id: z.number().optional(),
  }),
  output: z.object({
    error: z.string().optional(),
    user: z
      .object({
        about_me: z.string().nullable(),
        avatar_url: z.string().nullable(),
        badges: z.any().nullable(),
        created_at: z.number().nullable(),
        flag: z.string().nullable(),
        id: z.number(),
        uid: z.string().nullable(),
        username: z.string().nullable(),
        verified: z.boolean().nullable(),
        play_count: z.number().nullable(),
        skill_points: z.number().nullable(),
        squares_hit: z.number().nullable(),
        total_score: z.number().nullable(),
      })
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
  let profiles: Database["public"]["Tables"]["profiles"]["Row"][] = [];

  // Fetch by id
  if (data.id !== undefined) {
    let { data: queryData, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.id);

    console.log(profiles, error);

    if (!queryData?.length) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        { status: 404 }
      );
    }

    profiles = queryData;
  } else {
    // Fetch by session id
    const user = (await supabase.auth.getUser(data.session)).data.user!;

    let { data: queryData, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("uid", user.id);

    console.log(profiles, error);

    if (!queryData?.length) {
      return NextResponse.json(
        {
          error: "User cannot be retrieved from session",
        },
        { status: 404 }
      );
    }
  }

  const user = profiles[0];
  return NextResponse.json({
    user: {
      ...user,
    },
  });
}
