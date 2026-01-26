import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi } from "../utils/requestUtils";
import { getCacheValue, setCacheValue } from "../utils/cache";
import { supabase } from "../utils/supabase";
import { getActiveProfileIdSet } from "../utils/activityStatus";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    mapId: z.string(),
    limit: z.number().min(1).max(200).default(50),
  }),
  output: z.object({
    error: z.string().optional(),
    scores: z
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
        videoUrl: z.string().nullable(),
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
  const limit = data.limit ?? 50;

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

  const beatmapHash = beatmapPage?.latestBeatmapHash || "";
  const isCacheable =
    beatmapPage?.status === "RANKED" || beatmapPage?.status === "APPROVED";
  const cacheKey = `beatmap-scores:${beatmapHash}`;

  let scoreData: any[] | null = null;

  if (isCacheable && beatmapHash) {
    scoreData = await getCacheValue<any[]>(cacheKey);
  }

  if (!scoreData) {
    const { data: rpcScores, error } = await supabase.rpc(
      "get_top_scores_for_beatmap",
      { beatmap_hash: beatmapHash }
    );

    if (error) {
      return NextResponse.json({ error: JSON.stringify(error) });
    }

    scoreData = (rpcScores || []).slice(0, 200);

    if (isCacheable && beatmapHash) {
      await setCacheValue(cacheKey, scoreData);
    }
  }

  const userIds = Array.from(
    new Set((scoreData || []).map((score) => score.userid).filter(Boolean))
  );
  const activeUserIds = await getActiveProfileIdSet(userIds);
  const visibleScores = (scoreData || [])
    .filter((score) => activeUserIds.has(score.userid))
    .slice(0, limit);

  return NextResponse.json({
    scores: visibleScores.map((score: any) => ({
      id: score.id,
      awarded_sp: score.awarded_sp,
      created_at: score.created_at,
      misses: score.misses,
      mods: score.mods,
      passed: score.passed,
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
      videoUrl: beatmapPage.video_url,
    },
  });
}
