"use server";

import nodemailer from "nodemailer";
import { requireAdmin } from "@/lib/admin";
import { sendMail, adminMail, esc, wrap, fmtDate, mailButton, mailCode, mailFacts } from "@/lib/mailer";

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
  const html = wrap(
    `<p style="margin:0 0 12px">${esc(hello)}</p><p style="margin:0 0 12px"><b>${esc(data.boat_name)}</b> turunuz için müşteri paneli giriş bilgileriniz hazır. Panelden sözleşmenizi görebilir, imzalı hâlini yükleyebilir ve tur hazırlığını takip edebilirsiniz.</p>` +
      mailFacts([["E-posta", String(data.email)], ["Geçerlilik", `${fmtDate(String(data.tour_end))} tarihine kadar`]]) +
      mailCode("Giriş kodunuz", code) +
      mailButton(url, "Müşteri paneline git") +
      `<p style="margin:0 0 12px;font-size:14px;color:#6b7c93">Kodu kimseyle paylaşmayın.</p>`,
    { title: "Müşteri paneliniz hazır", preheader: `${data.boat_name} turunuz için giriş kodunuz` },
  );

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
  const range = `${fmtDate(String(p.tour_start))} – ${fmtDate(String(p.tour_end))}`;
  const who = String(p.customer_name || p.email);
  const text = `${hello}\n\n${p.boat_name} teknesi için ${range} tarihli kiralama sözleşmeniz ekte yer almaktadır. Lütfen inceleyip imzalayın ve müşteri panelinizden (${base}/musteri) imzalı hâlini yükleyin.\n\nYatpaketi`;
  const html = wrap(
    `<p style="margin:0 0 12px">${esc(hello)}</p><p style="margin:0 0 12px">Kiralama sözleşmeniz ekte yer almaktadır. Lütfen inceleyip imzalayın, ardından imzalı hâlini müşteri panelinizden yükleyin.</p>` +
      mailFacts([["Tekne", String(p.boat_name)], ["Tarih", range]]) + mailButton(`${base}/musteri`, "Müşteri paneline git"),
    { title: "Kiralama sözleşmeniz", preheader: `${p.boat_name} – ${range}` },
  );
  const attachments = [{ filename: `sozlesme.${ext}`, content: buf }];
  const r = await sendMail({ to: String(p.email), subject: `Kiralama sözleşmeniz – ${p.boat_name} (${range})`, text, html, attachments });
  if (!r.ok) return { ok: false, message: "Müşteriye e-posta gönderilemedi (" + r.message + ")." };
  const copy = adminMail();
  if (copy) {
    const note = `${who} (${p.email}) için ${p.boat_name} teknesinin ${range} tarihli kiralama sözleşmesi hazırlandı ve müşteriye gönderildi. Sözleşme ekte.`;
    await sendMail({ to: copy, subject: `Sözleşme gönderildi – ${p.boat_name} (${range}) – ${who}`, text: note, html: wrap(`<p style="margin:0 0 12px">${esc(note)}</p>`, { title: "Sözleşme gönderildi" }), attachments });
  }
  await supabase.from("customer_portals").update({ contract_emailed_at: new Date().toISOString() }).eq("id", portalId);
  return { ok: true, message: `Sözleşme ${p.email} adresine e-postayla gönderildi. Bilgilendirme e-postası sizin adresinize de düştü.` };
}

const SENTENCES: Record<string, { short: string; line: string }> = {
  "Sözleşme imzalandı": { short: "Sözleşmeniz imzalandı", line: "Sözleşmeniz imzalı olarak kaydedildi." },
  "Tekne temizliği tamamlandı": { short: "Tekne temizliği tamamlandı", line: "Teknenizin temizliği tamamlandı." },
  "Alışveriş / ikmal yapıldı": { short: "Alışveriş ve ikmal yapıldı", line: "Turunuz için alışveriş ve ikmal yapıldı." },
  "Yakıt ve su dolumu yapıldı": { short: "Yakıt ve su dolumu yapıldı", line: "Teknenin yakıt ve su dolumu yapıldı." },
  "Teknik kontrol yapıldı": { short: "Teknik kontrol yapıldı", line: "Teknenin teknik kontrolü yapıldı." },
  "Kaptan ve mürettebat hazır": { short: "Kaptan ve mürettebat hazır", line: "Kaptanınız ve mürettebatınız hazır." },
};

// Hazırlık listesinde bir madde işaretlenince müşteriye bilgilendirme e-postası gönderir (aynı madde için bir kez).
export async function notifyChecklistDone(portalId: string, itemId: string): Promise<{ ok: boolean; message: string }> {
  const { supabase } = await requireAdmin();
  const { data: p } = await supabase.from("customer_portals").select("email,customer_name,boat_name,tour_start,tour_end,status").eq("id", portalId).maybeSingle();
  if (!p) return { ok: false, message: "Panel bulunamadı." };
  if (p.status !== "active") return { ok: false, message: "Panel iptal edilmiş, e-posta gönderilmedi." };
  const { data: items } = await supabase.from("portal_checklist").select("id,label,done,sort_order").eq("portal_id", portalId).order("sort_order");
  const list = (items ?? []) as { id: string; label: string; done: boolean }[];
  const item = list.find((i) => i.id === itemId);
  if (!item || !item.done) return { ok: false, message: "Madde işaretli değil." };

  // Daha önce bildirildiyse tekrar gönderme (sütun henüz yoksa sorgu hata verir; o durumda gönderilir).
  const prev = await supabase.from("portal_checklist").select("notified_at").eq("id", itemId).maybeSingle();
  if (!prev.error && prev.data?.notified_at) return { ok: true, message: "Bu madde için müşteriye daha önce e-posta gönderilmişti, tekrar gönderilmedi." };

  const sent = SENTENCES[item.label] ?? { short: item.label, line: `Hazırlık listenizde bir madde tamamlandı: ${item.label}.` };
  const done = list.filter((i) => i.done).length;
  const left = list.filter((i) => !i.done).map((i) => i.label);
  const range = `${fmtDate(String(p.tour_start))} – ${fmtDate(String(p.tour_end))}`;
  const hello = p.customer_name ? `Merhaba ${p.customer_name},` : "Merhaba,";
  const base = process.env.PORTAL_BASE_URL || "https://yatpaketi.vercel.app";
  const text = `${hello}\n\n${p.boat_name} teknesi için ${range} tarihli turunuzun hazırlığıyla ilgili bir güncelleme:\n\n${sent.line}\n\nHazırlık durumu: ${list.length} maddeden ${done} tanesi tamamlandı.${left.length ? "\nKalan: " + left.join(", ") + "." : "\nTüm hazırlıklar tamamlandı."}\n\nDetaylar için müşteri panelinize girebilirsiniz: ${base}/musteri\n\nYatpaketi`;
  const html = wrap(
    `<p style="margin:0 0 12px">${esc(hello)}</p><p style="margin:0 0 12px">Turunuzun hazırlığıyla ilgili bir güncelleme:</p>` +
      `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:14px 0"><tr><td style="background:#e8f7ee;border:1px solid #bfe8cf;border-radius:14px;padding:16px 18px;font-size:17px;font-weight:bold;color:#14633a">✓ ${esc(sent.line)}</td></tr></table>` +
      mailFacts([["Tekne", String(p.boat_name)], ["Tarih", range], ["Hazırlık", `${list.length} maddeden ${done} tanesi tamamlandı`]]) +
      (left.length ? `<p style="margin:0 0 12px;font-size:14px;color:#6b7c93">Kalan: ${esc(left.join(", "))}.</p>` : `<p style="margin:0 0 12px"><b>Tüm hazırlıklar tamamlandı.</b></p>`) +
      mailButton(`${base}/musteri`, "Müşteri panelime git"),
    { title: "Tur hazırlığı güncellendi", preheader: sent.line },
  );
  const r = await sendMail({ to: String(p.email), subject: `Tur hazırlığınız: ${sent.short} – ${p.boat_name} (${range})`, text, html });
  if (!r.ok) return { ok: false, message: "Müşteriye e-posta gönderilemedi (" + r.message + ")." };
  await supabase.from("portal_checklist").update({ notified_at: new Date().toISOString() }).eq("id", itemId);
  return { ok: true, message: `Müşteriye e-posta gönderildi: ${sent.short}.` };
}

// Tur bitince müşteriye yorum bağlantısı gönderir. Bağlantı tek kullanımlık ve 45 gün geçerlidir.
export async function sendReviewRequest(portalId: string): Promise<{ ok: boolean; message: string }> {
  const { supabase } = await requireAdmin();
  const { data: p } = await supabase.from("customer_portals").select("email,customer_name,boat_name,tour_end").eq("id", portalId).maybeSingle();
  if (!p) return { ok: false, message: "Panel bulunamadı." };
  const { data: boat } = await supabase.from("boats").select("slug").eq("name", p.boat_name as string).maybeSingle();
  const { data: token, error } = await supabase.rpc("admin_create_review_request", {
    p_email: p.email, p_name: p.customer_name ?? "", p_boat_slug: boat?.slug ?? "", p_boat_name: p.boat_name, p_tour_end: p.tour_end, p_portal_id: portalId,
  });
  if (error || !token) return { ok: false, message: "Bağlantı oluşturulamadı (" + (error?.message ?? "bilinmeyen hata") + "). Supabase'e yorumlar SQL kodunu yapıştırdınız mı?" };
  const base = (process.env.PORTAL_BASE_URL || "https://yatpaketi.vercel.app").replace(/\/+$/, "");
  const url = `${base}/yorum/${token}`;
  const hello = p.customer_name ? `Merhaba ${p.customer_name},` : "Merhaba,";
  const text = `${hello}\n\n${p.boat_name} yolculuğunuz nasıldı? Deneyiminizi ve isterseniz bir fotoğrafınızı paylaşırsanız, sonraki misafirlerimize çok yardımcı olur.\n\nYorum bağlantınız (45 gün geçerli): ${url}\n\nYatpaketi`;
  const html = wrap(
    `<p style="margin:0 0 12px">${esc(hello)}</p><p style="margin:0 0 12px"><b>${esc(String(p.boat_name))}</b> yolculuğunuz nasıldı? Birkaç cümleyle deneyiminizi, isterseniz bir fotoğrafınızı paylaşırsanız sonraki misafirlerimize çok yardımcı olur.</p>` +
      mailButton(url, "Yorumumu yazayım") +
      `<p style="margin:0 0 12px;font-size:14px;color:#6b7c93">Bağlantı size özeldir, 45 gün geçerlidir ve bir kez kullanılabilir. Yorumunuz ekibimiz inceledikten sonra sitede yayınlanır.</p>`,
    { title: "Yolculuğunuz nasıldı?", preheader: `${p.boat_name} deneyiminizi paylaşır mısınız?` },
  );
  const r = await sendMail({ to: String(p.email), subject: `Yolculuğunuz nasıldı? – ${p.boat_name}`, text, html });
  if (!r.ok) return { ok: false, message: `E-posta gönderilemedi (${r.message}). Bağlantıyı elle iletebilirsiniz: ${url}` };
  return { ok: true, message: `Yorum bağlantısı ${p.email} adresine gönderildi.` };
}
