import { NOT_FOUND } from "http-status";
import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";

export const Schema = {
  input: z.object({
    session: z.string(),
    id: z.number(),
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
  let { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.id);

  console.log(profiles, error);

  if (!profiles?.length) {
    return NextResponse.json(
      {
        error: "User not found",
      },
      { status: NOT_FOUND }
    );
  }

  const user = profiles[0];
  return NextResponse.json({
    user: {
      ...user,
    },
  });
}
