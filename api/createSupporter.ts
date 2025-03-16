import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";

export const Schema = {
  input: z.strictObject({
    type: z.enum([
      "membership.started",
      "membership.ended",
      "membership.updated",
    ]),
    live_mode: z.boolean(),
    attempt: z.number().nullable(),
    created: z.number().nullable(),
    event_id: z.number().nullable(),
    data: z.object({
      id: z.number().nullable(),
      amount: z.number().nullable(),
      object: z.enum(["membership"]).nullable(),
      paused: z.enum(["true", "false"]).nullable(),
      status: z.enum(["active", "inactive"]).nullable(),
      canceled: z.enum(["true", "false"]).nullable(),
      currency: z.string().nullable(),
      psp_id: z.string().nullable(),
      duration_type: z.enum(["month", "year"]).nullable(),
      membership_level_id: z.number().nullable(),
      membership_level_name: z.string().nullable(),
      started_at: z.number().nullable(),
      canceled_at: z.string().nullable(),
      note_hidden: z.boolean().nullable(),
      support_note: z.string().nullable(),
      supporter_name: z.string().nullable(),
      supporter_id: z.number().nullable(),
      supporter_email: z.string().nullable(),
      current_period_end: z.number().nullable(),
      current_period_start: z.number().nullable(),
      supporter_feedback: z.any(),
    }),
  }),
  output: z.object({
    error: z.string().optional(),
  }),
};

export async function POST(request: Request): Promise<NextResponse> {
  const sig = request.url.split("key=")[1];
  if (process.env.BUY_SECRET !== sig) {
    return NextResponse.json({
      error: "Invalid Signature",
    });
  }
  return protectedApi({
    request,
    schema: Schema,
    authorization: () => {},
    activity: handler,
  });
}

export async function handler(
  data: (typeof Schema)["input"]["_type"],
  request: Request
): Promise<NextResponse<(typeof Schema)["output"]["_type"]>> {
  let username = "";

  if (
    !(data.type === "membership.started" || data.type === "membership.updated")
  ) {
    return NextResponse.json({
      error: "Invalid type",
    });
  }

  if (data.data.status !== "active") {
    return NextResponse.json({
      error: "Inactive",
    });
  }

  if (data.data.supporter_name) {
    username = data.data.supporter_name;
  }

  if (data.data.support_note) {
    username = data.data.support_note;
  }

  if (data.data.membership_level_name !== "Supporter") {
    return NextResponse.json({
      error: "Invalid membership",
    });
  }

  const endDate = (data.data.current_period_end || 0) * 1000;

  let { data: queryData, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("computedUsername", username.toLowerCase())
    .single();

  if (!queryData) {
    return NextResponse.json({
      error: "No such player",
    });
  }

  const upsertResult = await supabase
    .from("profiles")
    .upsert({
      id: queryData.id,
      verificationDeadline: endDate,
      verified: true,
    })
    .select();

  return NextResponse.json({});
}
