"use server";

import nodemailer from "nodemailer";
import { requireAdmin } from "@/lib/admin";
import { sendMail, adminMail, esc, wrap } from "@/lib/mailer";

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
    const info = m.includes("535") ? ` [Kullanılan adres: ${user}, şifre uzunluğu: ${pass.length} karakter, 16 olmalı]` : "";
    return { ok: false, message: "E-posta gönderilemedi (" + m + ")." + info + " Kodu elle iletin." };
  }
}

// Yönetici panelden yüklediği sözleşmeyi müşterinin e-postasına (PDF ekte) gönderir; kopya yöneticiye de gider.
export async function emailContractToCustomer(portalId: string): Promise<{ ok: boolean; message: string }> {
  const { supabase } = await requireAdmin();
  const { data: p } = await supabase.from("customer_portals").select("email,customer_name,boat_name,tour_start,tour_end,contract_path").eq("id", portalId).maybeSingle();
  if (!p || !p.contract_path) return { ok: false, message: "Önce sözleşme yükleyin." };
  const dl = await supabase.storage.from("contracts").download(p.contract_path as string);
  if (dl.error || !dl.data) return { ok: false, message: "Sözleşme dosyası okunamadı." };
  const buf = Buffer.from(await dl.data.arrayBuffer());
  const ext = (p.contract_path as string).split(".").pop() ?? "pdf";
  const hello = p.customer_name ? `Merhaba ${p.customer_name},` : "Merhaba,";
  const base = process.env.PORTAL_BASE_URL || "https://yatpaketi.vercel.app";
  const text = `${hello}\n\n${p.boat_name} turunuz (${p.tour_start} – ${p.tour_end}) için sözleşme ekte yer almaktadır. Lütfen inceleyip imzalayın ve müşteri panelinizden (${base}/musteri) imzalı hâlini yükleyin.\n\nYatpaketi`;
  const html = wrap(`<p>${esc(hello)}</p><p><b>${esc(String(p.boat_name))}</b> turunuz (${esc(String(p.tour_start))} – ${esc(String(p.tour_end))}) için sözleşme ekte yer almaktadır.</p><p>Lütfen inceleyip imzalayın ve <a href="${base}/musteri">müşteri panelinizden</a> imzalı hâlini yükleyin.</p>`);
  const attachments = [{ filename: `sozlesme.${ext}`, content: buf }];
  const r = await sendMail({ to: String(p.email), subject: `Yatpaketi sözleşmeniz – ${p.boat_name}`, text, html, attachments });
  if (!r.ok) return { ok: false, message: "Müşteriye e-posta gönderilemedi (" + r.message + ")." };
  const copy = adminMail();
  if (copy) await sendMail({ to: copy, subject: `[Kopya] Müşteriye gönderilen sözleşme – ${p.boat_name} – ${p.customer_name ?? p.email}`, text: `Aşağıdaki sözleşme ${p.email} adresine gönderildi.\n\n${text}`, html: wrap(`<p>Bu sözleşme <b>${esc(String(p.email))}</b> adresine gönderildi (kopya).</p>`), attachments });
  await supabase.from("customer_portals").update({ contract_emailed_at: new Date().toISOString() }).eq("id", portalId);
  return { ok: true, message: `Sözleşme ${p.email} adresine e-postayla gönderildi. Kopyası sizin e-postanıza da düştü.` };
}
