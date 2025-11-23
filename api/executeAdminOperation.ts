import { NextResponse } from "next/server";
import z from "zod";
import { Database } from "../types/database";
import { protectedApi, validUser } from "../utils/requestUtils";
import { supabase } from "../utils/supabase";
import { getUserBySession } from "../utils/getUserBySession";
import { User } from "@supabase/supabase-js";
import { invalidateCache } from "../utils/cache";

// Define supported admin operations and their parameter types
const adminOperations = {
  deleteUser: z.object({ userId: z.number() }),
  changeFlag: z.object({ userId: z.number(), flag: z.string() }),
  changeBadges: z.object({ userId: z.number(), badges: z.string() }),
  addBadge: z.object({ userId: z.number(), badge: z.string() }),
  removeBadge: z.object({ userId: z.number(), badge: z.string() }),
  excludeUser: z.object({ userId: z.number() }),
  restrictUser: z.object({ userId: z.number() }),
  silenceUser: z.object({ userId: z.number() }),
  profanityClear: z.object({ userId: z.number() }),
  searchUsers: z.object({ searchText: z.string() }),
  removeAllScores: z.object({ userId: z.number() }),
  invalidateRankedScores: z.object({ userId: z.number() }),
  unbanUser: z.object({ userId: z.number() }),
  getScoresPaginated: z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(50),
    userId: z.number().optional(),
    includeAdditionalData: z.boolean().default(true),
  }),
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
    operation: z.literal("profanityClear"),
    params: adminOperations.profanityClear,
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
  z.object({
    operation: z.literal("changeFlag"),
    params: adminOperations.changeFlag,
  }),
  z.object({
    operation: z.literal("changeBadges"),
    params: adminOperations.changeBadges,
  }),
  z.object({
    operation: z.literal("addBadge"),
    params: adminOperations.addBadge,
  }),
  z.object({
    operation: z.literal("removeBadge"),
    params: adminOperations.removeBadge,
  }),
  z.object({
    operation: z.literal("getScoresPaginated"),
    params: adminOperations.getScoresPaginated,
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
    let result: { data?: any; error?: any } | null = null;
    const operation = data.data.operation;
    const params = data.data.params as any;
    const targetUserId =
      "userId" in params && typeof params.userId === "number"
        ? params.userId
        : null;

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

      case "profanityClear":
        result = await supabase.rpc("admin_profanity_clear", {
          user_id: params.userId,
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

      case "changeFlag":
        result = await supabase
          .from("profiles")
          .upsert({
            id: params.userId,
            flag: params.flag,
          })
          .select();
        break;
      case "changeBadges":
        // Allow only developers to modify badges.
        if ((queryUserData.badges as string[]).includes("Developer")) {
          result = await supabase
            .from("profiles")
            .upsert({
              id: params.userId,
              badges: JSON.parse(params.badges),
            })
            .select();
        } else {
          result = { data: null, error: { message: "Unauthorized" } };
        }
        break;

      case "addBadge":
        // Allow only developers to modify badges.
        if ((queryUserData.badges as string[]).includes("Developer")) {
          // Get current badges
          const { data: targetUser } = await supabase
            .from("profiles")
            .select("badges")
            .eq("id", params.userId)
            .single();
          
          const currentBadges = (targetUser?.badges || []) as string[];
          if (!currentBadges.includes(params.badge)) {
            currentBadges.push(params.badge);
            result = await supabase
              .from("profiles")
              .upsert({
                id: params.userId,
                badges: currentBadges,
              })
              .select();
          } else {
            result = { data: targetUser, error: null };
          }
        } else {
          result = { data: null, error: { message: "Unauthorized" } };
        }
        break;

      case "removeBadge":
        // Allow only developers to modify badges.
        if ((queryUserData.badges as string[]).includes("Developer")) {
          // Get current badges
          const { data: targetUser } = await supabase
            .from("profiles")
            .select("badges")
            .eq("id", params.userId)
            .single();
          
          const currentBadges = (targetUser?.badges || []) as string[];
          const updatedBadges = currentBadges.filter(b => b !== params.badge);
          
          result = await supabase
            .from("profiles")
            .upsert({
              id: params.userId,
              badges: updatedBadges,
            })
            .select();
        } else {
          result = { data: null, error: { message: "Unauthorized" } };
        }
        break;

      case "getScoresPaginated":
        const offset = (params.page - 1) * params.limit;
        let query = supabase
          .from("scores")
          .select(
            `
            id,
            awarded_sp,
            userId,
            additional_data,
            profiles (
              username
            )
          `
          )
          .eq("passed", true)
          .order("created_at", { ascending: false })
          .range(offset, offset + params.limit - 1);

        if (params.userId) {
          query = query.eq("userId", params.userId);
        }

        const { data: scoresData, error: scoresError, count } = await query;

        if (scoresError) {
          result = { error: scoresError, data: null };
        } else {
          const transformedScores = scoresData?.map((score) => {
            const transformed: any = {
              id: score.id,
              awarded_sp: score.awarded_sp,
              userId: score.userId,
              username: score.profiles?.username || null,
            };

            if (params.includeAdditionalData) {
              transformed.additional_data = score.additional_data;
            }

            return transformed;
          });

          result = {
            data: {
              scores: transformedScores,
              pagination: {
                page: params.page,
                limit: params.limit,
                total: count || 0,
                totalPages: Math.ceil((count || 0) / params.limit),
              },
            },
            error: null,
          };
        }
        break;
    }

    // Log the admin action
    await supabase.rpc("admin_log_action", {
      admin_id: queryUserData.id,
      action_type: operation,
      target_id: "userId" in params ? params.userId : null,
      details: { params },
    });

    if (result?.error) {
      return NextResponse.json(
        {
          success: false,
          error: result.error.message,
        },
        { status: 500 }
      );
    }

    if (targetUserId !== null && !result?.error) {
      await invalidateCache(`userscore:${targetUserId}`);
    }

    return NextResponse.json({
      success: true,
      result: result?.data,
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
