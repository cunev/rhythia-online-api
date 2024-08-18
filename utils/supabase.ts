import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/database";

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
