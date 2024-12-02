import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";

export const Schema = {
  input: z.strictObject({}),
  output: z.object({
    profiles: z.number(),
    beatmaps: z.number(),
    scores: z.number(),
    lastBeatmaps: z.array(
      z.object({
        id: z.number().nullable().optional(),
        nominations: z.array(z.number()).nullable().optional(),
        playcount: z.number().nullable().optional(),
        created_at: z.string().nullable().optional(),
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
    ),
    topUsers: z.array(
      z.object({
        username: z.string(),
        id: z.number(),
        avatar_url: z.string(),
        skill_points: z.number(),
      })
    ),
    lastComments: z.array(
      z.object({
        owner: z.number(),
        content: z.string(),
        username: z.string(),
        beatmapTitle: z.string(),
        beatmapPage: z.number(),
      })
    ),
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
  const countProfilesQuery = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const countBeatmapsQuery = await supabase
    .from("beatmaps")
    .select("*", { count: "exact", head: true });

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
    .eq("status", "RANKED")
    .order("created_at", { ascending: false })
    .limit(4);

  let { data: topUsers } = await supabase
    .from("profiles")
    .select("*")
    .neq("ban", "excluded")
    .order("skill_points", { ascending: false })
    .limit(3);

  let { data: comments } = await supabase
    .from("beatmapPageComments")
    .select(
      `
      *,
      beatmapPages!inner(
        *
      ),
      profiles!inner(
        username
      )`
    )
    .order("created_at", { ascending: false })
    .limit(5);

  const countScoresQuery = await supabase
    .from("scores")
    .select("*", { count: "exact", head: true });

  return NextResponse.json({
    beatmaps: countBeatmapsQuery.count,
    profiles: countProfilesQuery.count,
    scores: countScoresQuery.count,
    lastBeatmaps: beatmapPage?.map((e) => ({
      playcount: e.beatmaps?.playcount,
      created_at: e.created_at,
      difficulty: e.beatmaps?.difficulty,
      noteCount: e.beatmaps?.noteCount,
      length: e.beatmaps?.length,
      title: e.beatmaps?.title,
      ranked: e.beatmaps?.ranked,
      beatmapFile: e.beatmaps?.beatmapFile,
      image: e.beatmaps?.image,
      starRating: e.beatmaps?.starRating,
      owner: e.owner,
      ownerUsername: e.profiles?.username,
      ownerAvatar: e.profiles?.avatar_url,
      id: e.id,
      status: e.status,
      nominations: e.nominations as number[],
    })),
    topUsers: topUsers?.map((e) => ({
      username: e.username,
      id: e.id,
      avatar_url: e.avatar_url,
      skill_points: e.skill_points,
    })),
    lastComments: comments?.map((e) => ({
      owner: e.owner,
      content: e.content,
      username: e.profiles.username,
      beatmapTitle: e.beatmapPages.title,
      beatmapPage: e.beatmapPages.id,
    })),
  });
}
