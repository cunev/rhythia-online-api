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
    attempt: z.number(),
    created: z.number(),
    event_id: z.number(),
    data: z.strictObject({
      id: z.number(),
      amount: z.number(),
      object: z.enum(["membership"]),
      paused: z.enum(["true", "false"]),
      status: z.enum(["active", "inactive"]),
      canceled: z.enum(["true", "false"]),
      currency: z.string(),
      psp_id: z.string(),
      duration_type: z.enum(["month", "year"]),
      membership_level_id: z.number(),
      membership_level_name: z.string(),
      started_at: z.number(),
      canceled_at: z.string().nullable(),
      note_hidden: z.boolean(),
      support_note: z.string(),
      supporter_name: z.string(),
      supporter_id: z.number(),
      supporter_email: z.string(),
      current_period_end: z.number(),
      current_period_start: z.number(),
    }),
  }),
  output: z.object({
    error: z.string().optional(),
  }),
};

export async function POST(request: Request): Promise<NextResponse> {
  console.log(
    request.headers.getAll("Set-Cookie"),
    request.headers.get("X-BMC-Signature"),
    request.headers.get("X-Bmc-Signature")
  );
  if (process.env.ACCESS_BUCKET !== request.headers.get("X-BMC-Signature")) {
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
  return NextResponse.json({});
}
