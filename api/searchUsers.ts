import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";

export const Schema = {
  input: z.strictObject({
    text: z.string(),
  }),
  output: z.object({
    error: z.string().optional(),
    results: z
      .array(
        z.object({
          id: z.number(),
          username: z.string().nullable(),
        })
      )
      .optional(),
  }),
};

export async function POST(request: Request) {
  return protectedApi({
    request,
    schema: Schema,
    authorization: () => {},
    activity: handler,
  });
}

export async function handler(data: (typeof Schema)["input"]["_type"]) {
  const { data: exactUser } = await supabase
    .from("profiles")
    .select("id,username")
    .neq("ban", "excluded")
    .eq("computedUsername", data.text.toLocaleLowerCase())
    .single();

  const { data: searchData, error } = await supabase
    .from("profiles")
    .select("id,username")
    .neq("ban", "excluded")
    .ilike("username", `%${data.text}%`)
    .limit(10);

  const conjoined = searchData || [];

  if (exactUser && !conjoined.some((user) => user.id === exactUser?.id)) {
    conjoined.unshift(exactUser);
  }

  return NextResponse.json({
    results: conjoined || [],
  });
}
