import { supabase } from "./supabase";

export const INACTIVITY_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export type ActivityStatus = "active" | "inactive";

export function getScoreActivityCutoffIso(now = Date.now()) {
  return new Date(now - INACTIVITY_WINDOW_MS).toISOString();
}

export async function getActivityStatusForUserId(userId: number) {
  const cutoffIso = getScoreActivityCutoffIso();
  const { data } = await supabase
    .from("scores")
    .select("id")
    .eq("userId", userId)
    .gte("created_at", cutoffIso)
    .limit(1);

  return data?.length ? ("active" as const) : ("inactive" as const);
}

export async function getActiveProfileIdSet(profileIds: number[]) {
  if (!profileIds.length) return new Set<number>();

  const cutoffIso = getScoreActivityCutoffIso();
  const { data } = await supabase
    .from("profiles")
    .select("id,scores!inner(id)")
    .in("id", profileIds)
    .gte("scores.created_at", cutoffIso)
    .limit(1, { foreignTable: "scores" });

  return new Set((data || []).map((row) => row.id));
}

