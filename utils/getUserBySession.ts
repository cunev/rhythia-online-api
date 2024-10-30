import { User } from "@supabase/supabase-js";
import { decryptString } from "./security";
import { supabase } from "./supabase";

export async function getUserBySession(session: string): Promise<User | null> {
  const user = (await supabase.auth.getUser(session)).data.user;

  if (user) {
    return user;
  }

  try {
    console.log("trying legacy token");
    const decryptedToken = JSON.parse(decryptString(session)) as {
      userId: number;
      email: string;
      passKey: string;
      computerName: string;
    };

    console.log(decryptedToken);

    let { data: queryPasskey, error } = await supabase
      .from("passkeys")
      .select("*,profiles(uid)")
      .eq("id", decryptedToken.userId || "nil")
      .eq("email", decryptedToken.email || "nil")
      .eq("passkey", decryptedToken.passKey || "nil")
      .single();

    console.log(queryPasskey);

    if (!queryPasskey) {
      return null;
    }

    return (await supabase.auth.admin.getUserById(queryPasskey.profiles?.uid!))
      .data.user;
  } catch (error) {}

  return null;
}
