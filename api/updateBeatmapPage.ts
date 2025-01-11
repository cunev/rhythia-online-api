import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";
import { getUserBySession } from "../utils/getUserBySession";
import { User } from "@supabase/supabase-js";

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    id: z.number(),
    beatmapHash: z.string().optional(),
    tags: z.string().optional(),
    description: z.string().optional(),
  }),
  output: z.strictObject({
    error: z.string().optional(),
  }),
};

export async function POST(request: Request): Promise<NextResponse> {
  return protectedApi({
    request,
    schema: Schema,
    authorization: validUser,
    activity: handler,
  });
}

export async function handler({
  session,
  beatmapHash,
  id,
  description,
  tags,
}: (typeof Schema)["input"]["_type"]): Promise<
  NextResponse<(typeof Schema)["output"]["_type"]>
> {
  const user = (await getUserBySession(session)) as User;
  let { data: userData, error: userError } = await supabase
    .from("profiles")
    .select("*")
    .eq("uid", user.id)
    .single();

  let { data: pageData, error: pageError } = await supabase
    .from("beatmapPages")
    .select("*")
    .eq("id", id)
    .single();

  if (!userData) return NextResponse.json({ error: "No user." });

  let { data: beatmapData, error: bmPageError } = await supabase
    .from("beatmaps")
    .select("*")
    .eq("beatmapHash", beatmapHash || "")
    .single();

  if (!beatmapData && beatmapHash) {
    return NextResponse.json({ error: "No beatmap." });
  }

  if (userData.id !== pageData?.owner)
    return NextResponse.json({ error: "Non-authz user." });

  if (pageData?.status !== "UNRANKED")
    return NextResponse.json({ error: "Only unranked maps can be updated" });

  const upsertPayload = {
    id,
    genre: "",
    status: "UNRANKED",
    owner: userData.id,
    description: description ? description : pageData.description,
    tags: tags ? tags : pageData.tags,
    updated_at: Date.now(),
  };

  if (beatmapHash && beatmapData) {
    upsertPayload["title"] = beatmapData.title;
    upsertPayload["latestBeatmapHash"] = beatmapHash;
    upsertPayload["nominations"] = [];
  }

  const upserted = await supabase
    .from("beatmapPages")
    .upsert(upsertPayload)
    .select("*")
    .single();

  if (upserted.error?.message.length) {
    return NextResponse.json({ error: upserted.error.message });
  }

  postBeatmapToWebhooks({
    username: userData.username || "",
    userid: userData.id,
    avatar: userData.avatar_url || "",
    mapimage: beatmapData?.image || "",
    mapname: beatmapData?.title || "",
    mapid: upserted.data?.id || 0,
    mapDownload: beatmapData?.beatmapFile || "",
    starRating: beatmapData?.starRating || 0,
    length: beatmapData?.length || 0,
  });
  return NextResponse.json({});
}

const beatmapWebhookTemplate: any = {
  content: null,
  embeds: [
    {
      title: "Captain Lou Albano - Do the Mario",
      description: "New Beatmap Created",
      url: "https://www.rhythia.com/maps/4469",
      color: 16775930,
      fields: [
        {
          name: "Star Rating",
          value: "12.4*",
          inline: true,
        },
        {
          name: "Length",
          value: "4:24 minutes",
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
        url: "https://static.rhythia.com/beatmap-img-1735995790136-gen_-_frozy_tomo_-_islands_(kompa_pasi%C3%B3n)large",
      },
    },
    {
      title: "Direct download",
      url: "https://www.rhythia.com/maps/4469",
      color: null,
    },
  ],
  attachments: [],
};

export async function postBeatmapToWebhooks({
  username,
  userid,
  avatar,
  mapimage,
  mapname,
  mapid,
  starRating,
  length,
  mapDownload,
}: {
  username: string;
  userid: number;
  avatar: string;
  mapimage: string;
  mapname: string;
  mapid: number;
  starRating: number;
  length: number;
  mapDownload: string;
}) {
  // format length in MM:SS with padding 0
  const minutes = Math.floor(length / 60);
  const seconds = length - minutes * 60;
  const newLength = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const webHooks = await supabase
    .from("discordWebhooks")
    .select("*")
    .eq("type", "maps");

  if (!webHooks.data) return;

  for (const webhook of webHooks.data) {
    const webhookUrl = webhook.webhook_link;

    const mainEmbed = beatmapWebhookTemplate.embeds[0];
    const downloadEmbed = beatmapWebhookTemplate.embeds[1];

    mainEmbed.title = mapname;
    mainEmbed.url = `https://www.rhythia.com/maps/${mapid}`;
    mainEmbed.fields[0].value = `${starRating}*`;
    mainEmbed.fields[1].value = `${newLength} minutes`;
    mainEmbed.author.name = username;
    mainEmbed.author.url = `https://www.rhythia.com/player/${userid}`;
    mainEmbed.author.icon_url = avatar;
    mainEmbed.thumbnail.url = mapimage;
    if (mapimage.includes("backfill")) {
      mainEmbed.thumbnail.url = "https://www.rhythia.com/unkimg.png";
    }
    mainEmbed.footer.text = new Date().toUTCString();

    downloadEmbed.url = mapDownload;

    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(beatmapWebhookTemplate),
    });
  }
}
