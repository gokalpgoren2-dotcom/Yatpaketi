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
