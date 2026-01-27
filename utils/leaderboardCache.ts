import { setCacheValue } from "./cache";

export const LEADERBOARD_CACHE_INVALIDATE_KEY = "leaderboard:invalidateAt";

export async function invalidateLeaderboardCache() {
  await setCacheValue(LEADERBOARD_CACHE_INVALIDATE_KEY, Date.now());
}

