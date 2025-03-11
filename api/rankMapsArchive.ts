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

  if (
    !(
      tags.includes("Bot") ||
      tags.includes("Admin") ||
      tags.includes("MMT") ||
      tags.includes("Developer")
    )
  ) {
    return NextResponse.json({ error: "Only management can force-rank maps!" });
  }

  const { data: mapData, error } = await supabase
    .from("beatmapPages")
    .select("id,nominations,owner,status")
    .eq("id", data.mapId)
    .eq("status", "UNRANKED");

  if (!mapData) {
    return NextResponse.json({ error: "Bad map" });
  }

  for (const element of mapData) {
    await supabase.from("beatmapPages").upsert({
      id: element.id,
      nominations: [queryUserData.id, queryUserData.id],
      status: "RANKED",
    });
  }

  return NextResponse.json({});
}
