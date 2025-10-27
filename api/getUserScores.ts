import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    id: z.number(),
    limit: z.number().default(10),
  }),
  output: z.object({
    error: z.string().optional(),
    lastDay: z
      .array(
        z.object({
          awarded_sp: z.number().nullable(),
          beatmapHash: z.string().nullable(),
          created_at: z.string(),
          id: z.number(),
          misses: z.number().nullable(),
          passed: z.boolean().nullable(),
          songId: z.string().nullable(),
          userId: z.number().nullable(),
          beatmapDifficulty: z.number().optional().nullable(),
          beatmapNotes: z.number().optional().nullable(),
          beatmapTitle: z.string().optional().nullable(),
          speed: z.number().optional().nullable(),
          spin: z.boolean().optional().nullable(),
        })
      )
      .optional(),
    reign: z
      .array(
        z.object({
          id: z.number(),
          awarded_sp: z.number().nullable(),
          created_at: z.string(),
          misses: z.number().nullable(),
          mods: z.record(z.unknown()),
          passed: z.boolean().nullable(),
          songId: z.string().nullable(),
          speed: z.number().nullable(),
          spin: z.boolean(),
          beatmapHash: z.string().nullable(),
          beatmapTitle: z.string().nullable(),
          difficulty: z.number().nullable(),
          beatmapNotes: z.number().optional().nullable(),
        })
      )
      .optional(),
    top: z
      .array(
        z.object({
          awarded_sp: z.number().nullable(),
          beatmapHash: z.string().nullable(),
          created_at: z.string(),
          id: z.number(),
          misses: z.number().nullable(),
          passed: z.boolean().nullable(),
          rank: z.string().nullable(),
          songId: z.string().nullable(),
          userId: z.number().nullable(),
          beatmapDifficulty: z.number().optional().nullable(),
          beatmapNotes: z.number().optional().nullable(),
          beatmapTitle: z.string().optional().nullable(),
          speed: z.number().optional().nullable(),
          spin: z.boolean().optional().nullable(),
        })
      )
      .optional(),
    stats: z
      .object({
        totalScores: z.number(),
        spinScores: z.number(),
      })
      .optional(),
  }),
};

export async function POST(request: Request): Promise<NextResponse> {
  return protectedApi({
    request,
    schema: Schema,
    authorization: () => {},
    activity: handler,
  });
}

export async function handler(
  data: (typeof Schema)["input"]["_type"],
  req: Request
): Promise<NextResponse<(typeof Schema)["output"]["_type"]>> {
  // Call the RPC created earlier
  const { data: result, error } = await supabase.rpc(
    "get_user_scores_payload",
    {
      userid: data.id,
      limit_param: data.limit,
    }
  );

  if (error) {
    return NextResponse.json({ error: JSON.stringify(error) });
  }

  if (!result) {
    return NextResponse.json({ error: "No data returned" });
  }

  // The RPC may return { error: "..." } as a JSON object
  if (typeof result === "object" && result !== null && "error" in result) {
    return NextResponse.json({ error: String((result as any).error) });
  }

  // Trust the RPC's JSON shape to match Schema.output
  const typedResult = result as (typeof Schema)["output"]["_type"];
  return NextResponse.json(typedResult);
}
