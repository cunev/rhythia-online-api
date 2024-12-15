import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    mapId: z.string(),
  }),
  output: z.object({
    error: z.string().optional(),
    beatmap: z
      .object({
        starRating: z.number().nullable().optional(),
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
  let { data: beatmapPage, error: errorlast } = await supabase
    .from("beatmapPages")
    .select(
      `
      beatmaps (
        starRating
      )
    `
    )
    .eq("latestBeatmapHash", data.mapId)
    .single();

  if (!beatmapPage) return NextResponse.json({});

  return NextResponse.json({
    beatmap: {
      starRating: beatmapPage.beatmaps?.starRating,
    },
  });
}
