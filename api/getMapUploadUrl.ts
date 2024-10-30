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
import { validateIntrinsicToken } from "../utils/validateToken";
import { getUserBySession } from "../utils/getUserBySession";
import { User } from "@supabase/supabase-js";

const s3Client = new S3Client({
  region: "auto",
  endpoint: "https://s3.eu-central-003.backblazeb2.com",
  credentials: {
    secretAccessKey: process.env.SECRET_BUCKET || "",
    accessKeyId: process.env.ACCESS_BUCKET || "",
  },
});

export const Schema = {
  input: z.strictObject({
    mapName: z.string().optional(),
    session: z.string(),
    contentLength: z.number(),
    contentType: z.string(),
    intrinsicToken: z.string(),
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
  mapName,
  session,
  contentLength,
  contentType,
  intrinsicToken,
}: (typeof Schema)["input"]["_type"]): Promise<
  NextResponse<(typeof Schema)["output"]["_type"]>
> {
  const user = (await getUserBySession(session)) as User;

  if (!validateIntrinsicToken(intrinsicToken)) {
    return NextResponse.json({
      error: "Invalid intrinsic token",
    });
  }

  if (contentLength > 50000000) {
    return NextResponse.json({
      error: "Max content length exceeded.",
    });
  }

  if (contentType !== "application/octet-stream") {
    return NextResponse.json({
      error: "Unnacceptable format",
    });
  }

  const key = `rhythia-${mapName ? mapName : user.id}-${Date.now()}.sspm`;
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
