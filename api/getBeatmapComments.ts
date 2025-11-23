import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";
import { getCacheValue, setCacheValue } from "../utils/cache";
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
        profiles: z.object({
          avatar_url: z.string().nullable(),
          username: z.string().nullable(),
          badges: z.any().nullable(),
        }),
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
  const cacheKey = `beatmap-comments:${page}`;
  const cachedComments = await getCacheValue<
    (typeof Schema)["output"]["_type"]["comments"]
  >(cacheKey);

  if (cachedComments) {
    return NextResponse.json({ comments: cachedComments });
  }

  let { data: userData, error: userError } = await supabase
    .from("beatmapPageComments")
    .select(
      `
      *,
      profiles!inner(
          username,
          avatar_url,
          badges
        )
      `
    )
    .eq("beatmapPage", page);

  if (userData) {
    await setCacheValue(cacheKey, userData);
  }

  return NextResponse.json({ comments: userData! });
}
