"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { adminMail, sendMail, wrap, esc, fmtDate } from "@/lib/mailer";

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
    await notifyAdmin({
      name: s(fd, "name", 100), phone: s(fd, "phone", 40), email: s(fd, "email", 200), boat: boatName,
      start, end, guests, message: s(fd, "message", 2000),
    });
    return { ok: true };
  }
  return { ok: false, message: messages[r?.error ?? ""] ?? "Talebiniz gönderilemedi. Lütfen bilgileri kontrol edin." };
}

// Yeni talep gelince yöneticiye e-posta atar. Hata olursa müşteri etkilenmez; en çok 6 saniye beklenir.
async function notifyAdmin(d: { name: string; phone: string; email: string; boat: string; start: string; end: string; guests: number; message: string }) {
  try {
    const to = adminMail();
    if (!to) return;
    const base = process.env.PORTAL_BASE_URL || "https://yatpaketi.vercel.app";
    const boat = d.boat || "Tekne belirtilmedi";
    const text = `Yeni rezervasyon talebi\n\nAd: ${d.name}\nTekne: ${boat}\nTarih: ${fmtDate(d.start)} - ${fmtDate(d.end)}\nMisafir: ${d.guests}\nTelefon: ${d.phone || "-"}\nE-posta: ${d.email || "-"}\n${d.message ? "Mesaj: " + d.message + "\n" : ""}\nPanel: ${base}/admin/rezervasyonlar`;
    const row = (k: string, v: string) => `<tr><td style="padding:4px 12px 4px 0;color:#6b7c93">${k}</td><td style="padding:4px 0"><b>${esc(v)}</b></td></tr>`;
    const html = wrap(`<h2 style="margin:0 0 8px">Yeni rezervasyon talebi</h2><table>${row("Ad", d.name)}${row("Tekne", boat)}${row("Tarih", fmtDate(d.start) + " – " + fmtDate(d.end))}${row("Misafir", String(d.guests))}${row("Telefon", d.phone || "-")}${row("E-posta", d.email || "-")}</table>${d.message ? `<p style="background:#f2f6fa;padding:10px;border-radius:8px;white-space:pre-line">${esc(d.message)}</p>` : ""}<p><a href="${base}/admin/rezervasyonlar">Rezervasyonlar sayfasını aç</a></p>`);
    await Promise.race([
      sendMail({ to, subject: `Yeni talep: ${d.name} – ${boat}`, text, html }),
      new Promise((res) => setTimeout(res, 6000)),
    ]);
  } catch {
    // bildirim başarısız olsa da talep kaydedildi
  }
}
