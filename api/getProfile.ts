import { NextResponse } from "next/server";
import z from "zod";
import { supabase } from "../utils/supabase";

export const Schema = {
  input: z.object({
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

export async function POST(
  res: Response
): Promise<NextResponse<(typeof Schema)["output"]["_type"]>> {
  const toParse = await res.json();
  const data = Schema.input.parse(toParse);
  let { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("column", data.id);

  if (!profiles?.length) {
    return NextResponse.json(
      {
        error: "User not found",
      },
      { status: 404 }
    );
  }

  const user = profiles[0];
  return NextResponse.json({
    user: {
      ...user,
    },
  });
}
