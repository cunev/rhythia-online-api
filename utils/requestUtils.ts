import status, { INTERNAL_SERVER_ERROR, UNAUTHORIZED } from "http-status";
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
    return NextResponse.json(
      { error: error.toString() },
      { status: status.BAD_REQUEST }
    );
  }

  const authorizationReponse = await authorization(data);
  if (authorizationReponse) {
    return authorizationReponse;
  }

  return await activity();
}

export function validUser(data) {
  if (!data.session) {
    return NextResponse.json(
      {
        error: "Session is missing",
      },
      { status: INTERNAL_SERVER_ERROR }
    );
  }
  if (!supabase.auth.getUser(data.session)) {
    return NextResponse.json(
      {
        error: "Invalid user session",
      },
      { status: UNAUTHORIZED }
    );
  }
}
