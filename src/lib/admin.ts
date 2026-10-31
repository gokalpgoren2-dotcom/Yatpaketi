import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";

// Her admin sayfası ve her server action bunu çağırır. Asıl güvenlik veritabanındaki RLS politikalarıdır;
// bu kontrol yetkisiz kullanıcıyı arayüzde de durdurur.
export async function requireAdmin() {
  if (!supabaseConfigured()) redirect("/admin/login");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: row } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!row) redirect("/admin/login?error=yetki");
  return { supabase, user };
}
