import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/database";
import CloudflareKV from "remote-cloudflare-kv";

export const supabase = createClient<Database>(
  `https://pfkajngbllcbdzoylrvp.supabase.co`,
  process.env.ADMIN_KEY || "key",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export const kv = new CloudflareKV({
  account_id: process.env.CF_ACCOUNT_ID || "",
  namespace_id: process.env.CF_NAMESPACE_ID || "",
  api_token: process.env.CF_API_TOKEN || "",
  api_email: "",
  api_key: "",
});
