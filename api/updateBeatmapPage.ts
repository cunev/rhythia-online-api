import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    id: z.number(),
    beatmapHash: z.string(),
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
  beatmapHash,
  id,
}: (typeof Schema)["input"]["_type"]): Promise<
  NextResponse<(typeof Schema)["output"]["_type"]>
> {
  const user = (await supabase.auth.getUser(session)).data.user!;
  let { data: userData, error: userError } = await supabase
    .from("profiles")
    .select("*")
    .eq("uid", user.id)
    .single();

  let { data: pageData, error: pageError } = await supabase
    .from("beatmapPages")
    .select("*")
    .eq("id", id)
    .single();

  if (!userData) return NextResponse.json({ error: "No user." });
  if (userData.id !== pageData?.owner)
    return NextResponse.json({ error: "Non-authz user." });

  const upserted = await supabase
    .from("beatmapPages")
    .upsert({
      id,
      latestBeatmapHash: beatmapHash,
      owner: userData.id,
    })
    .select("*")
    .single();

  if (upserted.error?.message.length) {
    return NextResponse.json({ error: upserted.error.message });
  }
  return NextResponse.json({});
}
