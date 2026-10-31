import { adminMail, sendMail, wrap, esc, fmtDate, mailFacts, mailButton } from "@/lib/mailer";

export type NotifyData = { name: string; phone: string; email: string; boat: string; start: string; end: string; guests: number; message: string };

// Yeni talep gelince yöneticiye e-posta atar. Asla fırlatmaz; sonucu döner.
export async function notifyAdmin(d: NotifyData): Promise<{ ok: boolean; message: string }> {
  try {
    const to = adminMail();
    if (!to) return { ok: false, message: "GMAIL_USER tanımlı değil." };
    const base = process.env.PORTAL_BASE_URL || "https://yatpaketi.vercel.app";
    const boat = d.boat || "Tekne belirtilmedi";
    const text = `Yeni rezervasyon talebi\n\nAd: ${d.name}\nTekne: ${boat}\nTarih: ${fmtDate(d.start)} - ${fmtDate(d.end)}\nMisafir: ${d.guests}\nTelefon: ${d.phone || "-"}\nE-posta: ${d.email || "-"}\n${d.message ? "Mesaj: " + d.message + "\n" : ""}\nPanel: ${base}/admin/rezervasyonlar`;
    const html = wrap(
      mailFacts([["Ad", d.name], ["Tekne", boat], ["Tarih", fmtDate(d.start) + " – " + fmtDate(d.end)], ["Misafir", String(d.guests)], ["Telefon", d.phone || "-"], ["E-posta", d.email || "-"]]) +
        (d.message ? `<p style="background:#f2f6fa;padding:12px 14px;border-radius:10px;white-space:pre-line;margin:0 0 12px">${esc(d.message)}</p>` : "") +
        mailButton(`${base}/admin/rezervasyonlar`, "Rezervasyonlar sayfasını aç"),
      { title: "Yeni rezervasyon talebi", preheader: `${d.name} – ${boat}` },
    );
    return await sendMail({ to, subject: `Yeni talep: ${d.name} – ${boat}`, text, html });
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "bilinmeyen hata" };
  }
}
