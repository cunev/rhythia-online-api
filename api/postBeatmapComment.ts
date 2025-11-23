import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";
import { User } from "@supabase/supabase-js";
import { getUserBySession } from "../utils/getUserBySession";
import { invalidateCache } from "../utils/cache";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    page: z.number(),
    content: z.string(),
  }),
  output: z.strictObject({
    error: z.string().optional(),
  }),
};

export async function POST(request: Request): Promise<NextResponse> {
  return protectedApi({
    request,
    schema: Schema,
    authorization: validUser,
    activity: handler,
  });
}

export async function handler({
  session,
  page,
  content,
}: (typeof Schema)["input"]["_type"]): Promise<
  NextResponse<(typeof Schema)["output"]["_type"]>
> {
  const user = (await getUserBySession(session)) as User;
  let { data: userData, error: userError } = await supabase
    .from("profiles")
    .select("*")
    .eq("uid", user.id)
    .single();

  if (!userData) return NextResponse.json({ error: "No user." });
  if (userData.ban !== "cool") return NextResponse.json({ error: "Error" });

  if (content.length > 256)
    return NextResponse.json({ error: "Comment exceeds length." });

  const upserted = await supabase
    .from("beatmapPageComments")
    .upsert({
      beatmapPage: page,
      owner: userData.id,
      content,
    })
    .select("*")
    .single();

  if (upserted.error?.message.length) {
    return NextResponse.json({ error: upserted.error.message });
  }

  await invalidateCache(`beatmap-comments:${page}`);

  return NextResponse.json({});
}
