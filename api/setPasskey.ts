import { NextResponse } from "next/server";
import z from "zod";
import { Database } from "../types/database";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";
import md5 from "md5";
import { getUserBySession } from "../utils/getUserBySession";
import { User } from "@supabase/supabase-js";
export const Schema = {
  input: z.strictObject({
    session: z.string(),
    data: z.object({
      passkey: z.string(),
    }),
  }),
  output: z.object({
    error: z.string().optional(),
  }),
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
  let userData: Database["public"]["Tables"]["profiles"]["Update"];
  // Find user's entry
  {
    let { data: queryUserData, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("uid", user.id);

    if (!queryUserData?.length) {
      return NextResponse.json(
        {
          error: "User cannot be retrieved from session",
        },
        { status: 404 }
      );
    }
    userData = queryUserData[0];
  }

  await supabase.from("passkeys").upsert({
    id: userData.id!,
    email: user.email!,
    passkey: md5(data.data.passkey),
  });

  return NextResponse.json({});
}
