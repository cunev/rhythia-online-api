import { NextResponse } from "next/server";
import z from "zod";
import { Database } from "../types/database";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";

export const Schema = {
  input: z.object({
    session: z.string(),
    data: z.object({
      avatar_url: z.string().optional(),
      about_me: z.string().optional(),
      username: z.string().optional(),
    }),
  }),
  output: z.object({
    error: z.string().optional(),
  }),
};

export async function POST(res: Response): Promise<NextResponse> {
  return protectedApi({
    response: res,
    schema: Schema,
    authorization: validUser,
    activity: handler,
  });
}

async function handler(
  data: (typeof Schema)["input"]["_type"]
): Promise<NextResponse<(typeof Schema)["output"]["_type"]>> {
  const user = (await supabase.auth.getUser(data.session)).data.user!;

  const upsertPayload: Database["public"]["Tables"]["profiles"]["Update"] = {
    uid: user.id,
    flag: "",
    ...data.data,
  };

  const upsertResult = await supabase
    .from("profiles")
    .upsert(upsertPayload)
    .select();

  return NextResponse.json({});
}
