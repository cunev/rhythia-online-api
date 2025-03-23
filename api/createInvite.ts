import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";
import { getUserBySession } from "../utils/getUserBySession";
import { User } from "@supabase/supabase-js";
import short from "short-uuid";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    type: z.string(),
    resourceId: z.string(),
  }),
  output: z.object({
    code: z.string().optional(),
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

  if (data.type !== "clan") {
    return NextResponse.json({
      error: "Invites can only be created for clans",
    });
  }

  let { data: clanQuery, error: clanError } = await supabase
    .from("clans")
    .select("*")
    .eq("id", queryUserData.clan || -1)
    .single();

  if (!clanQuery) {
    return NextResponse.json({
      error: "You're not in a clan",
    });
  }

  if (data.resourceId !== (clanQuery.owner || -1).toString()) {
    return NextResponse.json({
      error: "You can't create invite for a clan that you aren't owner of.",
    });
  }

  const invite = short.generate();

  const upsertResult = await supabase
    .from("invites")
    .upsert({
      code: invite,
      type: "clan",
      resourceId: data.resourceId,
    })
    .select();

  return NextResponse.json({ code: invite });
}
