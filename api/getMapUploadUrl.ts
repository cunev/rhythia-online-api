import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";

import {
  PutBucketCorsCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: "auto",
  endpoint: "https://s3.eu-central-003.backblazeb2.com",
  credentials: {
    secretAccessKey: "K0039mm4iKsteQOXpZSzf0+VDzuH89U",
    accessKeyId: "003c245e893e8060000000001",
  },
});

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    beatmapHash: z.string(),
    contentLength: z.number(),
    contentType: z.string(),
  }),
  output: z.strictObject({
    error: z.string().optional(),
    url: z.string().optional(),
    objectKey: z.string().optional(),
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
  contentLength,
  contentType,
}: (typeof Schema)["input"]["_type"]): Promise<
  NextResponse<(typeof Schema)["output"]["_type"]>
> {
  const user = (await supabase.auth.getUser(session)).data.user!;

  if (contentLength > 50000000) {
    return NextResponse.json({
      error: "Max content length exceeded.",
    });
  }

  const key = `beatmap-${beatmapHash}-${user.id}`;
  const command = new PutObjectCommand({
    Bucket: "rhthia-avatars",
    Key: key,
    ContentLength: contentLength,
    ContentType: contentType,
  });

  const presigned = await getSignedUrl(s3Client, command, {
    expiresIn: 3600,
  });
  return NextResponse.json({
    url: presigned,
    objectKey: key,
  });
}
