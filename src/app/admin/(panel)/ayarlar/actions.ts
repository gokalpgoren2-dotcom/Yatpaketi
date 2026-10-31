"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

function back(kind: "saved" | "error", msg = ""): never {
  redirect(`/admin/ayarlar?${kind === "saved" ? "saved=1" : "error=" + encodeURIComponent(msg)}&t=${Date.now()}`);
}

// Telefon: yalnızca rakam, ülke koduyla (ör. 905551234567). Başındaki + ve boşluklar silinir.
const digits = (v: string) => v.replace(/\D/g, "");

export async function saveContact(formData: FormData) {
  const { supabase } = await requireAdmin();
  const phone = digits(String(formData.get("phone") ?? ""));
  const whatsapp = digits(String(formData.get("whatsapp") ?? ""));
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (phone && (phone.length < 10 || phone.length > 15)) back("error", "Telefon numarasını ülke koduyla yazın. Örnek: 90 555 123 45 67");
  if (whatsapp && (whatsapp.length < 10 || whatsapp.length > 15)) back("error", "WhatsApp numarasını ülke koduyla yazın. Örnek: 90 555 123 45 67");
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) back("error", "E-posta adresi geçersiz görünüyor.");

  const { error } = await supabase.from("site_settings").upsert({ key: "contact", value: { phone, whatsapp, email }, updated_at: new Date().toISOString() });
  if (error) back("error", "Kaydedilemedi: " + error.message);
  revalidatePath("/", "layout");
  back("saved");
}
