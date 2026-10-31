"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

const UUID = /^[0-9a-f-]{36}$/i;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function addBlock(formData: FormData) {
  const { supabase } = await requireAdmin();
  const boat = String(formData.get("boat_id") ?? "");
  const start = String(formData.get("start") ?? "");
  const end = String(formData.get("end") ?? "");
  const kind = String(formData.get("kind") ?? "closed");
  const note = String(formData.get("note") ?? "").trim().slice(0, 200);
  const back = (m: string, ok = false) => redirect(`/admin/takvim?tekne=${encodeURIComponent(boat)}&ay=${(start || "").slice(0, 7)}&${ok ? "saved=1" : "error=" + encodeURIComponent(m)}&t=${Date.now()}`);
  if (!UUID.test(boat) || !DATE.test(start) || !DATE.test(end) || end < start || !["closed", "booked"].includes(kind)) back("Tekne ve geçerli bir tarih aralığı seçin.");
  const { error } = await supabase.from("availability_blocks").insert({ boat_id: boat, start_date: start, end_date: end, kind, note: note || null });
  if (error) back("Kaydedilemedi: " + error.message);
  revalidatePath("/admin/takvim");
  back("", true);
}

export async function deleteBlock(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!UUID.test(id)) redirect("/admin/takvim");
  const { data } = await supabase.from("availability_blocks").select("boat_id,start_date").eq("id", id).maybeSingle();
  const { error } = await supabase.from("availability_blocks").delete().eq("id", id);
  const base = data ? `?tekne=${data.boat_id}&ay=${String(data.start_date).slice(0, 7)}&` : "?";
  if (error) redirect(`/admin/takvim${base}error=${encodeURIComponent("Silinemedi: " + error.message)}&t=${Date.now()}`);
  revalidatePath("/admin/takvim");
  redirect(`/admin/takvim${base}saved=1&t=${Date.now()}`);
}
