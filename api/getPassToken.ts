import { NextResponse } from "next/server";
import z from "zod";
import { Database } from "../types/database";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";
import md5 from "md5";
import { encryptString } from "../utils/security";
export const Schema = {
  input: z.strictObject({
    data: z.object({
      email: z.string(),
      passkey: z.string(),
      computerName: z.string(),
    }),
  }),
  output: z.object({
    token: z.string().optional(),
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
  let { data: queryPasskey, error } = await supabase
    .from("passkeys")
    .select("*")
    .eq("email", data.data.email)
    .eq("passkey", data.data.passkey)
    .single();

  if (!queryPasskey) {
    return NextResponse.json({
      error: "Wrong combination",
    });
  }
  return NextResponse.json({
    token: encryptString(
      JSON.stringify({
        userId: queryPasskey.id,
        email: queryPasskey.email,
        passKey: queryPasskey.passkey,
        computerName: data.data.computerName,
      })
    ),
  });
}
