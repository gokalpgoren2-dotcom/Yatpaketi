"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { PORTAL_COOKIE, getPortalToken, portalDb } from "@/lib/portal";

export async function portalLogin(form: FormData) {
  const email = String(form.get("email") ?? "").trim();
  const code = String(form.get("code") ?? "").trim();
  if (!email || !code) redirect("/musteri?hata=bos");
  const { data, error } = await portalDb().rpc("portal_login", { p_email: email, p_code: code });
  if (error) redirect("/musteri?hata=sistem");
  if (!data || typeof data !== "string") redirect("/musteri?hata=giris");
  (await cookies()).set(PORTAL_COOKIE, data, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 12 * 60 * 60 });
  redirect("/musteri/panel");
}

export async function portalLogout() {
  const token = await getPortalToken();
  if (token) await portalDb().rpc("portal_logout", { p_token: token });
  (await cookies()).delete(PORTAL_COOKIE);
  redirect("/musteri");
}

// Yükleme için tek kullanımlık yol ister.
export async function startUpload(ext: string): Promise<{ path?: string; error?: string }> {
  const token = await getPortalToken();
  if (!token) return { error: "Oturum süresi doldu. Lütfen yeniden giriş yapın." };
  const { data, error } = await portalDb().rpc("portal_upload_slot", { p_token: token, p_ext: ext });
  if (error || !data) return { error: "Bu dosya türü yüklenemez. PDF, JPG veya PNG seçin." };
  return { path: data as string };
}

export async function finishUpload(path: string): Promise<{ ok: boolean }> {
  const token = await getPortalToken();
  if (!token) return { ok: false };
  const { data, error } = await portalDb().rpc("portal_finish_upload", { p_token: token, p_path: path });
  return { ok: !error && data === true };
}
