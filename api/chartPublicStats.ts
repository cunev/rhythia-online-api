import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";

export const Schema = {
  input: z.strictObject({}),
  output: z.object({}),
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
  // 30 minutes activity
  const countOnline = await supabase
    .from("profileActivities")
    .select("*", { count: "exact", head: true })
    .gt("last_activity", Date.now() - 1800000);

  await supabase.from("chartedValues").insert({
    type: "online_players",
    value: countOnline.count,
  });
  return NextResponse.json({});
}
