import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";

const STORY_BEATMAPS = [
  { id: 7623, requiresHardrock: true },
  { id: 7031, requiresHardrock: false }
];

export const Schema = {
  input: z.strictObject({
    session: z.string(),
  }),
  output: z.object({
    error: z.string().optional(),
    beatmaps: z
      .array(
        z.object({
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
          requiresHardrock: z.boolean(),
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
  data: (typeof Schema)["input"]["_type"],
  req: Request
): Promise<NextResponse<(typeof Schema)["output"]["_type"]>> {
  const { data: beatmapPages, error } = await supabase
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
    .in("id", STORY_BEATMAPS.map(sb => sb.id));

  if (error) {
    return NextResponse.json({ error: JSON.stringify(error) });
  }

  const beatmaps =
    beatmapPages?.map((beatmapPage: any) => ({
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
      requiresHardrock: STORY_BEATMAPS.find(sb => sb.id === beatmapPage.id)?.requiresHardrock || false,
    })) || [];

  return NextResponse.json({
    beatmaps,
  });
}
