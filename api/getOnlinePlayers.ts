import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";

const ONLINE_WINDOW_MS = 30 * 60 * 1000;

export const Schema = {
  input: z.strictObject({}),
  output: z.object({
    error: z.string().optional(),
    players: z.array(
      z.object({
        id: z.number(),
        name: z.string().nullable(),
        profilePictureUrl: z.string().nullable(),
      })
    ),
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
  _data: (typeof Schema)["input"]["_type"]
): Promise<NextResponse<(typeof Schema)["output"]["_type"]>> {
  const cutoff = Date.now() - ONLINE_WINDOW_MS;

  const { data: activityRows, error: activityError } = await supabase
    .from("profileActivities")
    .select("uid")
    .gt("last_activity", cutoff);

  if (activityError) {
    return NextResponse.json(
      { players: [], error: "Failed to load online players" },
      { status: 500 }
    );
  }

  const onlineUids = Array.from(
    new Set((activityRows || []).map((row) => row.uid).filter(Boolean))
  );

  if (!onlineUids.length) {
    return NextResponse.json({ players: [] });
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id,username,avatar_url,profile_image,skill_points")
    .in("uid", onlineUids)
    .neq("ban", "excluded")
    .order("skill_points", { ascending: false });

  if (profilesError) {
    return NextResponse.json(
      { players: [], error: "Failed to load online players" },
      { status: 500 }
    );
  }

  const players =
    profiles?.map((profile) => ({
      id: profile.id,
      name: profile.username,
      profilePictureUrl: profile.profile_image || profile.avatar_url,
    })) || [];

  return NextResponse.json({ players });
}
