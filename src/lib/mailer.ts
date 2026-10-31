import nodemailer from "nodemailer";

export type Attach = { filename: string; content: Buffer };

export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);

// "2026-12-01" -> "1 Aralık 2026"
export const fmtDate = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" });

export function adminMail(): string | null {
  return process.env.GMAIL_USER?.trim() || null;
}

// Gmail üzerinden e-posta gönderir. Ayarlar yoksa ya da hata olursa ok:false döner, hiçbir zaman fırlatmaz.
export async function sendMail(o: { to: string; subject: string; text: string; html: string; attachments?: Attach[] }): Promise<{ ok: boolean; message: string }> {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
  if (!user || !pass) return { ok: false, message: "E-posta ayarı yapılmamış." };
  try {
    const t = nodemailer.createTransport({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user, pass }, connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 20000 });
    await t.sendMail({ from: `"Yatpaketi" <${user}>`, to: o.to, subject: o.subject, text: o.text, html: o.html, attachments: o.attachments });
    return { ok: true, message: "gönderildi" };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "bilinmeyen hata" };
  }
}

import { brandedMail } from "./emailTemplate";
export { mailButton, mailCode, mailFacts } from "./emailTemplate";

// Tüm e-postalar markalı şablonla (logo, başlık, alt bilgi) sarılır.
export const wrap = (inner: string, opts: { title?: string; preheader?: string } = {}) => brandedMail(inner, opts);
