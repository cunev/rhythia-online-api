import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";

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
  const user = (await supabase.auth.getUser(data.session)).data.user!;
  let { data: queryUserData, error: userError } = await supabase
    .from("profiles")
    .select("*")
    .eq("uid", user.id)
    .single();

  if (!queryUserData) {
    return NextResponse.json({ error: "Can't find user" });
  }

  const tags = (queryUserData?.badges || []) as string[];

  if (!tags.includes("MMT")) {
    return NextResponse.json({ error: "Only MMTs can approve maps!" });
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
    return NextResponse.json({ error: "Can't approve own map" });
  }

  if ((mapData.nominations as number[])!.length < 2) {
    return NextResponse.json({
      error: "Maps can get approved only if they have 2 approvals",
    });
  }

  if ((mapData.nominations as number[]).includes(queryUserData.id)) {
    return NextResponse.json({
      error: "Can't nominate and approve",
    });
  }

  await supabase.from("beatmapPages").upsert({
    id: data.mapId,
    status: "RANKED",
  });

  return NextResponse.json({});
}
