import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";

export const Schema = {
  input: z.object({
    session: z.string(),
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

async function handler(
  data: (typeof Schema)["input"]["_type"]
): Promise<NextResponse<(typeof Schema)["output"]["_type"]>> {
  return NextResponse.json({});
}
