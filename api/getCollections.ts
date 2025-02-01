import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    page: z.number().optional().default(1),
    itemsPerPage: z.number().optional().default(10),
    owner: z.number().optional(), // Added owner field
  }),
  output: z.object({
    collections: z.array(
      z.object({
        id: z.number(),
        title: z.string(),
        description: z.string(),
        owner: z.number(),
        ownerUsername: z.string(),
        ownerAvatarUrl: z.string(),
        beatmapCount: z.number(),
        starRatingDistribution: z.array(
          z.object({
            stars: z.number(),
            count: z.number(),
          })
        ),
        createdAt: z.string(),
      })
    ),
    totalPages: z.number(),
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
  const { data: collections, error } = await supabase
    .rpc("get_collections_v3", {
      page_number: data.page,
      items_per_page: data.itemsPerPage,
      owner_filter: data.owner || undefined, // Added owner_filter parameter
    })
    .returns<
      {
        id: number;
        title: string;
        description: string;
        created_at: string;
        owner: number;
        owner_username: string;
        owner_avatar_url: string;
        beatmap_count: number;
        star1: number;
        star2: number;
        star3: number;
        star4: number;
        star5: number;
        star6: number;
        star7: number;
        star8: number;
        star9: number;
        star10: number;
        star11: number;
        star12: number;
        star13: number;
        star14: number;
        star15: number;
        star16: number;
        star17: number;
        star18: number;
        total_pages: number;
      }[]
    >();

  if (error) {
    return NextResponse.json({ error });
  }

  // Get the total pages from the first row (all rows will have the same value)
  const totalPages = collections?.[0]?.total_pages ?? 1;

  const formattedCollections =
    collections?.map((collection) => ({
      id: collection.id,
      title: collection.title,
      description: collection.description,
      owner: collection.owner,
      ownerUsername: collection.owner_username,
      ownerAvatarUrl: collection.owner_avatar_url,
      beatmapCount: collection.beatmap_count,
      starRatingDistribution: [
        { stars: 1, count: collection.star1 },
        { stars: 2, count: collection.star2 },
        { stars: 3, count: collection.star3 },
        { stars: 4, count: collection.star4 },
        { stars: 5, count: collection.star5 },
        { stars: 6, count: collection.star6 },
        { stars: 7, count: collection.star7 },
        { stars: 8, count: collection.star8 },
        { stars: 9, count: collection.star9 },
        { stars: 10, count: collection.star10 },
        { stars: 11, count: collection.star11 },
        { stars: 12, count: collection.star12 },
        { stars: 13, count: collection.star13 },
        { stars: 14, count: collection.star14 },
        { stars: 15, count: collection.star15 },
        { stars: 16, count: collection.star16 },
        { stars: 17, count: collection.star17 },
        { stars: 18, count: collection.star18 },
      ],
      createdAt: collection.created_at,
    })) || [];

  return NextResponse.json({
    collections: formattedCollections,
    totalPages,
  });
}
