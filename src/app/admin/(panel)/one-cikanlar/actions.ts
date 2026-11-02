"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

// Ana sayfadaki "öne çıkan" yatların sırası (site_texts: featured).
export async function moveFeatured(formData: FormData) {
  const { supabase } = await requireAdmin();
  const order = String(formData.get("order") ?? "").split(",").filter(Boolean);
  const slug = String(formData.get("slug"));
  const to = String(formData.get("to"));
  const i = order.indexOf(slug);
  if (i >= 0) {
    order.splice(i, 1);
    let j = i;
    if (to === "first") j = 0;
    else if (to === "last") j = order.length;
    else if (to === "middle") j = Math.floor(order.length / 2);
    else if (to === "up") j = Math.max(0, i - 1);
    else if (to === "down") j = Math.min(order.length, i + 1);
    order.splice(j, 0, slug);
    await supabase.from("site_texts").upsert({ key: "featured", data: { order }, updated_at: new Date().toISOString() });
  }
  revalidatePath("/");
  revalidatePath("/en");
  redirect("/admin/one-cikanlar");
}
