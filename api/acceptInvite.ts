import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";
import { getUserBySession } from "../utils/getUserBySession";
import { User } from "@supabase/supabase-js";
import short from "short-uuid";
import { error } from "console";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    code: z.string(),
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

  let { data: codeData } = await supabase
    .from("invites")
    .select("*")
    .eq("code", data.code)
    .single();

  if (!codeData || (codeData && codeData.used)) {
    return NextResponse.json({ error: "Can't find code, or used" });
  }

  if (codeData.type == "clan") {
    if (queryUserData.clan) {
      return NextResponse.json({
        error: "You can't join another clan while being in a clan",
      });
    }

    let { data: queryClanData, error: clanError } = await supabase
      .from("clans")
      .select("*")
      .eq("id", Number(codeData.resourceId))
      .single();

    if (!queryClanData) {
      return NextResponse.json({
        error: "No such clan",
      });
    }

    await supabase.from("profiles").upsert({
      id: queryUserData.id,
      clan: queryClanData?.id,
    });

    return NextResponse.json({});
  }

  return NextResponse.json({ error: "Unknown invite type" });
}
