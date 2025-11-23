import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";
import { decryptString } from "../utils/security";
import { isEqual } from "lodash";
import { getUserBySession } from "../utils/getUserBySession";
import { User } from "@supabase/supabase-js";
import { invalidateCache } from "../utils/cache";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    version: z.string().optional(),
    data: z.strictObject({
      token: z.string(),
      relayHwid: z.string(),
      songId: z.string(),
      misses: z.number(),
      hits: z.number(),
      mapHash: z.string(),
      speed: z.number(),
      mods: z.array(z.string()),
      additionalData: z.any(),
      spin: z.boolean(),
      virtualStars: z.number(),
    }),
  }),
  output: z.object({
    error: z.string().optional(),
  }),
};

function easeInExpoDeqHard(x: number, star: number) {
  let exponent = 100 - 12 * star;
  if (exponent < 5) exponent = 5;
  return x === 0 ? 0 : Math.pow(2, exponent * x - exponent);
}

export function calculatePerformancePoints(
  starRating: number,
  accuracy: number
) {
  return (
    Math.round(
      Math.pow(
        (starRating * easeInExpoDeqHard(accuracy, starRating) * 100) / 2,
        2
      ) / 1000
    ) * 2
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
  version,
  session,
}: (typeof Schema)["input"]["_type"]): Promise<
  NextResponse<(typeof Schema)["output"]["_type"]>
> {
  const tokenContents = JSON.parse(decryptString(data.token));
  if (
    !isEqual(tokenContents, {
      relayHwid: data.relayHwid,
      songId: data.songId,
      misses: data.misses,
      hits: data.hits,
      mapHash: data.mapHash,
      speed: data.speed,
      mods: data.mods,
      additionalData: data.additionalData,
      spin: data.spin,
      virtualStars: data.virtualStars,
    })
  ) {
    return NextResponse.json(
      {
        error: "Token miscalculation",
      },
      { status: 500 }
    );
  }

  const user = (await getUserBySession(session)) as User;

  let { data: leversData } = await supabase
    .from("levers")
    .select("*")
    .eq("id", 1)
    .single();

  if (leversData && leversData.disable_scores) {
    return NextResponse.json({
      error: "Scores are temporarily disabled",
    });
  }

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
      { status: 400 }
    );

  console.log(userData);

  if (userData.ban == "excluded" || userData.ban == "restricted") {
    return NextResponse.json(
      {
        error: "Silenced, restricted or excluded players can't submit scores.",
      },
      { status: 400 }
    );
  }

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
      { status: 400 }
    );
  }

  if (!beatmaps) {
    return NextResponse.json(
      {
        error: "Map not submitted",
      },
      { status: 400 }
    );
  }

  const noteCount = data.misses + data.hits;
  if (noteCount !== beatmaps.noteCount) {
    return NextResponse.json(
      {
        error: "Wrong map",
      },
      { status: 400 }
    );
  }

  await supabase.from("beatmaps").upsert({
    beatmapHash: data.mapHash,
    playcount: (beatmaps.playcount || 1) + 1,
  });

  let passed = true;

  // Pass invalidation
  if (data.misses + data.hits !== beatmaps.noteCount) {
    passed = false;
  }

  const accurracy = data.hits / noteCount;
  let awarded_sp = 0;

  console.log(
    data.misses + data.hits == beatmaps.noteCount,
    data.misses + data.hits,
    beatmaps.noteCount
  );

  let multiplierMod = 1;
  if (data.mods.includes("mod_hardrock")) {
    multiplierMod *= 1.12;
  }

  if (data.mods.includes("mod_nofail")) {
    multiplierMod *= Math.pow(0.95, data.misses);
  }

  if (
    beatmaps.starRating &&
    Math.abs(beatmaps.starRating - data.virtualStars) < 0.1
  ) {
    awarded_sp = calculatePerformancePoints(
      data.speed * beatmaps.starRating * multiplierMod,
      accurracy
    );
  }

  if (beatmapPages.status == "UNRANKED") {
    awarded_sp = 0;
  }

  console.log("p1");

  // auto-exclude: if a newly-created account (>600 RP) submits a score
  try {
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
    if (
      awarded_sp > 600 &&
      userData?.created_at &&
      Date.now() - userData.created_at < ONE_WEEK
    ) {
      await supabase
        .from("profiles")
        .upsert({ id: userData.id, ban: "excluded", bannedAt: Date.now() });

      return NextResponse.json(
        { error: "User excluded due to suspicious activity." },
        { status: 400 }
      );
    }
  } catch (e) {
    console.error("safen/ auto-exclude check failed:", e);
  }

  let parsed = [];

  try {
    parsed = JSON.parse(decryptString(data.additionalData));
  } catch (error) {}
  await supabase.from("scores").upsert({
    beatmapHash: data.mapHash,
    replayHwid: data.relayHwid,
    songId: data.songId,
    userId: userData.id,
    passed,
    misses: data.misses,
    awarded_sp: Math.round(awarded_sp * 100) / 100,
    speed: data.speed,
    mods: data.mods,
    additional_data: parsed,
    spin: data.spin || false,
  });
  console.log("p2");

  let { data: scores2, error: errorsp } = await supabase
    .from("scores")
    .select(`awarded_sp,beatmapHash,spin`)
    .eq("userId", userData.id)
    .neq("awarded_sp", 0)
    .eq("passed", true)
    .order("awarded_sp", { ascending: false });

  if (scores2 == null) return NextResponse.json({ error: "No scores" });

  let allHashMap: Record<string, number> = {};
  let spinHashMap: Record<string, number> = {};

  for (const score of scores2) {
    const { beatmapHash, awarded_sp } = score;

    if (!beatmapHash || !awarded_sp) continue;

    // Normal Scores
    if (!allHashMap[beatmapHash] || allHashMap[beatmapHash] < awarded_sp) {
      allHashMap[beatmapHash] = awarded_sp;
    }

    // Spin Scores
    if (score.spin) {
      if (!spinHashMap[beatmapHash] || spinHashMap[beatmapHash] < awarded_sp) {
        spinHashMap[beatmapHash] = awarded_sp;
      }
    }
  }
  // All scores
  const totalSp = weightCalculate(allHashMap);

  // Only spin scores
  const spinTotalSp = weightCalculate(spinHashMap);

  console.log("VERSION: " + version);
  await supabase.from("profiles").upsert({
    id: userData.id,
    play_count: (userData.play_count || 0) + 1,
    skill_points: Math.round(totalSp * 100) / 100,
    spin_skill_points: Math.round(spinTotalSp * 100) / 100,
    squares_hit: (userData.squares_hit || 0) + data.hits,
  });
  console.log("p3");

  await invalidateCache(`userscore:${userData.id}`);
  const beatmapIsRanked =
    beatmapPages?.status === "RANKED" || beatmapPages?.status === "APPROVED";
  if (beatmapIsRanked) {
    await invalidateCache(`beatmap-scores:${data.mapHash}`);
  }

  // Grant special badges if applicable
  if (passed && beatmapPages && !data.mods.includes("mod_nofail")) {
    try {
      const { data: badgeResult, error: badgeError } = await supabase.rpc(
        "grant_special_badges",
        {
          p_user_id: userData.id,
          p_beatmap_id: beatmapPages.id,
          p_spin: data.spin || false,
          p_passed: passed,
        }
      );

      const result = badgeResult as { granted: boolean; badge: string | null };
      if (result && result.granted) {
        console.log(`Badge granted: ${result.badge} to user ${userData.id}`);
      }
    } catch (error) {
      console.error("Error granting badge:", error);
    }
  }

  if (awarded_sp > 99 && userData.ban == "cool") {
    await postToWebhooks({
      rp: Math.round(awarded_sp * 100) / 100,
      username: userData.username || "",
      userid: userData.id,
      avatar: userData.avatar_url || "",
      mapimage: beatmaps.imageLarge || "",
      spin: data.spin,
      speed: data.speed,
      accuracy: accurracy,
      mapname: beatmaps.title || "",
      mapid: beatmapPages.id || 0,
      misses: data.misses || 0,
    });
  }

  if (Math.abs((beatmaps.starRating || 0) - data.virtualStars) > 0.01) {
    return NextResponse.json({
      error: "Map mismatch, no RP points were awarded, please report the bug.",
    });
  }

  return NextResponse.json({});
}

export function weightCalculate(hashMap: Record<string, number>) {
  let totalSp = 0;
  let weight = 100;

  const values = Object.values(hashMap);
  values.sort((a, b) => b - a);

  for (const score of values) {
    totalSp += ((score || 0) * weight) / 100;
    weight = weight * 0.97;

    if (weight < 5) {
      break;
    }
  }
  return totalSp;
}

const webHookTemplate = {
  content: null,
  embeds: [
    {
      title: "Captain Lou Albano - Do the Mario",
      url: "https://www.rhythia.com/maps/4469",
      color: 9633967,
      fields: [
        {
          name: "Rhythm Points",
          value: "424 RP",
          inline: true,
        },
        {
          name: "Accuracy",
          value: "100%",
          inline: true,
        },
        {
          name: "Speed",
          value: "1.45x",
          inline: true,
        },
        {
          name: "Playstyle",
          value: "Spin",
          inline: true,
        },
        {
          name: "Misses",
          value: "0",
          inline: true,
        },
      ],
      author: {
        name: "cunev",
        url: "https://www.rhythia.com/player/0",
        icon_url:
          "https://static.rhythia.com/user-avatar-1735149648551-a2a8cfbe-af5d-46e8-a19a-be2339c1679a",
      },
      footer: {
        text: "Sun, 22 Dec 2024 22:40:17 GMT",
      },
      thumbnail: {
        url: "https://static.rhythia.com/beatmap-img-1735223264605-eliuka_dj_sharpnel_-_we_luv_lamalarge",
      },
    },
  ],
  attachments: [],
};

export async function postToWebhooks({
  rp,
  username,
  userid,
  avatar,
  mapimage,
  spin,
  speed,
  accuracy,
  mapname,
  mapid,
  misses,
}: {
  rp: number;
  username: string;
  userid: number;
  avatar: string;
  mapimage: string;
  spin: boolean;
  speed: number;
  accuracy: number;
  mapname: string;
  mapid: number;
  misses: number;
}) {
  const webHooks = await supabase
    .from("discordWebhooks")
    .select("*")
    .eq("type", "scores");

  if (!webHooks.data) return;

  for (const webhook of webHooks.data) {
    const webhookUrl = webhook.webhook_link;

    const embed = webHookTemplate.embeds[0];
    embed.title = mapname;
    embed.url = `https://www.rhythia.com/maps/${mapid}`;
    embed.fields[0].value = `${rp} RP`;
    embed.fields[1].value = `${Math.round(accuracy * 10000) / 100}%`;
    embed.fields[2].value = `${speed}x`;
    embed.fields[3].value = spin ? "Spin" : "Lock";
    embed.fields[4].value = `${misses} misses`;
    embed.author.name = username;
    embed.author.url = `https://www.rhythia.com/player/${userid}`;
    embed.author.icon_url = avatar;
    embed.thumbnail.url = mapimage;
    if (mapimage.includes("backfill")) {
      embed.thumbnail.url = "https://www.rhythia.com/unkimg.png";
    }
    embed.footer.text = new Date().toUTCString();
    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(webHookTemplate),
    });
  }
}
