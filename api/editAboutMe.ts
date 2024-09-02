import { NextResponse } from "next/server";
import z from "zod";
import { Database } from "../types/database";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";
export const Schema = {
  input: z.strictObject({
    session: z.string(),
    data: z.object({
      about_me: z.string().optional(),
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
    authorization: validUser,
    activity: handler,
  });
}

export async function handler(
  data: (typeof Schema)["input"]["_type"]
): Promise<NextResponse<(typeof Schema)["output"]["_type"]>> {
  if (!data.data.about_me) {
    return NextResponse.json(
      {
        error: "Missing body.",
      },
      { status: 404 }
    );
  }

  if (data.data.about_me.length > 500) {
    return NextResponse.json(
      {
        error: "Too long.",
      },
      { status: 404 }
    );
  }

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
    about_me: data.data.about_me,
  };

  const upsertResult = await supabase
    .from("profiles")
    .upsert(upsertPayload)
    .select();

  if (upsertResult.error) {
    return NextResponse.json(
      {
        error: "Can't update..",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({});
}
