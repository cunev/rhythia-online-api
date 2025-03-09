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

  if (data.resourceId !== queryUserData.clan?.toString()) {
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
    })
    .select();

  return NextResponse.json({ code: invite });
}
