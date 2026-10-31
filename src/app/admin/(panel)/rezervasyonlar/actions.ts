"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

const STATUSES = ["new", "contacted", "offered", "confirmed", "cancelled"];

export async function updateRequest(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const notes = String(formData.get("admin_notes") ?? "").trim().slice(0, 2000);
  if (!id || !STATUSES.includes(status)) redirect("/admin/rezervasyonlar?error=" + encodeURIComponent("Geçersiz durum.") + `&t=${Date.now()}`);
  const reason = String(formData.get("cancel_reason") ?? "").trim().slice(0, 1000);
  if (status === "cancelled" && !reason) redirect("/admin/rezervasyonlar?error=" + encodeURIComponent("İptal için iptal sebebini yazın.") + `&t=${Date.now()}`);
  const fields: Record<string, unknown> = { status, admin_notes: notes || null };
  if (status === "cancelled") {
    fields.cancel_reason = reason;
    const { data: cur } = await supabase.from("reservation_requests").select("status").eq("id", id).maybeSingle();
    if (!cur || cur.status !== "cancelled") fields.cancelled_at = new Date().toISOString(); // ilk iptal zamanı korunur
  }
  const { error } = await supabase.from("reservation_requests").update(fields).eq("id", id);
  if (error) redirect("/admin/rezervasyonlar?error=" + encodeURIComponent("Kaydedilemedi: " + error.message + (error.message.includes("cancel") ? " (Supabase'e iptal sebebi SQL kodunu yapıştırdınız mı?)" : "")) + `&t=${Date.now()}`);
  revalidatePath("/admin/rezervasyonlar");
  revalidatePath("/admin");
  redirect(`/admin/rezervasyonlar?saved=1&t=${Date.now()}`);
}

export async function deleteRequest(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/admin/rezervasyonlar?error=" + encodeURIComponent("Talep bulunamadı.") + `&t=${Date.now()}`);
  const { error } = await supabase.from("reservation_requests").delete().eq("id", id);
  if (error) redirect("/admin/rezervasyonlar?error=" + encodeURIComponent("Silinemedi: " + error.message) + `&t=${Date.now()}`);
  revalidatePath("/admin/rezervasyonlar");
  revalidatePath("/admin");
  redirect(`/admin/rezervasyonlar?saved=1&t=${Date.now()}`);
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
