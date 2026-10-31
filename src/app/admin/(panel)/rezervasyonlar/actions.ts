"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

const STATUSES = ["new", "contacted", "offered", "confirmed", "cancelled"];

export async function updateRequest(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = formData.get("confirm") ? "confirmed" : String(formData.get("status") ?? "");
  const notes = String(formData.get("admin_notes") ?? "").trim().slice(0, 2000);
  if (!id || !STATUSES.includes(status)) redirect("/admin/rezervasyonlar?error=" + encodeURIComponent("Geçersiz durum.") + `&t=${Date.now()}`);
  const reason = String(formData.get("cancel_reason") ?? "").trim().slice(0, 1000);
  if (status === "cancelled" && !reason) redirect("/admin/rezervasyonlar?error=" + encodeURIComponent("İptal için iptal sebebini yazın.") + `&t=${Date.now()}`);
  // Onaylarken aynı teknede çakışan onaylı rezervasyon ya da kapalı tarih varsa uyarır (çift rezervasyonu önler).
  if (status === "confirmed") {
    const { data: me } = await supabase.from("reservation_requests").select("boat_id,start_date,end_date").eq("id", id).maybeSingle();
    if (me?.boat_id && me.start_date && me.end_date) {
      const [{ data: other }, { data: closed }] = await Promise.all([
        supabase.from("reservation_requests").select("customer_name,start_date,end_date").eq("boat_id", me.boat_id).eq("status", "confirmed").neq("id", id).lte("start_date", me.end_date).gte("end_date", me.start_date).limit(1),
        supabase.from("availability_blocks").select("start_date,end_date,note").eq("boat_id", me.boat_id).lte("start_date", me.end_date).gte("end_date", me.start_date).limit(1),
      ]);
      const hit = other?.[0] ? `${other[0].customer_name} adlı onaylı rezervasyon (${other[0].start_date} – ${other[0].end_date})` : closed?.[0] ? `kapatılmış tarihler (${closed[0].start_date} – ${closed[0].end_date}${closed[0].note ? ", " + closed[0].note : ""})` : "";
      if (hit) redirect("/admin/rezervasyonlar?error=" + encodeURIComponent("Onaylanamadı: bu tekne bu tarihlerde dolu, çakışan kayıt: " + hit + ". Takvim bölümünden kontrol edin.") + `&t=${Date.now()}`);
    }
  }
  const fields: Record<string, unknown> = { status, admin_notes: notes || null };
  if (status === "cancelled") {
    fields.cancel_reason = reason;
    const { data: cur } = await supabase.from("reservation_requests").select("status").eq("id", id).maybeSingle();
    if (!cur || cur.status !== "cancelled") fields.cancelled_at = new Date().toISOString(); // ilk iptal zamanı korunur
  }
  const { error } = await supabase.from("reservation_requests").update(fields).eq("id", id);
  if (error) redirect("/admin/rezervasyonlar?error=" + encodeURIComponent("Kaydedilemedi: " + error.message + (error.message.includes("cancel") ? " (Supabase'e iptal sebebi SQL kodunu yapıştırdınız mı?)" : "")) + `&t=${Date.now()}`);
  revalidatePath("/admin/rezervasyonlar");
  revalidatePath("/admin/turlar");
  revalidatePath("/admin");
  redirect(status === "confirmed" ? `/admin/turlar?saved=1&t=${Date.now()}` : `/admin/rezervasyonlar?saved=1&t=${Date.now()}`);
}

// Talebin müşteri bilgilerini (ad, telefon, e-posta, tarih, misafir sayısı) sonradan düzeltir.
export async function editRequestInfo(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const back = String(formData.get("next") ?? "") === "/admin/turlar" ? "/admin/turlar" : "/admin/rezervasyonlar";
  const fail = (m: string) => redirect(back + "?error=" + encodeURIComponent(m) + `&t=${Date.now()}`);
  if (!id) fail("Talep bulunamadı.");
  const name = String(formData.get("customer_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const start = String(formData.get("start_date") ?? "").trim();
  const end = String(formData.get("end_date") ?? "").trim();
  const guestsRaw = String(formData.get("guests") ?? "").trim();
  if (name.length < 2 || name.length > 100) fail("Ad en az 2, en çok 100 karakter olmalı.");
  const digits = phone.replace(/\D/g, "");
  if (phone && (digits.length < 7 || digits.length > 15)) fail("Telefon numarası geçersiz görünüyor.");
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) fail("E-posta adresi geçersiz görünüyor.");
  const dateOk = (v: string) => v === "" || (/^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)));
  if (!dateOk(start) || !dateOk(end)) fail("Tarih geçersiz.");
  if ((start === "") !== (end === "")) fail("Giriş ve çıkış tarihini birlikte girin (ya da ikisini de boş bırakın).");
  if (start && end < start) fail("Çıkış tarihi giriş tarihinden önce olamaz.");
  let guests: number | null = null;
  if (guestsRaw) { guests = Number(guestsRaw); if (!Number.isInteger(guests) || guests < 1 || guests > 100) fail("Misafir sayısı geçersiz."); }
  // Onaylı turun tarihi değişirse aynı teknede çakışma olmasın.
  const { data: cur } = await supabase.from("reservation_requests").select("status,boat_id").eq("id", id).maybeSingle();
  if (cur?.status === "confirmed" && cur.boat_id && start && end) {
    const [{ data: other }, { data: closed }] = await Promise.all([
      supabase.from("reservation_requests").select("customer_name,start_date,end_date").eq("boat_id", cur.boat_id).eq("status", "confirmed").neq("id", id).lte("start_date", end).gte("end_date", start).limit(1),
      supabase.from("availability_blocks").select("start_date,end_date").eq("boat_id", cur.boat_id).lte("start_date", end).gte("end_date", start).limit(1),
    ]);
    if (other?.[0]) fail(`Kaydedilemedi: bu tarihlerde ${other[0].customer_name} adlı onaylı rezervasyon var (${other[0].start_date} – ${other[0].end_date}).`);
    if (closed?.[0]) fail(`Kaydedilemedi: bu tarihler takvimde kapatılmış (${closed[0].start_date} – ${closed[0].end_date}).`);
  }
  const { error } = await supabase.from("reservation_requests").update({
    customer_name: name, phone: phone || null, email: email || null, start_date: start || null, end_date: end || null, guests,
  }).eq("id", id);
  if (error) fail("Kaydedilemedi: " + error.message);
  revalidatePath("/admin/rezervasyonlar");
  revalidatePath("/admin/turlar");
  revalidatePath("/admin");
  redirect(back + `?saved=1&t=${Date.now()}`);
}

// "Turu onayla" düğmesi: durumu Onaylandı yapar ve Turlar sayfasına götürür.
export async function confirmRequest(formData: FormData) {
  formData.set("confirm", "1");
  await updateRequest(formData);
}

// Onaylanmış turu tekrar "Teklif verildi" talebine geri alır (Turlar'dan kalkar, Rezervasyonlar'a döner).
export async function unconfirmRequest(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/turlar");
  const { error } = await supabase.from("reservation_requests").update({ status: "offered" }).eq("id", id);
  if (error) redirect("/admin/turlar?error=" + encodeURIComponent("Geri alınamadı: " + error.message) + `&t=${Date.now()}`);
  revalidatePath("/admin/rezervasyonlar");
  revalidatePath("/admin/turlar");
  revalidatePath("/admin");
  redirect(`/admin/turlar?saved=1&t=${Date.now()}`);
}

export async function deleteRequest(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/rezervasyonlar?error=" + encodeURIComponent("Talep bulunamadı.") + `&t=${Date.now()}`);
  const nx = String(formData.get("next") ?? "");
  const back = nx === "/admin/turlar" ? "/admin/turlar" : "/admin/rezervasyonlar";
  const { error } = await supabase.from("reservation_requests").delete().eq("id", id);
  if (error) redirect(back + "?error=" + encodeURIComponent("Silinemedi: " + error.message) + `&t=${Date.now()}`);
  revalidatePath("/admin/rezervasyonlar");
  revalidatePath("/admin/turlar");
  revalidatePath("/admin");
  redirect(back + `?saved=1&t=${Date.now()}`);
}

// İptal edilen kaydı yeniden aktif talebe çevirir (iptal sebebi ve tarihi kayıtta kalır).
export async function reopenRequest(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/iptal-edilenler");
  const { error } = await supabase.from("reservation_requests").update({ status: "contacted" }).eq("id", id);
  if (error) redirect("/admin/iptal-edilenler?error=" + encodeURIComponent("Açılamadı: " + error.message) + `&t=${Date.now()}`);
  revalidatePath("/admin/iptal-edilenler");
  revalidatePath("/admin/rezervasyonlar");
  revalidatePath("/admin");
  redirect("/admin/iptal-edilenler?saved=1&t=" + Date.now());
}

// Arşivdeki iptal kaydını ve yüklenmiş kanıt dosyalarını kalıcı olarak siler. Yalnızca iptal edilmiş kayıtlar silinebilir.
export async function deleteCancelledRequest(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const fail = (m: string) => redirect("/admin/iptal-edilenler?error=" + encodeURIComponent(m) + `&t=${Date.now()}`);
  if (!id) fail("Kayıt bulunamadı.");
  const { data } = await supabase.from("reservation_requests").select("status,cancel_files").eq("id", id).maybeSingle();
  if (!data || data.status !== "cancelled") fail("Yalnızca iptal edilmiş kayıtlar buradan silinebilir.");
  const files = ((data?.cancel_files ?? []) as string[]).filter(Boolean);
  if (files.length) await supabase.storage.from("contracts").remove(files);
  const { error } = await supabase.from("reservation_requests").delete().eq("id", id);
  if (error) fail("Silinemedi: " + error.message);
  revalidatePath("/admin/iptal-edilenler");
  revalidatePath("/admin");
  redirect("/admin/iptal-edilenler?saved=1&t=" + Date.now());
}
