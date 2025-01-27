import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";
import { getUserBySession } from "../utils/getUserBySession";
import { User } from "@supabase/supabase-js";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    id: z.number(),
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
  id,
}: (typeof Schema)["input"]["_type"]): Promise<
  NextResponse<(typeof Schema)["output"]["_type"]>
> {
  const user = (await getUserBySession(session)) as User;
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

  if (!pageData) return NextResponse.json({ error: "No beatmap." });

  let { data: beatmapData, error: bmPageError } = await supabase
    .from("beatmaps")
    .select("*")
    .eq("beatmapHash", pageData.latestBeatmapHash || "-1-1-1-1")
    .single();

  if (!userData) return NextResponse.json({ error: "No user." });
  if (!beatmapData) return NextResponse.json({ error: "No beatmap." });

  if (userData.id !== pageData.owner) {
    const isDev =
      (userData.badges as string[]).includes("Developer") ||
      (userData.badges as string[]).includes("Global Moderator");

    if (!isDev) return NextResponse.json({ error: "Non-authz user." });
  }

  if (pageData.status !== "UNRANKED")
    return NextResponse.json({ error: "Only unranked maps can be updated" });

  await supabase.from("beatmapPageComments").delete().eq("beatmapPage", id);
  await supabase.from("collectionRelations").delete().eq("beatmapPage", id);
  await supabase.from("beatmapPages").delete().eq("id", id);
  await supabase
    .from("beatmaps")
    .delete()
    .eq("beatmapHash", beatmapData.beatmapHash);

  return NextResponse.json({});
}
