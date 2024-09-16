import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    textFilter: z.string().optional(),
    page: z.number().default(1),
    maxStars: z.number().optional(),
    minStars: z.number().optional(),
    creator: z.number().optional(),
    status: z.string().optional(),
  }),
  output: z.object({
    error: z.string().optional(),
    total: z.number(),
    viewPerPage: z.number(),
    currentPage: z.number(),
    beatmaps: z
      .array(
        z.object({
          id: z.number(),
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
        })
      )
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
  data: (typeof Schema)["input"]["_type"]
): Promise<NextResponse<(typeof Schema)["output"]["_type"]>> {
  const result = await getBeatmaps(data);
  return NextResponse.json(result);
}

const VIEW_PER_PAGE = 50;

export async function getBeatmaps(data: (typeof Schema)["input"]["_type"]) {
  const startPage = (data.page - 1) * VIEW_PER_PAGE;
  const endPage = startPage + VIEW_PER_PAGE - 1;
  const countQuery = await supabase
    .from("beatmapPages")
    .select("*", { count: "exact", head: true });

  let qry = supabase
    .from("beatmapPages")
    .select(
      `
        *,
        beatmaps!inner(
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
        profiles!inner(
          username,
          avatar_url
        )`
    )
    .order("created_at", { ascending: false });

  if (data.textFilter) {
    qry = qry.ilike("beatmaps.title", `%${data.textFilter}%`);
  }

  if (data.minStars) {
    qry = qry.gt("beatmaps.starRating", data.minStars);
  }

  if (data.maxStars) {
    qry = qry.lt("beatmaps.starRating", data.maxStars);
  }
  if (data.status) {
    qry = qry.eq("status", data.status);
  }

  if (data.creator) {
    qry = qry.eq("owner", data.creator);
  }

  let queryData = await qry.range(startPage, endPage);

  return {
    total: countQuery.count || 0,
    viewPerPage: VIEW_PER_PAGE,
    currentPage: data.page,
    beatmaps: queryData.data?.map((beatmapPage) => ({
      id: beatmapPage.id,
      playcount: beatmapPage.beatmaps?.playcount,
      created_at: beatmapPage.created_at,
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
    })),
  };
}
