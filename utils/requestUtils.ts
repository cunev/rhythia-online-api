import { NextResponse } from "next/server";
import { set, ZodObject } from "zod";
import { getUserBySession } from "./getUserBySession";
import { supabase } from "./supabase";

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

    console.log({ ...data, session: undefined });

    setActivity(data);
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

export async function setActivity(data: Record<string, any>) {
  if (data.session) {
    const user = (await supabase.auth.getUser(data.session)).data.user;
    if (user) {
      await supabase.from("profileActivities").upsert({
        uid: user.id,
        last_activity: Date.now(),
      });
    }
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

  const user = await getUserBySession(data.session);
  if (!user) {
    return NextResponse.json(
      {
        error: "Invalid user session",
      },
      { status: 400 }
    );
  }
}
