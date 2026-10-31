import { adminMail, sendMail, wrap, esc, fmtDate } from "@/lib/mailer";

export type NotifyData = { name: string; phone: string; email: string; boat: string; start: string; end: string; guests: number; message: string };

// Yeni talep gelince yöneticiye e-posta atar. Asla fırlatmaz; sonucu döner.
export async function notifyAdmin(d: NotifyData): Promise<{ ok: boolean; message: string }> {
  try {
    const to = adminMail();
    if (!to) return { ok: false, message: "GMAIL_USER tanımlı değil." };
    const base = process.env.PORTAL_BASE_URL || "https://yatpaketi.vercel.app";
    const boat = d.boat || "Tekne belirtilmedi";
    const text = `Yeni rezervasyon talebi\n\nAd: ${d.name}\nTekne: ${boat}\nTarih: ${fmtDate(d.start)} - ${fmtDate(d.end)}\nMisafir: ${d.guests}\nTelefon: ${d.phone || "-"}\nE-posta: ${d.email || "-"}\n${d.message ? "Mesaj: " + d.message + "\n" : ""}\nPanel: ${base}/admin/rezervasyonlar`;
    const row = (k: string, v: string) => `<tr><td style="padding:4px 12px 4px 0;color:#6b7c93">${k}</td><td style="padding:4px 0"><b>${esc(v)}</b></td></tr>`;
    const html = wrap(`<h2 style="margin:0 0 8px">Yeni rezervasyon talebi</h2><table>${row("Ad", d.name)}${row("Tekne", boat)}${row("Tarih", fmtDate(d.start) + " – " + fmtDate(d.end))}${row("Misafir", String(d.guests))}${row("Telefon", d.phone || "-")}${row("E-posta", d.email || "-")}</table>${d.message ? `<p style="background:#f2f6fa;padding:10px;border-radius:8px;white-space:pre-line">${esc(d.message)}</p>` : ""}<p><a href="${base}/admin/rezervasyonlar">Rezervasyonlar sayfasını aç</a></p>`);
    return await sendMail({ to, subject: `Yeni talep: ${d.name} – ${boat}`, text, html });
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "bilinmeyen hata" };
  }
}
