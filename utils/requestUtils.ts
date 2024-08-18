import { NextResponse } from "next/server";
import { supabase } from "./supabase";

export async function protectedApi({
  response,
  schema,
  authorization,
  activity,
}: {
  response: Response;
  schema: { input: Zod.ZodObject<any>; output: Zod.ZodObject<any> };
  authorization: Function;
  activity: Function;
}) {
  let data;

  try {
    const toParse = await response.json();
    data = schema.input.parse(toParse);
  } catch (error) {
    return NextResponse.json({ error: error.toString() }, { status: 400 });
  }

  const authorizationReponse = await authorization(data);
  if (authorizationReponse) {
    return authorizationReponse;
  }

  return await activity(data, response);
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
