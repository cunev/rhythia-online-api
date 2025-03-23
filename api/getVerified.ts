import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";
import { User } from "@supabase/supabase-js";
import { getUserBySession } from "../utils/getUserBySession";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
  }),
  output: z.strictObject({}),
};

export async function POST(request: Request): Promise<NextResponse> {
  return protectedApi({
    request,
    schema: Schema,
    authorization: () => {},
    activity: handler,
  });
}

export async function handler(
  data: (typeof Schema)["input"]["_type"]
): Promise<NextResponse<(typeof Schema)["output"]["_type"]>> {
  const user = (await getUserBySession(data.session)) as User;
  let { data: queryData, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("uid", user.id)
    .single();

  if (!queryData) {
    NextResponse.json({});
  }

  console.log("CHEATER: " + JSON.stringify(queryData));

  return NextResponse.json({});
}
