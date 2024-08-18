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

export async function handler(
  data: (typeof Schema)["input"]["_type"]
): Promise<NextResponse<(typeof Schema)["output"]["_type"]>> {
  const user = (await supabase.auth.getUser(data.session)).data.user!;
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

  const upsertPayload: Database["public"]["Tables"]["profiles"]["Update"] = {
    id: userData.id,
    ...data.data,
  };

  const upsertResult = await supabase
    .from("profiles")
    .upsert(upsertPayload)
    .select();

  if (upsertResult.status == 409) {
    return NextResponse.json(
      {
        error: "Can't update, username might be used by someone else!",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({});
}
