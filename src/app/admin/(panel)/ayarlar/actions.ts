"use server";

import { sendMail, adminMail, wrap } from "@/lib/mailer";
import { notifyAdmin } from "@/lib/notify";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { normalizePhone } from "@/lib/phone";
import { igCheck } from "@/lib/instagram";

function back(kind: "saved" | "error", msg = ""): never {
  redirect(`/admin/ayarlar?${kind === "saved" ? "saved=1" : "error=" + encodeURIComponent(msg)}&t=${Date.now()}`);
}

export async function saveContact(formData: FormData) {
  const { supabase } = await requireAdmin();
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  const whatsapp = normalizePhone(String(formData.get("whatsapp") ?? ""));
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (phone && (phone.length < 10 || phone.length > 15)) back("error", "Telefon numarası geçersiz. Örnek: 0541 681 23 14");
  if (whatsapp && (whatsapp.length < 10 || whatsapp.length > 15)) back("error", "WhatsApp numarası geçersiz. Örnek: 0541 681 23 14");
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) back("error", "E-posta adresi geçersiz görünüyor.");

  // Sosyal medya: kullanıcı adı ya da tam adres yazılabilir
  const social = (raw: FormDataEntryValue | null, base: string) => {
    const v = String(raw ?? "").trim();
    if (!v) return "";
    if (/^https?:\/\//i.test(v)) return v;
    if (/^(www\.)?[a-z0-9-]+\.[a-z]{2,}\//i.test(v)) return "https://" + v;
    return base + v.replace(/^@/, "") + "/";
  };
  const instagram = social(formData.get("instagram"), "https://www.instagram.com/");
  const tiktok = social(formData.get("tiktok"), "https://www.tiktok.com/@");
  const linkedin = social(formData.get("linkedin"), "https://www.linkedin.com/company/");
  const { error } = await supabase.from("site_settings").upsert({ key: "contact", value: { phone, whatsapp, email, instagram, tiktok, linkedin }, updated_at: new Date().toISOString() });
  if (error) back("error", "Kaydedilemedi: " + error.message);
  revalidatePath("/", "layout");
  back("saved");
}


// Bildirim e-postasını dener ve gerçek sonucu (hata dahil) ekranda gösterir.
export async function testNotifyMail() {
  await requireAdmin();
  const to = adminMail();
  let msg = "";
  if (!to) msg = "Vercel'de GMAIL_USER tanımlı değil.";
  else {
    const r = await sendMail({ to, subject: "Yatpaketi test e-postası", text: "Bu bir test e-postasıdır. Yeni talep bildirimleri bu adrese gelir.", html: wrap("<p>Bu bir test e-postasıdır. Yeni talep bildirimleri bu adrese gelir.</p>") });
    msg = r.ok ? `Test e-postası ${to} adresine gönderildi. Gelen kutusu ve Spam klasörüne bakın.` : `Gönderilemedi: ${r.message}`;
  }
  redirect("/admin/ayarlar?mail=" + encodeURIComponent(msg) + `&t=${Date.now()}`);
}

// Gerçek talep e-postasının aynısını örnek verilerle gönderir; hatayı ekranda gösterir.
export async function testRequestMail() {
  await requireAdmin();
  const r = await notifyAdmin({ name: "Test Müşteri", phone: "0500 000 00 00", email: "test@example.com", boat: "Örnek Yat", start: "2027-06-01", end: "2027-06-08", guests: 4, message: "Bu bir örnek taleptir." });
  redirect("/admin/ayarlar?mail=" + encodeURIComponent(r.ok ? "Örnek talep e-postası gönderildi. Gelen kutusuna bakın." : "Talep e-postası gönderilemedi: " + r.message) + `&t=${Date.now()}`);
}

// ---- Instagram bağlantısı ----

export async function saveInstagram(formData: FormData) {
  const { supabase } = await requireAdmin();
  const token = String(formData.get("ig_token") ?? "").replace(/\s+/g, "");
  if (!token) back("error", "Instagram erişim anahtarını yapıştırın.");
  const c = await igCheck(token);
  if (!c.ok) back("error", "Instagram bu anahtarı kabul etmedi: " + (c.message ?? "") + " Anahtarı yeniden kopyalayıp deneyin.");
  const { error } = await supabase.from("private_settings").upsert({ key: "instagram", value: { token, username: c.username, refreshed_at: new Date().toISOString() }, updated_at: new Date().toISOString() });
  if (error) back("error", error.message.includes("private_settings") ? "Önce Supabase'de instagram.sql dosyasını çalıştırın." : "Kaydedilemedi: " + error.message);
  revalidatePath("/", "layout");
  back("saved");
}

export async function removeInstagram() {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("private_settings").delete().eq("key", "instagram");
  if (error) back("error", "Kaldırılamadı: " + error.message);
  revalidatePath("/", "layout");
  back("saved");
}
