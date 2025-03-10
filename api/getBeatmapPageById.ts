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
    scores: z
      .array(
        z.object({
          id: z.number(),
          awarded_sp: z.number().nullable(),
          created_at: z.string(), // Assuming Supabase returns timestamps as strings
          misses: z.number().nullable(),
          mods: z.record(z.unknown()), // JSONB data, can be any object
          passed: z.boolean().nullable(),
          replayHwid: z.string().nullable(),
          songId: z.string().nullable(),
          speed: z.number().nullable(),
          spin: z.boolean(),
          userId: z.number().nullable(),
          username: z.string().nullable(),
          avatar_url: z.string().nullable(),
        })
      )
      .optional(),
    beatmap: z
      .object({
        id: z.number().nullable().optional(),
        nominations: z.array(z.number()).nullable().optional(),
        playcount: z.number().nullable().optional(),
        created_at: z.string().nullable().optional(),
        updated_at: z.number().nullable().optional(),
        difficulty: z.number().nullable().optional(),
        noteCount: z.number().nullable().optional(),
        length: z.number().nullable().optional(),
        title: z.string().nullable().optional(),
        ranked: z.boolean().nullable().optional(),
        beatmapFile: z.string().nullable().optional(),
        image: z.string().nullable().optional(),
        starRating: z.number().nullable().optional(),
        owner: z.number().nullable().optional(),
        ownerUsername: z.string().nullable().optional(),
        ownerAvatar: z.string().nullable().optional(),
        status: z.string().nullable().optional(),
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
      *,
      beatmaps (
        created_at,
        playcount,
        length,
        ranked,
        beatmapFile,
        image,
        starRating,
        difficulty,
        noteCount,
        title
      ),
      profiles (
        username,
        avatar_url
      )
    `
    )
    .eq("latestBeatmapHash", data.mapId)
    .single();

  if (!beatmapPage) return NextResponse.json({});

  const { data: scoreData, error } = await supabase.rpc(
    "get_top_scores_for_beatmap",
    { beatmap_hash: beatmapPage?.latestBeatmapHash || "" }
  );

  if (error) {
    return NextResponse.json({ error: JSON.stringify(error) });
  }

  return NextResponse.json({
    scores: scoreData.map((score: any) => ({
      id: score.id,
      awarded_sp: score.awarded_sp,
      created_at: score.created_at,
      misses: score.misses,
      mods: score.mods,
      passed: score.passed,
      replayHwid: score.replayhwid,
      songId: score.songid,
      speed: score.speed,
      spin: score.spin,
      userId: score.userid,
      username: score.username,
      avatar_url: score.avatar_url,
    })),
    beatmap: {
      playcount: beatmapPage.beatmaps?.playcount,
      created_at: beatmapPage.created_at,
      updated_at: beatmapPage.updated_at,
      difficulty: beatmapPage.beatmaps?.difficulty,
      noteCount: beatmapPage.beatmaps?.noteCount,
      length: beatmapPage.beatmaps?.length,
      title: beatmapPage.beatmaps?.title,
      ranked: beatmapPage.beatmaps?.ranked,
      beatmapFile: beatmapPage.beatmaps?.beatmapFile,
      image: beatmapPage.beatmaps?.image,
      starRating: beatmapPage.beatmaps?.starRating,
      owner: beatmapPage.owner,
      ownerUsername: beatmapPage.profiles?.username,
      ownerAvatar: beatmapPage.profiles?.avatar_url,
      id: beatmapPage.id,
      status: beatmapPage.status,
      nominations: beatmapPage.nominations as number[],
    },
  });
}
