import { supabase } from "./supabase";

const CACHE_TABLE = "cache";

type CacheKey = string | number;

const normalizeKey = (key: CacheKey) => String(key);

export async function getCacheValue<T = unknown>(
  key: CacheKey
): Promise<T | null> {
  const { data, error } = await supabase
    .from(CACHE_TABLE)
    .select("value")
    .eq("key", normalizeKey(key))
    .maybeSingle();

  if (error) {
    console.error("getCacheValue error", error);
    return null;
  }

  return (data?.value as T) ?? null;
}

export async function setCacheValue<T = unknown>(
  key: CacheKey,
  value: T
): Promise<void> {
  const { error } = await supabase
    .from(CACHE_TABLE)
    .upsert({ key: normalizeKey(key), value } as any);

  if (error) {
    console.error("setCacheValue error", error);
  }
}

export async function invalidateCache(key: CacheKey): Promise<void> {
  const { error } = await supabase
    .from(CACHE_TABLE)
    .delete()
    .eq("key", normalizeKey(key));

  if (error) {
    console.error("invalidateCache error", error);
  }
}

export async function invalidateCachePrefix(prefix: CacheKey): Promise<void> {
  const normalizedPrefix = normalizeKey(prefix);
  const { error } = await supabase
    .from(CACHE_TABLE)
    .delete()
    .like("key", `${normalizedPrefix}%`);

  if (error) {
    console.error("invalidateCachePrefix error", error);
  }
}
