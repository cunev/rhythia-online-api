import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";
import { getUserBySession } from "../utils/getUserBySession";
import { User } from "@supabase/supabase-js";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    mapId: z.number(),
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

  const tags = (queryUserData?.badges || []) as string[];

  if (!tags.includes("RCT")) {
    return NextResponse.json({ error: "Only RCTs can nominate maps!" });
  }

  const { data: mapData, error } = await supabase
    .from("beatmapPages")
    .select("id,nominations,owner")
    .eq("id", data.mapId)
    .single();

  if (!mapData) {
    return NextResponse.json({ error: "Bad map" });
  }

  if (mapData.owner == queryUserData.id) {
    return NextResponse.json({ error: "Can't nominate own map" });
  }

  if ((mapData.nominations as number[]).includes(queryUserData.id)) {
    return NextResponse.json({ error: "Already nominated" });
  }

  const newNominations = [
    ...(mapData.nominations! as number[]),
    queryUserData.id,
  ];
  if (newNominations.length == 2) {
    await supabase.from("beatmapPages").upsert({
      id: data.mapId,
      nominations: newNominations,
      status: "RANKED",
      ranked_at: Date.now(),
    });
  } else {
    await supabase.from("beatmapPages").upsert({
      id: data.mapId,
      nominations: newNominations,
    });
  }

  return NextResponse.json({});
}
