import { NextResponse } from "next/server";
import { supabase } from "./supabase";
import { ZodObject } from "zod";

interface Props<
  K = (...args: any[]) => Promise<NextResponse<any>>,
  T = ZodObject<any>
> {
  request: Request;
  schema: { input: T; output: T };
  authorization?: Function;
  activity: K;
}

export async function protectedApi({
  request,
  schema,
  authorization,
  activity,
}: Props) {
  try {
    const toParse = await request.json();
    const data = schema.input.parse(toParse);
    if (authorization) {
      const authorizationResponse = await authorization(data);
      if (authorizationResponse) {
        return authorizationResponse;
      }
    }
    return await activity(data, request);
  } catch (error) {
    return NextResponse.json({ error: error.toString() }, { status: 400 });
  }
}

export async function validUser(data) {
  if (!data.session) {
    return NextResponse.json(
      {
        error: "Session is missing",
      },
      { status: 501 }
    );
  }

  const user = await supabase.auth.getUser(data.session);
  if (user.error || !user.data.user) {
    return NextResponse.json(
      {
        error: "Invalid user session",
      },
      { status: 400 }
    );
  }
}

export async function getUser(data) {
  if (!data.session) {
    return;
  }

  const user = await supabase.auth.getUser(data.session);
  if (user.error || !user.data.user) {
    return;
  }
  return user;
}
