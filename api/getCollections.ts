import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
  }),
  output: z.object({
    collections: z.array(
      z.object({
        id: z.number(),
        title: z.string(),
        description: z.string(),
        beatmapCount: z.number(),
        createdAt: z.string().nullable().optional(),
        updatedAt: z.string().nullable().optional(),
      })
    ),
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
  // First get all collections
  let { data: collections, error: collectionsError } = await supabase
    .from("beatmapCollections")
    .select(
      `
      *,
      collectionRelations!left(count)
    `
    )
    .returns<
      Array<{
        id: number;
        title: string;
        description: string;
        created_at: string | null;
        updated_at: string | null;
        collectionRelations: Array<{ count: number }>;
      }>
    >();

  if (collectionsError) {
    return NextResponse.json({ error: "Error fetching collections" });
  }

  const formattedCollections =
    collections?.map((collection) => ({
      id: collection.id,
      title: collection.title,
      description: collection.description,
      beatmapCount: collection.collectionRelations?.[0]?.count ?? 0,
      createdAt: collection.created_at,
      updatedAt: collection.updated_at,
    })) || [];

  return NextResponse.json({
    collections: formattedCollections,
  });
}
