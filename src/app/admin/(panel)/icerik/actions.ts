"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

// Yönetici içeriği kaydettikten sonra herkese açık sayfaların yenilenmesini sağlar.
export async function refreshSite() {
  await requireAdmin();
  revalidatePath("/");
  revalidatePath("/destinasyonlar");
  revalidatePath("/tekneler");
}
