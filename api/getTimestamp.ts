import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi } from "../utils/requestUtils";

export const Schema = {
  input: z.strictObject({}),
  output: z.object({
    time: z.number(),
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
  return NextResponse.json({ time: Date.now() });
}
