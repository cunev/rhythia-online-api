import { NextResponse } from "next/server";
import z from "zod";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  endpoint: "https://s3.eu-central-003.backblazeb2.com",
  credentials: {
    secretAccessKey: "00324b092a63baaf82426d26bb0367518e4816f0d2",
    accessKeyId: "c245e893e806",
  },
});

export const Schema = {
  input: z.strictObject({
    session: z.string(),
  }),
  output: z.strictObject({
    url: z.string(),
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
}: (typeof Schema)["input"]["_type"]): Promise<
  NextResponse<(typeof Schema)["output"]["_type"]>
> {
  const user = (await supabase.auth.getUser(session)).data.user!;

  const command = new PutObjectCommand({
    Bucket: "rhthia-avatars",
    Key: `user-avatar-${Date.now()}-${user.id}`,
    ContentLength: 5000000,
  });

  const presigned = await getSignedUrl(s3Client, command, {
    expiresIn: 3600,
  });
  return NextResponse.json({
    url: presigned,
    objectKey: `user-avatar-${Date.now()}-${user.id}`,
  });
}
