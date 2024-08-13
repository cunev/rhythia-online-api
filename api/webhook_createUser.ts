import { createClient } from "@supabase/supabase-js";
import { Database } from "../types/supabase";

export async function webhook_createUser(input: { type: string }) {
  const request = await fetch(`https://rhythia.com/api/webhook_createUser`);
  return request.json();
}

const adminClient = createClient<Database>(
  `https://pfkajngbllcbdzoylrvp.supabase.co`,
  process.env.ADMIN_KEY!,
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
