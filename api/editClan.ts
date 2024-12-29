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
    name: z.string(),
    avatar_url: z.string(),
    description: z.string(),
    acronym: z.string(),
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

  let { data: queryClanData, error: clanError } = await supabase
    .from("clans")
    .select("*")
    .eq("id", data.id)
    .single();

  if (!queryClanData) {
    return NextResponse.json({ error: "No such clan ID" });
  }

  if (queryClanData.owner !== queryUserData.id) {
    return NextResponse.json({ error: "You are not the owner" });
  }

  if (queryUserData.ban !== "cool") {
    return NextResponse.json({
      error: "You are have an active ban, can't edit a clan.",
    });
  }

  if (data.name.length < 3 || data.name.length > 32) {
    return NextResponse.json({
      error: "Clan name must be between 3 and 32 characters.",
    });
  }

  if (data.acronym.length < 3 || data.acronym.length > 6) {
    return NextResponse.json({
      error: "Acronyms must be of length between 3 and 6",
    });
  }

  if (data.description.length > 24000) {
    return NextResponse.json({
      error: "Description length exceeds 24000 characters",
    });
  }

  await supabase.from("clans").upsert({
    id: data.id,
    name: data.name,
    avatar_url: data.avatar_url,
    description: data.description,
    acronym: data.acronym.toUpperCase(),
  });

  return NextResponse.json({});
}
