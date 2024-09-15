import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    textFilter: z.string().optional(),
    page: z.number().default(1),
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
  const result = await getBeatmaps(
    data.page,
    data.session,
    data.textFilter || ""
  );
  return NextResponse.json(result);
}

const VIEW_PER_PAGE = 50;

export async function getBeatmaps(page = 1, session: string, filter: string) {
  const startPage = (page - 1) * VIEW_PER_PAGE;
  const endPage = startPage + VIEW_PER_PAGE - 1;
  const countQuery = await supabase
    .from("beatmapPages")
    .select("*", { count: "exact", head: true });

  let queryData;
  if (filter.length) {
    let { data: data, error } = await supabase
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
        )`
      )
      .order("created_at", { ascending: false })
      .ilike("beatmaps.title", `%${filter}%`)
      .range(startPage, endPage);

    queryData = data;
  } else {
    let { data: data, error } = await supabase
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
      )`
      )
      .order("created_at", { ascending: false })
      .range(startPage, endPage);
    queryData = data;
  }

  return {
    total: countQuery.count || 0,
    viewPerPage: VIEW_PER_PAGE,
    currentPage: page,
    beatmaps: queryData?.map((beatmapPage) => ({
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
