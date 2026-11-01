"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { notifyAdmin } from "@/lib/notify";

export type TalepSonuc = { ok: true; debug?: string } | { ok: false; message: string };

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

const messagesEn: Record<string, string> = {
  name: "Please enter your full name.",
  contact: "Please enter at least a phone number or an email address.",
  phone: "The phone number looks invalid.",
  email: "The email address looks invalid.",
  dates: "Please check the dates: check-in cannot be in the past, check-out must be after check-in, and the stay can be at most 60 days.",
  guests: "The guest count is invalid.",
  capacity: "The guest count exceeds this boat's capacity.",
  message: "Your message is too long (max. 2000 characters).",
  boat: "This boat is no longer listed.",
  rate: "Too many requests were sent. Please try again later.",
};

const s = (fd: FormData, k: string, max: number) => String(fd.get(k) ?? "").trim().slice(0, max);

export async function submitReservation(fd: FormData): Promise<TalepSonuc> {
  const en = String(fd.get("lang") ?? "") === "en";
  const messages_ = en ? messagesEn : messages;
  // Gizli alan (botlar doldurur) ve çok hızlı gönderim: sessizce "başarılı" gibi davranılır.
  if (s(fd, "website", 200) !== "") return { ok: true };
  const elapsed = Number(fd.get("elapsed"));
  if (!Number.isFinite(elapsed) || elapsed < 2500) return { ok: false, message: en ? "Please fill in the form and submit again in a few seconds." : "Lütfen formu doldurup birkaç saniye sonra tekrar gönderin." };

  if (fd.get("consent") !== "on") return { ok: false, message: en ? "To continue, please agree to the processing of your personal data." : "Devam etmek için kişisel verilerin işlenmesini onaylamanız gerekir." };

  const start = s(fd, "start", 10);
  const end = s(fd, "end", 10);
  const dateOk = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
  if (!dateOk(start) || !dateOk(end)) return { ok: false, message: messages_.dates };
  const guests = Number(s(fd, "guests", 4));
  if (!Number.isInteger(guests)) return { ok: false, message: messages_.guests };

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
  if (error) return { ok: false, message: en ? "Your request could not be sent right now. Please try again later." : "Talebiniz şu an gönderilemedi. Lütfen daha sonra tekrar deneyin." };
  const r = data as { ok?: boolean; error?: string } | null;
  if (r?.ok) {
    let boatName = s(fd, "boat", 200);
    try {
      if (boatName) {
        const { data: b } = await supabase.from("boats").select("name").eq("slug", boatName).maybeSingle();
        if (b && typeof b.name === "string") boatName = b.name;
      }
    } catch {
      // ad bulunamazsa kod gösterilir
    }
    const nr = await notifyAdmin({
      name: s(fd, "name", 100), phone: s(fd, "phone", 40), email: s(fd, "email", 200), boat: boatName,
      start, end, guests, message: s(fd, "message", 2000),
    });
    if (!nr.ok) console.error("Yeni talep bildirimi gonderilemedi:", nr.message);
    // Tanı amaçlı: ad "TESTMAIL" ise bildirim sonucu ekranda gösterilir.
    return s(fd, "name", 100).toUpperCase() === "TESTMAIL" ? { ok: true, debug: nr.ok ? "Bildirim e-postası gönderildi." : "Bildirim e-postası gönderilemedi: " + nr.message } : { ok: true };
  }
  return { ok: false, message: messages_[r?.error ?? ""] ?? (en ? "Your request could not be sent. Please check your details." : "Talebiniz gönderilemedi. Lütfen bilgileri kontrol edin.") };
}

// WhatsApp düğmesine basılınca talebi sessizce panele kaydeder (telefon/e-posta yoktur). Hata olursa WhatsApp yolu etkilenmez.
export async function recordWhatsapp(input: { boat: string; name: string; start: string; end: string; guests: number }): Promise<void> {
  try {
    const dateOk = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
    if (!dateOk(input.start) || !dateOk(input.end) || !Number.isInteger(input.guests)) return;
    const h = await headers();
    const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "";
    const ipHash = ip ? createHash("sha256").update(`${process.env.RESERVATION_SALT ?? "yatpaketi"}:${ip}`).digest("hex").slice(0, 32) : null;
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase.rpc("submit_whatsapp_request", {
      p_boat_slug: input.boat.slice(0, 200), p_name: input.name.trim().slice(0, 100), p_start: input.start, p_end: input.end, p_guests: input.guests, p_ip_hash: ipHash,
    });
    if (error) { console.error("WhatsApp talebi kaydedilemedi:", error.message); return; }
    const r = data as { ok?: boolean; duplicate?: boolean } | null;
    if (!r?.ok || r.duplicate) return;
    let boatName = input.boat;
    try {
      const { data: b } = await supabase.from("boats").select("name").eq("slug", input.boat).maybeSingle();
      if (b && typeof b.name === "string") boatName = b.name;
    } catch { /* kod gösterilir */ }
    await notifyAdmin({ name: input.name.trim().slice(0, 100) || "WhatsApp talebi (isim yok)", phone: "", email: "", boat: boatName, start: input.start, end: input.end, guests: input.guests, message: "WhatsApp düğmesine basıldı. Müşterinin mesajı ve telefonu WhatsApp'tan gelecek; mesaj gönderilmemiş olabilir." });
  } catch (e) {
    console.error("WhatsApp talebi hatasi:", e instanceof Error ? e.message : e);
  }
}
