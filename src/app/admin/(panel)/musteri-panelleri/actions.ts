"use server";

import nodemailer from "nodemailer";
import { requireAdmin } from "@/lib/admin";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

// Müşteriye giriş kodunu e-posta ile gönderir. Yalnızca yönetici çağırabilir; alıcı veritabanındaki e-postadır.
export async function sendPortalEmail(portalId: string, code: string): Promise<{ ok: boolean; message: string }> {
  const { supabase } = await requireAdmin();
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
  if (!user || !pass) return { ok: false, message: "E-posta ayarı yapılmamış (Vercel'de GMAIL_USER ve GMAIL_APP_PASSWORD yok). Kodu elle iletin." };

  const { data } = await supabase.from("customer_portals").select("email,customer_name,boat_name,tour_start,tour_end").eq("id", portalId).maybeSingle();
  if (!data) return { ok: false, message: "Panel bulunamadı." };
  if (!/^[A-Z0-9-]{8,16}$/.test(code)) return { ok: false, message: "Kod biçimi geçersiz." };

  const base = process.env.PORTAL_BASE_URL || "https://yatpaketi.vercel.app";
  const url = `${base.replace(/\/+$/, "")}/musteri`;
  const hello = data.customer_name ? `Merhaba ${data.customer_name},` : "Merhaba,";
  const text = `${hello}\n\n${data.boat_name} turunuz için müşteri paneli giriş bilgileriniz:\n\nAdres: ${url}\nE-posta: ${data.email}\nGiriş kodu: ${code}\n\nPanelden sözleşmenizi görebilir, imzalı hâlini yükleyebilir ve tur hazırlığını takip edebilirsiniz. Kod ${data.tour_end} tarihinden sonra geçersiz olur. Kodu kimseyle paylaşmayın.\n\nYatpaketi`;
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#0b2a4a;line-height:1.6"><p>${esc(hello)}</p><p><b>${esc(data.boat_name)}</b> turunuz için müşteri paneli giriş bilgileriniz:</p><p>Adres: <a href="${url}">${url}</a><br>E-posta: ${esc(data.email)}<br>Giriş kodu: <b style="font-size:20px;letter-spacing:2px">${esc(code)}</b></p><p>Panelden sözleşmenizi görebilir, imzalı hâlini yükleyebilir ve tur hazırlığını takip edebilirsiniz. Kod ${esc(String(data.tour_end))} tarihinden sonra geçersiz olur. Kodu kimseyle paylaşmayın.</p><p>Yatpaketi</p></div>`;

  try {
    const transport = nodemailer.createTransport({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user, pass }, connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 12000 });
    await transport.sendMail({ from: `"Yatpaketi" <${user}>`, to: data.email, subject: "Yatpaketi müşteri paneli giriş bilgileriniz", text, html });
    return { ok: true, message: `E-posta gönderildi: ${data.email}` };
  } catch (e) {
    const m = e instanceof Error ? e.message : "bilinmeyen hata";
    return { ok: false, message: "E-posta gönderilemedi (" + m + "). Kodu elle iletin." };
  }
}
