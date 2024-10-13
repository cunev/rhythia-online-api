import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";

export const Schema = {
  input: z.strictObject({
    page: z.number(),
  }),
  output: z.strictObject({
    error: z.string().optional(),
    comments: z.array(
      z.object({
        beatmapPage: z.number(),
        content: z.string().nullable(),
        owner: z.number(),
        created_at: z.string(),
      })
    ),
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

export async function handler({
  page,
}: (typeof Schema)["input"]["_type"]): Promise<
  NextResponse<(typeof Schema)["output"]["_type"]>
> {
  let { data: userData, error: userError } = await supabase
    .from("beatmapPageComments")
    .select("*")
    .eq("beatmapPage", page);

  return NextResponse.json({ comments: userData! });
}
