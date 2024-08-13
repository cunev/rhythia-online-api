import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

const adminClient = createClient<Database>(
  `https://pfkajngbllcbdzoylrvp.supabase.co`,
  `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBma2FqbmdibGxjYmR6b3lscnZwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxODU3NjA3MCwiZXhwIjoyMDM0MTUyMDcwfQ.XKUlQWvzmcYyirM-Zi4nwhiEKcpx1xLS97QUyuR3MoY`,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export function GET(request: Request) {
  const country = request.headers.get("x-vercel-ip-country");
  return new Response(`You're visiting from beautiful ${country}`);
}

export async function POST(request: Request) {
  const payload: any = await request.json();

  if (payload.type !== "INSERT") return new Response(`not today`);
  console.log("Inserting...");
  const metadata = payload.record.raw_user_meta_data;

  const data = await adminClient
    .from("profiles")
    .upsert({
      uid: payload.record.id,
      about_me: "",
      avatar_url: metadata.avatar_url,
      badges: ["Early Bird"],
      username: metadata.full_name,
      flag: "",
      created_at: Date.now(),
    })
    .select();

  console.log(data);
  return new Response(`good one`);
}
