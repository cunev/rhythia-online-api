import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";
import { getUserBySession } from "../utils/getUserBySession";
import { User } from "@supabase/supabase-js";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    name: z.string(),
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

  if (queryUserData.clan !== null) {
    return NextResponse.json({
      error: "You can't create clans while in a clan.",
    });
  }

  if (queryUserData.ban !== "cool") {
    return NextResponse.json({
      error: "You are have an active ban, can't create a clan.",
    });
  }

  if (data.name.length < 3 || data.name.length > 20) {
    return NextResponse.json({
      error: "Clan name must be between 3 and 20 characters.",
    });
  }

  await supabase.from("clans").upsert({
    name: data.name,
    owner: queryUserData.id,
  });

  return NextResponse.json({});
}
