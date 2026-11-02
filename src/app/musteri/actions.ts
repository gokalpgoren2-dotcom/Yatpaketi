"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { PORTAL_COOKIE, getPortalToken, loadPortal, portalDb } from "@/lib/portal";
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
