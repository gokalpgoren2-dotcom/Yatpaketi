"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { PORTAL_COOKIE, getPortalToken, loadPortal, portalDb, type Prefs, type Guest } from "@/lib/portal";
import { sendMail, adminMail, esc, wrap, fmtDate, mailFacts } from "@/lib/mailer";

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

export async function finishUpload(path: string): Promise<{ ok: boolean; mailed?: boolean }> {
  const token = await getPortalToken();
  if (!token) return { ok: false };
  const { data, error } = await portalDb().rpc("portal_finish_upload", { p_token: token, p_path: path });
  if (error || data !== true) return { ok: false };

  // İmzalı dosya hem müşteriye hem yöneticiye e-postayla gider. E-posta başarısız olsa da yükleme geçerlidir.
  let mailed = false;
  try {
    const portal = await loadPortal();
    const dl = await portalDb().storage.from("contracts").download(path);
    if (portal && dl.data) {
      const buf = Buffer.from(await dl.data.arrayBuffer());
      const ext = path.split(".").pop() ?? "pdf";
      const attachments = [{ filename: `imzali-sozlesme.${ext}`, content: buf }];
      const who = portal.customer_name || portal.email;
      const range = `${fmtDate(portal.tour_start)} – ${fmtDate(portal.tour_end)}`;
      const toCustomer = await sendMail({
        to: portal.email,
        subject: `İmzalı kiralama sözleşmeniz alındı – ${portal.boat_name} (${range})`,
        text: `Merhaba,\n\n${portal.boat_name} yatı için ${range} tarihli kiralama sözleşmesinin imzalı hâlini aldık. Bir kopyası ekte yer almaktadır.\n\nYatpaketi`,
        html: wrap(`<p style="margin:0 0 12px">Merhaba,</p><p style="margin:0 0 12px">İmzalı kiralama sözleşmenizi aldık. Bir kopyası ekte yer almaktadır; saklamanızı öneririz.</p>` + mailFacts([["Yat", portal.boat_name], ["Tarih", range]]), { title: "İmzalı sözleşmeniz alındı", preheader: `${portal.boat_name} – ${range}` }),
        attachments,
      });
      mailed = toCustomer.ok;
      const admin = adminMail();
      if (admin) {
        const note = `${who} (${portal.email}), ${portal.boat_name} yatının ${range} tarihli kiralama sözleşmesini imzalayıp yükledi. İmzalı sözleşme ekte.`;
        await sendMail({ to: admin, subject: `Sözleşme imzalandı – ${portal.boat_name} (${range}) – ${who}`, text: note, html: wrap(`<p style="margin:0 0 12px">${esc(note)}</p>`, { title: "Sözleşme imzalandı" }), attachments });
      }
    }
  } catch {
    mailed = false;
  }
  return { ok: true, mailed };
}

// Turum sayfasından tur yorumu (ekip yorumu açtıysa).
export async function startPortalReviewPhoto(): Promise<{ path?: string; error?: string }> {
  const token = await getPortalToken();
  if (!token) return { error: "Oturum süresi doldu. Lütfen yeniden giriş yapın." };
  const { data, error } = await portalDb().rpc("portal_review_slot", { p_token: token, p_ext: "jpg" });
  if (error || !data) return { error: "Fotoğraf yüklemesi başlatılamadı." };
  return { path: data as string };
}

export async function submitPortalReview(name: string, rating: number, body: string, photo: string | null): Promise<{ ok: boolean; error?: string }> {
  const token = await getPortalToken();
  if (!token) return { ok: false, error: "Oturum süresi doldu. Lütfen yeniden giriş yapın." };
  const { data, error } = await portalDb().rpc("portal_review_submit", { p_token: token, p_name: name, p_rating: rating, p_body: body, p_photo: photo ?? "" });
  if (error || data !== true) return { ok: false, error: "Yorum gönderilemedi. Alanları kontrol edip tekrar deneyin." };
  return { ok: true };
}

// ---- Turum: misafir tercihleri, misafir listesi, menü seçimi ----

// Yöneticiye e-posta: misafirin girdiği bilgilerin tamamı (rows) ve düz metin özeti
async function notifyAdmin(subject: string, body: string, rows: [string, string][] = [], extraHtml = "", extraText = "") {
  try {
    const admin = adminMail();
    if (!admin) return;
    const p = await loadPortal();
    if (!p) return;
    const who = p.customer_name || p.email;
    const range = `${fmtDate(p.tour_start)} – ${fmtDate(p.tour_end)}`;
    const note = `${who} (${p.email}), ${p.boat_name} – ${range}: ${body}`;
    const text = [note, ...rows.map(([k, v]) => `${k}: ${v}`), extraText, "Ayrıntılar: Yönetim > Müşteri Panelleri"].filter(Boolean).join("\n\n");
    const html = wrap(`<p style="margin:0 0 12px">${esc(note)}</p>${rows.length ? mailFacts(rows) : ""}${extraHtml}<p style="margin:16px 0 0;color:#6b7c93;font-size:13px">Bu bilgiler Yönetim › Müşteri Panelleri sayfasında da görünür ve oradan silinebilir.</p>`, { title: subject });
    await sendMail({ to: admin, subject: `${subject} – ${p.boat_name} – ${who}`, text, html });
  } catch { /* e-posta gitmese de kayıt geçerlidir */ }
}

const MARKET_NAMES: Record<string, string> = { macrocenter: "Macrocenter", carrefoursa: "CarrefourSA", migros: "Migros", metro: "Metro" };
const SERVICE_NAMES: Record<string, string> = { samimi: "Samimi", profesyonel: "Profesyonel", dengeli: "Dengeli" };
const yn = (has?: boolean, text?: string) => (has ? `Var${text?.trim() ? ": " + text.trim() : ""}` : has === false ? "Yok" : "-");
const dTr = (d?: string | null) => (d ? fmtDate(d) : "");

export async function savePrefs(prefs: Prefs, healthConsent = false): Promise<{ ok: boolean; error?: string }> {
  const token = await getPortalToken();
  if (!token) return { ok: false, error: "Oturum süresi doldu. Lütfen yeniden giriş yapın." };
  const health = Boolean(prefs.allergy?.has || prefs.chronic?.has);
  if (health && !healthConsent) return { ok: false, error: "Sağlık bilgilerini kaydedebilmemiz için açık rıza kutusunu işaretleyin." };
  if (health) {
    const k = await portalDb().rpc("portal_kvkk", { p_token: token, p_kind: "health" });
    if (k.error || k.data !== true) return { ok: false, error: "Onayınız kaydedilemedi. Lütfen tekrar deneyin." };
  }
  const { data, error } = await portalDb().rpc("portal_prefs_save", { p_token: token, p_data: prefs });
  if (error || data !== true) return { ok: false, error: "Kaydedilemedi. Lütfen tekrar deneyin." };
  const acts = (prefs.activities ?? []).filter((a) => a !== "Diğer");
  if (prefs.activities?.includes("Diğer")) acts.push(`Diğer: ${prefs.activitiesOther?.trim() || "-"}`);
  await notifyAdmin("Misafir tercihleri", "misafir tercihlerini kaydetti.", [
    ["Market", MARKET_NAMES[prefs.market ?? ""] ?? "-"],
    ["Alerji", yn(prefs.allergy?.has, prefs.allergy?.text)],
    ["Kronik hastalık", yn(prefs.chronic?.has, prefs.chronic?.text)],
    ["Özel gün", prefs.celebration?.has ? [prefs.celebration.type, dTr(prefs.celebration.date), prefs.celebration.note].filter(Boolean).join(" · ") || "Var" : prefs.celebration?.has === false ? "Yok" : "-"],
    ["Hizmet tarzı", SERVICE_NAMES[prefs.service ?? ""] ?? "-"],
    ["Aktiviteler", acts.join(", ") || "-"],
    ["Not", prefs.notes?.trim() || "-"],
  ]);
  return { ok: true };
}

export async function saveGuests(guests: Guest[], consent = false): Promise<{ ok: boolean; error?: string }> {
  const token = await getPortalToken();
  if (!token) return { ok: false, error: "Oturum süresi doldu. Lütfen yeniden giriş yapın." };
  if (!consent) return { ok: false, error: "Devam etmek için KVKK aydınlatma metnini onaylayın." };
  const k = await portalDb().rpc("portal_kvkk", { p_token: token, p_kind: "info" });
  if (k.error || k.data !== true) return { ok: false, error: "Onayınız kaydedilemedi. Lütfen tekrar deneyin." };
  const { data, error } = await portalDb().rpc("portal_guests_save", { p_token: token, p_guests: guests });
  if (error || data !== true) return { ok: false, error: "Kaydedilemedi. Lütfen bilgileri kontrol edip tekrar deneyin." };
  const list = guests.filter((g) => g.full_name.trim());
  const td = "padding:8px 10px 8px 0;border-bottom:1px solid #e5edf2;font-size:13px;color:#06264b;vertical-align:top";
  const th = "padding:8px 10px 8px 0;border-bottom:1px solid #e5edf2;font-size:12px;color:#6b7c93;text-align:left";
  const table = `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:16px 0"><tr><th style="${th}">#</th><th style="${th}">Ad soyad</th><th style="${th}">Uyruk</th><th style="${th}">Doğum</th><th style="${th}">Cinsiyet</th><th style="${th}">Belge</th><th style="${th}">Telefon</th></tr>${list
    .map((g, i) => `<tr><td style="${td}">${i + 1}</td><td style="${td};font-weight:bold">${esc(g.full_name)}</td><td style="${td}">${esc(g.nationality ?? "")}</td><td style="${td}">${esc(dTr(g.birth_date))}</td><td style="${td}">${esc(g.gender ?? "")}</td><td style="${td}">${esc(`${g.doc_type ?? ""} ${g.doc_no ?? ""}`.trim())}</td><td style="${td}">${esc(g.phone ?? "")}</td></tr>`)
    .join("")}</table>`;
  const plain = list.map((g, i) => `${i + 1}) ${g.full_name} – ${g.nationality ?? ""} – ${dTr(g.birth_date)} – ${g.gender ?? ""} – ${g.doc_type ?? ""} ${g.doc_no ?? ""} – ${g.phone ?? ""}`).join("\n");
  await notifyAdmin("Misafir listesi (transit log)", `misafir listesini kaydetti (${list.length} kişi).`, [], table, plain);
  return { ok: true };
}

export async function saveMenus(ids: string[]): Promise<{ ok: boolean; error?: string }> {
  const token = await getPortalToken();
  if (!token) return { ok: false, error: "Oturum süresi doldu. Lütfen yeniden giriş yapın." };
  const { data, error } = await portalDb().rpc("portal_menus_save", { p_token: token, p_ids: ids });
  if (error || data !== true) return { ok: false, error: "Kaydedilemedi. Lütfen tekrar deneyin." };
  let names = "";
  try {
    const ex = await portalDb().rpc("portal_extras_get", { p_token: token });
    const menus = ((ex.data as { menus?: { id: string; title: string }[] } | null)?.menus ?? []).filter((m) => ids.includes(m.id)).map((m) => m.title);
    names = menus.join(", ");
  } catch { /* adlar alınamazsa yalnızca sayı yazılır */ }
  await notifyAdmin("Menü seçimi", `${ids.length} menü seçti.`, [["Seçilen menüler", names || (ids.length ? `${ids.length} menü` : "Seçim yok")]]);
  return { ok: true };
}

// Alışveriş listesi: misafir onaylar ya da değişiklik ister
export async function answerShopping(id: string, ok: boolean, note: string): Promise<{ ok: boolean; error?: string }> {
  const token = await getPortalToken();
  if (!token) return { ok: false, error: "Oturum süresi doldu. Lütfen yeniden giriş yapın." };
  if (!ok && !note.trim()) return { ok: false, error: "Neyin değişmesini istediğinizi yazın." };
  const { data, error } = await portalDb().rpc("portal_file_answer", { p_token: token, p_id: id, p_ok: ok, p_note: note });
  if (error) console.error("portal_file_answer", error.code, error.message);
  if (error?.code === "PGRST202" || error?.code === "42883" || error?.code === "42703") return { ok: false, error: "Sistem güncellemesi tamamlanmamış (turum-alisveris.sql). Lütfen ekibimize haber verin." };
  if (error || data !== true) return { ok: false, error: "Kaydedilemedi. Lütfen tekrar deneyin." };
  await notifyAdmin(ok ? "Alışveriş listesi onaylandı" : "Alışveriş listesinde değişiklik istendi", ok ? `alışveriş listesini onayladı.${note.trim() ? " Not: " + note.trim() : ""}` : `alışveriş listesinde değişiklik istedi: ${note.trim()}`);
  return { ok: true };
}
