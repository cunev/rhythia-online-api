import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi } from "../utils/requestUtils";
import { rateMapNotes } from "../utils/star-calc";
import { calculatePerformancePoints } from "./submitScore";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    rawMap: z.string(),
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
  const notes = data.rawMap.split(",");
  notes.shift();

  const rawNotes = notes.map(
    (e) => e.split("|").map((e) => Number(e)) as [number, number, number]
  );
  const starRating = rateMapNotes(rawNotes);
  return NextResponse.json({
    beatmap: {
      starRating,
      rp: {
        "S---": calculatePerformancePoints((starRating * 1) / 1.35, 1),
        "S--": calculatePerformancePoints((starRating * 1) / 1.25, 1),
        "S-": calculatePerformancePoints((starRating * 1) / 1.15, 1),
        S: calculatePerformancePoints(starRating * 1, 1),
        "S+": calculatePerformancePoints(starRating * 1.15, 1),
        "S++": calculatePerformancePoints(starRating * 1.25, 1),
        "S+++": calculatePerformancePoints(starRating * 1.35, 1),
        "S++++": calculatePerformancePoints(starRating * 1.45, 1),
      },
    },
  });
}
