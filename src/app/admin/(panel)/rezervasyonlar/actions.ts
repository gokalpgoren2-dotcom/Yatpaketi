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
  const { error } = await supabase.from("reservation_requests").update({ status, admin_notes: notes || null }).eq("id", id);
  if (error) redirect("/admin/rezervasyonlar?error=" + encodeURIComponent("Kaydedilemedi: " + error.message) + `&t=${Date.now()}`);
  revalidatePath("/admin/rezervasyonlar");
  revalidatePath("/admin");
  redirect(`/admin/rezervasyonlar?saved=1&t=${Date.now()}`);
}

// Talebin tarihlerini ilgili teknenin takviminde dolu olarak işaretler.
export async function markBlocked(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const go = (kind: "saved" | "error", msg = ""): never =>
    redirect(`/admin/rezervasyonlar?${kind === "saved" ? "saved=1" : "error=" + encodeURIComponent(msg)}&t=${Date.now()}`);

  const { data: r } = await supabase.from("reservation_requests").select("boat_id,customer_name,start_date,end_date").eq("id", id).maybeSingle();
  if (!r || !r.boat_id || !r.start_date || !r.end_date) return go("error", "Bu talepte tekne veya tarih bilgisi eksik.");
  const { data: clash } = await supabase.from("availability_blocks").select("id").eq("boat_id", r.boat_id).lte("start_date", r.end_date).gte("end_date", r.start_date).limit(1);
  if (clash && clash.length > 0) return go("error", "Bu tarihlerde takvimde zaten bir kayıt var.");
  const { error } = await supabase.from("availability_blocks").insert({ boat_id: r.boat_id, start_date: r.start_date, end_date: r.end_date, kind: "booked", note: `Talep: ${r.customer_name}` });
  if (error) return go("error", "Kaydedilemedi: " + error.message);
  revalidatePath("/tekneler");
  return go("saved");
}
