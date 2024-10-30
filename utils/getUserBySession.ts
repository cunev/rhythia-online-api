import { User } from "@supabase/supabase-js";
import { decryptString } from "./security";
import { supabase } from "./supabase";

export async function getUserBySession(session: string): Promise<User | null> {
  const user = (await supabase.auth.getUser(session)).data.user;

  if (user) {
    return user;
  }

  try {
    const decryptedToken = JSON.parse(decryptString(session)) as {
      userId: number;
      email: string;
      passKey: string;
      computerName: string;
    };
    let { data: queryPasskey, error } = await supabase
      .from("passkeys")
      .select("*,profiles(uid)")
      .eq("email", decryptedToken.email)
      .eq("passkey", decryptedToken.passKey)
      .single();

    if (!queryPasskey) {
      return null;
    }

    return (await supabase.auth.admin.getUserById(queryPasskey.profiles?.uid!))
      .data.user;
  } catch (error) {}

  return null;
}
