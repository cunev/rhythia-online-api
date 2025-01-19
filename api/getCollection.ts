import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    collection: z.number(),
  }),
  output: z.object({
    collection: z.object({
      title: z.string(),
      description: z.string(),
      beatmaps: z.array(
        z.object({
          id: z.number(),
          playcount: z.number().nullable().optional(),
          created_at: z.string().nullable().optional(),
          difficulty: z.number().nullable().optional(),
          length: z.number().nullable().optional(),
          title: z.string().nullable().optional(),
          ranked: z.boolean().nullable().optional(),
          beatmapFile: z.string().nullable().optional(),
          image: z.string().nullable().optional(),
          starRating: z.number().nullable().optional(),
          owner: z.number().nullable().optional(),
          ownerUsername: z.string().nullable().optional(),
          status: z.string().nullable().optional(),
          tags: z.string().nullable().optional(),
        })
      ),
    }),
    error: z.string().optional(),
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
  let { data: queryCollectionData, error: collectionError } = await supabase
    .from("beatmapCollections")
    .select("*")
    .eq("id", data.collection)
    .single();

  if (!queryCollectionData) {
    return NextResponse.json({ error: "Can't find collection" });
  }

  let { data: queryBeatmaps, error: beatmapsError } = await supabase
    .from("collectionRelations")
    .select(
      `
        *,
        beatmapPages!inner(
          owner,
          created_at,
          id,
          status,
          tags,
          beatmaps!inner(
            playcount,
            ranked,
            beatmapFile,
            image,
            starRating,
            difficulty,
            length,
            title
          ),
          profiles!inner(
            username
          )
        )
      `
    )
    .eq("collection", data.collection);

  const formattedBeatmaps =
    queryBeatmaps?.map((relation) => ({
      id: relation.beatmapPages.id,
      playcount: relation.beatmapPages.beatmaps.playcount,
      created_at: relation.beatmapPages.created_at,
      difficulty: relation.beatmapPages.beatmaps.difficulty,
      length: relation.beatmapPages.beatmaps.length,
      title: relation.beatmapPages.beatmaps.title,
      ranked: relation.beatmapPages.beatmaps.ranked,
      beatmapFile: relation.beatmapPages.beatmaps.beatmapFile,
      image: relation.beatmapPages.beatmaps.image,
      starRating: relation.beatmapPages.beatmaps.starRating,
      owner: relation.beatmapPages.owner,
      ownerUsername: relation.beatmapPages.profiles.username,
      status: relation.beatmapPages.status,
      tags: relation.beatmapPages.tags,
    })) || [];

  return NextResponse.json({
    collection: {
      title: queryCollectionData.title,
      description: queryCollectionData.description,
      beatmaps: formattedBeatmaps,
    },
  });
}
