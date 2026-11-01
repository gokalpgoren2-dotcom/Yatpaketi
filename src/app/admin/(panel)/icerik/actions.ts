"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";

// Yönetici içeriği kaydettikten sonra herkese açık sayfaların yenilenmesini sağlar.
export async function refreshSite() {
  await requireAdmin();
  revalidatePath("/");
  revalidatePath("/en");
  revalidatePath("/limanlar");
  revalidatePath("/tekneler");
  revalidatePath("/limanlar/[slug]", "page");
  revalidatePath("/tekneler/[slug]", "page");
  revalidatePath("/en/tekneler/[slug]", "page");
  revalidatePath("/en/limanlar/[slug]", "page");
  revalidatePath("/tekne-tipleri/[slug]", "page");
  revalidatePath("/rehber");
  revalidatePath("/blog");
  revalidatePath("/sss");
  revalidatePath("/en/sss");
  revalidatePath("/yat-ve-yatcilik-kulturu");
  revalidatePath("/hakkimizda");
  revalidatePath("/en/hakkimizda");
  revalidatePath("/en/yat-ve-yatcilik-kulturu");
}
