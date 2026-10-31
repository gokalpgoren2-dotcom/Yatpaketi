"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { normalizePhone } from "@/lib/phone";

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

  const { error } = await supabase.from("site_settings").upsert({ key: "contact", value: { phone, whatsapp, email }, updated_at: new Date().toISOString() });
  if (error) back("error", "Kaydedilemedi: " + error.message);
  revalidatePath("/", "layout");
  back("saved");
}
