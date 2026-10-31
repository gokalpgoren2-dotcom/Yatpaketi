"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export type TalepSonuc = { ok: true } | { ok: false; message: string };

const messages: Record<string, string> = {
  name: "Lütfen adınızı ve soyadınızı yazın.",
  contact: "Telefon veya e-posta adreslerinden en az birini yazın.",
  phone: "Telefon numarası geçersiz görünüyor.",
  email: "E-posta adresi geçersiz görünüyor.",
  dates: "Tarihleri kontrol edin: giriş bugünden önce, çıkış girişten önce olamaz ve süre en fazla 60 gün olabilir.",
  guests: "Misafir sayısı geçersiz.",
  capacity: "Misafir sayısı bu teknenin kapasitesini aşıyor.",
  message: "Mesajınız çok uzun (en fazla 2000 karakter).",
  boat: "Bu tekne artık yayında değil.",
  rate: "Çok fazla talep gönderildi. Lütfen daha sonra tekrar deneyin.",
};

const s = (fd: FormData, k: string, max: number) => String(fd.get(k) ?? "").trim().slice(0, max);

export async function submitReservation(fd: FormData): Promise<TalepSonuc> {
  // Gizli alan (botlar doldurur) ve çok hızlı gönderim: sessizce "başarılı" gibi davranılır.
  if (s(fd, "website", 200) !== "") return { ok: true };
  const elapsed = Number(fd.get("elapsed"));
  if (!Number.isFinite(elapsed) || elapsed < 2500) return { ok: false, message: "Lütfen formu doldurup birkaç saniye sonra tekrar gönderin." };

  if (fd.get("consent") !== "on") return { ok: false, message: "Devam etmek için kişisel verilerin işlenmesini onaylamanız gerekir." };

  const start = s(fd, "start", 10);
  const end = s(fd, "end", 10);
  const dateOk = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
  if (!dateOk(start) || !dateOk(end)) return { ok: false, message: messages.dates };
  const guests = Number(s(fd, "guests", 4));
  if (!Number.isInteger(guests)) return { ok: false, message: messages.guests };

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "";
  const ipHash = ip ? createHash("sha256").update(`${process.env.RESERVATION_SALT ?? "yatpaketi"}:${ip}`).digest("hex").slice(0, 32) : null;

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.rpc("submit_reservation", {
    p_boat_slug: s(fd, "boat", 200),
    p_name: s(fd, "name", 100),
    p_phone: s(fd, "phone", 40),
    p_email: s(fd, "email", 200),
    p_start: start,
    p_end: end,
    p_guests: guests,
    p_message: s(fd, "message", 2000),
    p_ip_hash: ipHash,
  });
  if (error) return { ok: false, message: "Talebiniz şu an gönderilemedi. Lütfen daha sonra tekrar deneyin." };
  const r = data as { ok?: boolean; error?: string } | null;
  if (r?.ok) return { ok: true };
  return { ok: false, message: messages[r?.error ?? ""] ?? "Talebiniz gönderilemedi. Lütfen bilgileri kontrol edin." };
}
