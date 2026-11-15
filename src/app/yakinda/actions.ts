"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { GATE_COOKIE, GATE_MAX_AGE, gateToken } from "@/lib/gate";

// Ekip şifresi doğruysa bu cihaz kapalı modda da siteyi görür.
export async function teamEnter(formData: FormData) {
  const given = String(formData.get("sifre") ?? "").trim();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  let ok = false;
  if (given && url && key) {
    try {
      const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
      const { data } = await db.from("private_settings").select("value").eq("key", "gate").maybeSingle();
      const pw = String((data?.value as { password?: string } | null)?.password ?? "");
      ok = pw.length > 0 && pw === given;
    } catch { /* şifre okunamadıysa giriş verilmez */ }
  }
  if (!ok) {
    await new Promise((r) => setTimeout(r, 800)); // deneme yanılmayı yavaşlatır
    redirect("/yakinda?hata=1");
  }
  (await cookies()).set(GATE_COOKIE, await gateToken(), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: GATE_MAX_AGE });
  redirect("/");
}
