import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    id: z.number(),
    beatmapHash: z.string().optional(),
    tags: z.string().optional(),
    description: z.string().optional(),
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
  description,
  tags,
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

  let { data: beatmapData, error: bmPageError } = await supabase
    .from("beatmaps")
    .select("*")
    .eq("beatmapHash", beatmapHash || "")
    .single();

  if (!beatmapData && beatmapHash) {
    return NextResponse.json({ error: "No beatmap." });
  }

  if (userData.id !== pageData?.owner)
    return NextResponse.json({ error: "Non-authz user." });

  if (pageData?.status !== "UNRANKED")
    return NextResponse.json({ error: "Only unranked maps can be updated" });

  const upsertPayload = {
    id,
    latestBeatmapHash: beatmapHash ? beatmapHash : pageData.latestBeatmapHash,
    genre: "",
    status: "UNRANKED",
    owner: userData.id,
    description: description ? description : pageData.description,
    tags: tags ? tags : pageData.tags,
    nominations: [],
  };

  if (beatmapHash && beatmapData) {
    upsertPayload["title"] = beatmapData.title;
  }

  const upserted = await supabase
    .from("beatmapPages")
    .upsert(upsertPayload)
    .select("*")
    .single();

  if (upserted.error?.message.length) {
    return NextResponse.json({ error: upserted.error.message });
  }
  return NextResponse.json({});
}
