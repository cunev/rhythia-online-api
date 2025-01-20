import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";
import { getUserBySession } from "../utils/getUserBySession";
import { User } from "@supabase/supabase-js";
import { describe } from "node:test";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    collection: z.number(),
    title: z.string(),
    description: z.string(),
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

  if (!queryCollectionData) {
    return NextResponse.json({ error: "Can't find collection" });
  }

  if (queryCollectionData.owner !== queryUserData.id) {
    return NextResponse.json({ error: "You can't update foreign collections" });
  }

  if (data.title.length < 3) {
    return NextResponse.json({
      error: "Collection title should be longer than 3",
    });
  }

  if (data.description.length > 128) {
    return NextResponse.json({
      error: "Description too long",
    });
  }

  await supabase.from("beatmapCollections").upsert({
    id: data.collection,
    title: data.title,
    description: data.description,
    owner: queryUserData.id,
  });
  return NextResponse.json({});
}
