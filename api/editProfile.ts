import { NextResponse } from "next/server";
import z from "zod";
import { Database } from "../types/database";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";
import { getUserBySession } from "../utils/getUserBySession";
import { User } from "@supabase/supabase-js";
import validator from "validator";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    data: z.object({
      avatar_url: z.string().optional(),
      profile_image: z.string().optional(),
      username: z.string().optional(),
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
  if (data.data.username !== undefined && data.data.username.length === 0) {
    return NextResponse.json(
      {
        error: "Username can't be empty",
      },
      { status: 404 }
    );
  }

  if (data.data.username && data.data.username.length > 20) {
    return NextResponse.json(
      {
        error: "Username too long.",
      },
      { status: 404 }
    );
  }

  if (validator.trim(data.data.username || "") !== (data.data.username || "")) {
    return NextResponse.json(
      {
        error: "Username can't start or end with spaces.",
      },
      { status: 404 }
    );
  }

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

  const upsertPayload: Database["public"]["Tables"]["profiles"]["Update"] = {
    id: userData.id,
    computedUsername: data.data.username?.toLowerCase(),
    ...data.data,
  };

  const upsertResult = await supabase
    .from("profiles")
    .upsert(upsertPayload)
    .select();

  if (upsertResult.error) {
    return NextResponse.json(
      {
        error: "Can't update, username might be used by someone else!",
      },
      { status: 404 }
    );
  }

  return NextResponse.json({});
}
