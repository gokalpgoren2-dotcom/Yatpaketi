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
