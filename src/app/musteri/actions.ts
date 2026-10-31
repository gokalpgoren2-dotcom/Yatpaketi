"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { PORTAL_COOKIE, getPortalToken, loadPortal, portalDb } from "@/lib/portal";
import { sendMail, adminMail, esc, wrap } from "@/lib/mailer";

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
      const toCustomer = await sendMail({
        to: portal.email,
        subject: `İmzalı sözleşmeniz alındı – ${portal.boat_name}`,
        text: `Merhaba,\n\n${portal.boat_name} turu için imzalı sözleşmenizi aldık. Kopyası ekte yer almaktadır.\n\nYatpaketi`,
        html: wrap(`<p>Merhaba,</p><p><b>${esc(portal.boat_name)}</b> turu için imzalı sözleşmenizi aldık. Kopyası ekte yer almaktadır.</p>`),
        attachments,
      });
      mailed = toCustomer.ok;
      const admin = adminMail();
      if (admin) {
        await sendMail({
          to: admin,
          subject: `İmzalı sözleşme yüklendi – ${portal.boat_name} – ${who}`,
          text: `${who} (${portal.email}) ${portal.boat_name} (${portal.tour_start} – ${portal.tour_end}) için imzalı sözleşmeyi yükledi. Dosya ekte.`,
          html: wrap(`<p><b>${esc(String(who))}</b> (${esc(portal.email)}) <b>${esc(portal.boat_name)}</b> (${esc(portal.tour_start)} – ${esc(portal.tour_end)}) için imzalı sözleşmeyi yükledi. Dosya ekte.</p>`),
          attachments,
        });
      }
    }
  } catch {
    mailed = false;
  }
  return { ok: true, mailed };
}
