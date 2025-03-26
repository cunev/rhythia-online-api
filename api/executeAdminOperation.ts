import { NextResponse } from "next/server";
import z from "zod";
import { Database } from "../types/database";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";
import { getUserBySession } from "../utils/getUserBySession";
import { User } from "@supabase/supabase-js";

// Define supported admin operations and their parameter types
const adminOperations = {
  deleteUser: z.object({ userId: z.number() }),
  excludeUser: z.object({ userId: z.number() }),
  restrictUser: z.object({ userId: z.number() }),
  silenceUser: z.object({ userId: z.number() }),
  searchUsers: z.object({ searchText: z.string() }),
  removeAllScores: z.object({ userId: z.number() }),
  invalidateRankedScores: z.object({ userId: z.number() }),
  unbanUser: z.object({ userId: z.number() }),
} as const;

// Create a discriminated union type for operation parameters
const OperationParam = z.discriminatedUnion("operation", [
  z.object({
    operation: z.literal("deleteUser"),
    params: adminOperations.deleteUser,
  }),
  z.object({
    operation: z.literal("excludeUser"),
    params: adminOperations.excludeUser,
  }),
  z.object({
    operation: z.literal("restrictUser"),
    params: adminOperations.restrictUser,
  }),
  z.object({
    operation: z.literal("silenceUser"),
    params: adminOperations.silenceUser,
  }),
  z.object({
    operation: z.literal("searchUsers"),
    params: adminOperations.searchUsers,
  }),
  z.object({
    operation: z.literal("removeAllScores"),
    params: adminOperations.removeAllScores,
  }),
  z.object({
    operation: z.literal("invalidateRankedScores"),
    params: adminOperations.invalidateRankedScores,
  }),
  z.object({
    operation: z.literal("unbanUser"),
    params: adminOperations.unbanUser,
  }),
]);

export const Schema = {
  input: z.strictObject({
    session: z.string(),
    data: OperationParam,
  }),
  output: z.object({
    success: z.boolean(),
    result: z.any().optional(),
    error: z.string().optional(),
  }),
};

export async function POST(request: Request): Promise<NextResponse> {
  return protectedApi({
    request,
    schema: Schema,
    authorization: () => {},
    activity: handler,
  });
}

export async function handler(
  data: (typeof Schema)["input"]["_type"]
): Promise<NextResponse<(typeof Schema)["output"]["_type"]>> {
  // Get user from session
  const user = (await getUserBySession(data.session)) as User;

  // Get user's profile data
  const { data: queryUserData, error: userError } = await supabase
    .from("profiles")
    .select("*")
    .eq("uid", user.id)
    .single();

  if (userError || !queryUserData) {
    return NextResponse.json(
      {
        success: false,
        error: "User cannot be retrieved from session",
      },
      { status: 404 }
    );
  }
  const tags = (queryUserData?.badges || []) as string[];
  // Check if user has "Global Moderator" badge
  const isGlobalModerator = tags.includes("Global Moderator");

  if (!isGlobalModerator) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized. Only Global Moderators can perform this action.",
      },
      { status: 403 }
    );
  }

  // Execute the requested admin operation
  try {
    let result;
    const operation = data.data.operation;
    const params = data.data.params as any;

    switch (operation) {
      case "deleteUser":
        result = await supabase.rpc("admin_delete_user", {
          user_id: params.userId,
        });
        break;

      case "excludeUser":
        result = await supabase.rpc("admin_exclude_user", {
          user_id: params.userId,
        });
        break;

      case "restrictUser":
        result = await supabase.rpc("admin_restrict_user", {
          user_id: params.userId,
        });
        break;

      case "silenceUser":
        result = await supabase.rpc("admin_silence_user", {
          user_id: params.userId,
        });
        break;

      case "searchUsers":
        result = await supabase.rpc("admin_search_users", {
          search_text: params.searchText,
        });
        break;

      case "removeAllScores":
        result = await supabase.rpc("admin_remove_all_scores", {
          user_id: params.userId,
        });
        break;

      case "invalidateRankedScores":
        result = await supabase.rpc("admin_invalidate_ranked_scores", {
          user_id: params.userId,
        });
        break;

      case "unbanUser":
        result = await supabase.rpc("admin_unban_user", {
          user_id: params.userId,
        });
        break;
    }

    // Log the admin action
    await supabase.rpc("admin_log_action", {
      admin_id: queryUserData.id,
      action_type: operation,
      target_id: "userId" in params ? params.userId : null,
      details: { params },
    });

    if (result.error) {
      return NextResponse.json(
        {
          success: false,
          error: result.error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      result: result.data,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err.message || "An error occurred during the operation",
      },
      { status: 500 }
    );
  }
}
