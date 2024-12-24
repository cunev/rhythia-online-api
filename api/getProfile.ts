import { geolocation } from "@vercel/edge";
import { NextResponse } from "next/server";
import z from "zod";
import { Database } from "../types/database";
import { protectedApi } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";
import { getUserBySession } from "../utils/getUserBySession";
import { User } from "@supabase/supabase-js";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    id: z.number().nullable().optional(),
  }),
  output: z.object({
    error: z.string().optional(),
    user: z
      .object({
        about_me: z.string().nullable(),
        avatar_url: z.string().nullable(),
        profile_image: z.string().nullable(),
        badges: z.any().nullable(),
        created_at: z.number().nullable(),
        flag: z.string().nullable(),
        id: z.number(),
        uid: z.string().nullable(),
        ban: z.string().nullable(),
        username: z.string().nullable(),
        verified: z.boolean().nullable(),
        play_count: z.number().nullable(),
        skill_points: z.number().nullable(),
        squares_hit: z.number().nullable(),
        total_score: z.number().nullable(),
        position: z.number().nullable(),
        is_online: z.boolean(),
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
  let profiles: Database["public"]["Tables"]["profiles"]["Row"][] = [];
  let isOnline = false;
  // Fetch by id
  if (data.id !== undefined && data.id !== null) {
    let { data: queryData, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.id);

    console.log(profiles, error);

    if (!queryData?.length) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        { status: 404 }
      );
    }

    profiles = queryData;
  } else {
    // Fetch by session id
    const user = (await getUserBySession(data.session)) as User;

    if (user) {
      let { data: queryData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("uid", user.id);

      if (!queryData?.length) {
        const geo = geolocation(req);
        const data = await supabase
          .from("profiles")
          .upsert({
            uid: user.id,
            about_me: "",
            avatar_url:
              "https://rhthia-avatars.s3.eu-central-003.backblazeb2.com/user-avatar-1725309193296-72002e6b-321c-4f60-a692-568e0e75147d",
            badges: [],
            username: `${user.user_metadata.full_name.slice(0, 20)}${Math.round(
              Math.random() * 900000 + 100000
            )}`,
            computedUsername: `${user.user_metadata.full_name.slice(
              0,
              20
            )}${Math.round(Math.random() * 900000 + 100000)}`.toLowerCase(),
            flag: (geo.country || "US").toUpperCase(),
            created_at: Date.now(),
          })
          .select();

        profiles = data.data!;
      } else {
        profiles = queryData;
      }
    }
  }

  const user = profiles[0];

  const { data: activityData } = await supabase
    .from("profileActivities")
    .select("*")
    .eq("uid", user.uid || "")
    .single();

  //last 30 minutes
  if (activityData && activityData.last_activity) {
    isOnline = Date.now() - activityData.last_activity < 1800000;
  }

  // Query to count how many players have more skill points than the specific player
  const { count: playersWithMorePoints, error: rankError } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .neq("ban", "excluded")
    .gt("skill_points", user.skill_points);

  return NextResponse.json({
    user: {
      ...user,
      position: (playersWithMorePoints || 0) + 1,
      is_online: isOnline,
    },
  });
}
