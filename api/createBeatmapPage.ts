import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";
import { getUserBySession } from "../utils/getUserBySession";
import { User } from "@supabase/supabase-js";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
  }),
  output: z.strictObject({
    error: z.string().optional(),
    id: z.number().optional(),
  }),
};

export async function POST(request: Request): Promise<NextResponse> {
  return protectedApi({
    request,
    schema: Schema,
    authorization: validUser,
    activity: handler,
  });
}

export async function handler({
  session,
}: (typeof Schema)["input"]["_type"]): Promise<
  NextResponse<(typeof Schema)["output"]["_type"]>
> {
  const user = (await getUserBySession(session)) as User;
  let { data: userData, error: userError } = await supabase
    .from("profiles")
    .select("*")
    .eq("uid", user.id)
    .single();

  if (!userData) return NextResponse.json({ error: "No user." });

  if (
    userData.ban == "excluded" ||
    userData.ban == "restricted" ||
    userData.ban == "silenced"
  ) {
    return NextResponse.json(
      {
        error:
          "Silenced, restricted or excluded players can't update their profile.",
      },
      { status: 404 }
    );
  }

  const upserted = await supabase
    .from("beatmapPages")
    .upsert({
      owner: userData.id,
    })
    .select("*")
    .single();
  return NextResponse.json({ id: upserted.data?.id });
}
