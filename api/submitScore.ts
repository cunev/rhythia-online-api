import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    data: z.strictObject({
      token: z.string(),
      relayHwid: z.string(),
      songId: z.string(),
      misses: z.number(),
      hits: z.number(),
      mapHash: z.string(),
      mapNoteCount: z.number(),
      speed: z.number(),
    }),
  }),
  output: z.object({
    error: z.string().optional(),
  }),
};

function easeInExpoDeq(x: number) {
  return x === 0 ? 0 : Math.pow(2, 50 * x - 50);
}

export function calculatePerformancePoints(
  starRating: number,
  accuracy: number
) {
  return Math.round(
    Math.pow((starRating * easeInExpoDeq(accuracy) * 100) / 2, 2) / 1000
  );
}

export async function POST(request: Request): Promise<NextResponse> {
  return protectedApi({
    request,
    schema: Schema,
    authorization: validUser,
    activity: handler,
  });
}

export async function handler({
  data,
  session,
}: (typeof Schema)["input"]["_type"]): Promise<
  NextResponse<(typeof Schema)["output"]["_type"]>
> {
  const user = (await supabase.auth.getUser(session)).data.user!;

  let { data: userData, error: userError } = await supabase
    .from("profiles")
    .select("*")
    .eq("uid", user.id)
    .single();

  if (!userData)
    return NextResponse.json(
      {
        error: "User doesn't exist",
      },
      { status: 500 }
    );

  console.log(userData);
  let { data: beatmaps, error } = await supabase
    .from("beatmaps")
    .select("*")
    .eq("beatmapHash", data.mapHash)
    .single();

  let { data: beatmapPages, error: bpError } = await supabase
    .from("beatmapPages")
    .select("*")
    .eq("latestBeatmapHash", data.mapHash)
    .single();

  if (!beatmapPages) {
    return NextResponse.json(
      {
        error: "Map not submitted",
      },
      { status: 500 }
    );
  }

  if (!beatmaps) {
    return NextResponse.json(
      {
        error: "Map not submitted",
      },
      { status: 500 }
    );
  }

  if (beatmaps.noteCount !== data.mapNoteCount) {
    return NextResponse.json(
      {
        error: "Wrong map",
      },
      { status: 500 }
    );
  }

  await supabase.from("beatmaps").upsert({
    beatmapHash: data.mapHash,
    playcount: (beatmaps.playcount || 1) + 1,
  });

  const passed =
    data.misses == 0 && data.misses + data.hits == beatmaps.noteCount;
  const accurracy = data.hits / beatmaps.noteCount;
  let awarded_sp = 0;

  if (beatmaps.starRating) {
    awarded_sp = calculatePerformancePoints(
      data.speed * beatmaps.starRating,
      accurracy
    );
  }

  if (beatmapPages.status == "UNRANKED") {
    awarded_sp = 0;
  }

  console.log("p1");
  await supabase.from("scores").upsert({
    beatmapHash: data.mapHash,
    replayHwid: data.relayHwid,
    songId: data.songId,
    userId: userData.id,
    passed,
    misses: data.misses,
    awarded_sp: Math.round(awarded_sp * 100) / 100,
    speed: data.speed,
  });
  console.log("p2");

  let totalSp = 0;
  let { data: scores2, error: errorsp } = await supabase
    .from("scores")
    .select(`awarded_sp,beatmapHash`)
    .eq("userId", userData.id)
    .neq("awarded_sp", 0)
    .eq("passed", true)
    .order("awarded_sp", { ascending: false });

  if (scores2 == null) return NextResponse.json({ error: "No scores" });

  let hashMap: Record<string, number> = {};

  for (const score of scores2) {
    const { beatmapHash, awarded_sp } = score;

    if (!beatmapHash || !awarded_sp) continue;

    if (!hashMap[beatmapHash] || hashMap[beatmapHash] < awarded_sp) {
      hashMap[beatmapHash] = awarded_sp;
    }
  }
  let weight = 100;
  const values = Object.values(hashMap);
  values.sort((a, b) => b - a);

  for (const score of values) {
    totalSp += ((score || 0) * weight) / 100;
    weight -= 1;

    if (weight == 0) {
      break;
    }
  }

  await supabase.from("profiles").upsert({
    id: userData.id,
    play_count: (userData.play_count || 0) + 1,
    skill_points: Math.round(totalSp * 100) / 100,
    squares_hit: (userData.squares_hit || 0) + data.hits,
  });
  console.log("p3");

  return NextResponse.json({});
}
