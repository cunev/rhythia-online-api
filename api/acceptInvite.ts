import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";
import { getUserBySession } from "../utils/getUserBySession";
import { User } from "@supabase/supabase-js";
import short from "short-uuid";
import { error } from "console";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    code: z.string(),
  }),
  output: z.object({
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
  return NextResponse.json({ error: "Disabled" }, { status: 403 });
}
