import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi } from "../utils/requestUtils";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    data: z.strictObject({
      token: z.string(),
      relayHwid: z.string(),
      songId: z.string(),
      noteResults: z.record(z.boolean()),
      triggers: z.array(z.array(z.number())),
      mapHash: z.string(),
      mapTitle: z.string(),
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
    authorization: () => {},
    activity: handler,
  });
}

export async function handler(
  data: (typeof Schema)["input"]["_type"]
): Promise<NextResponse<(typeof Schema)["output"]["_type"]>> {
  return NextResponse.json({});
}
