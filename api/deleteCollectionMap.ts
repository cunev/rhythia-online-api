import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";
import { getUserBySession } from "../utils/getUserBySession";
import { User } from "@supabase/supabase-js";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    collection: z.number(),
    beatmapPage: z.number(),
  }),
  output: z.object({
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
  const user = (await getUserBySession(data.session)) as User;
  let { data: queryUserData, error: userError } = await supabase
    .from("profiles")
    .select("*")
    .eq("uid", user.id)
    .single();

  if (!queryUserData) {
    return NextResponse.json({ error: "Can't find user" });
  }

  let { data: queryCollectionData, error: collectionError } = await supabase
    .from("beatmapCollections")
    .select("*")
    .eq("id", data.collection)
    .single();

  let { data: queryBeatmapData, error: beatmapData } = await supabase
    .from("beatmapPages")
    .select("*")
    .eq("id", data.beatmapPage)
    .single();

  if (!queryCollectionData) {
    return NextResponse.json({ error: "Can't find collection" });
  }

  if (!queryBeatmapData) {
    return NextResponse.json({ error: "Can't find beatmap page" });
  }

  if (queryCollectionData.owner !== queryUserData.id) {
    return NextResponse.json({ error: "You can't update foreign collections" });
  }

  await supabase
    .from("collectionRelations")
    .delete()
    .eq("beatmapPage", data.beatmapPage)
    .eq("collection", data.collection);

  return NextResponse.json({});
}
