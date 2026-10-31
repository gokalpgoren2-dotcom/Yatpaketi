"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin";
import { slugify } from "@/lib/slug";

const str = (fd: FormData, k: string) => {
  const v = String(fd.get(k) ?? "").trim();
  return v === "" ? null : v;
};
const num = (fd: FormData, k: string) => {
  const v = str(fd, k);
  if (v === null) return null;
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : NaN;
};
const lines = (fd: FormData, k: string) =>
  String(fd.get(k) ?? "").split(/\r?\n/).map((s) => s.trim()).filter(Boolean);

function fail(id: string | null, msg: string): never {
  const base = id ? `/admin/tekneler/${id}` : "/admin/tekneler/yeni";
  redirect(`${base}?error=${encodeURIComponent(msg)}`);
}

export async function saveBoat(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = str(formData, "id");

  const name = str(formData, "name");
  if (!name) fail(id, "Tekne adı zorunlu.");
  const slug = slugify(str(formData, "slug") ?? name!);
  if (!slug) fail(id, "Adres (slug) oluşturulamadı.");

  const year = num(formData, "year");
  const refit = num(formData, "refit_year");
  const length = num(formData, "length_m");
  const width = num(formData, "width_m");
  const cabins = num(formData, "cabins") ?? 0;
  const guests = num(formData, "guests") ?? 1;
  const crew = num(formData, "crew") ?? 0;
  const pd = num(formData, "price_daily");
  const pw = num(formData, "price_weekly");
  const sort = num(formData, "sort_order") ?? 0;
  const nums = [year, refit, length, width, cabins, guests, crew, pd, pw, sort];
  if (nums.some((n) => n !== null && Number.isNaN(n))) fail(id, "Sayı alanlarında geçersiz değer var.");
  if ([cabins, guests, crew, pd ?? 0, pw ?? 0, length ?? 0, width ?? 0].some((n) => (n as number) < 0)) fail(id, "Negatif değer girilemez.");
  if (guests < 1) fail(id, "Misafir sayısı en az 1 olmalı.");
  const maxYear = new Date().getFullYear() + 1;
  if (year !== null && (year < 1950 || year > maxYear)) fail(id, "Yapım yılı geçersiz.");
  if (refit !== null && (refit < 1950 || refit > maxYear)) fail(id, "Yenileme yılı geçersiz.");

  const priceMode = str(formData, "price_mode") === "ask" ? "ask" : "show";
  const currencyRaw = str(formData, "currency");
  const currency = currencyRaw === "TRY" || currencyRaw === "USD" ? currencyRaw : "EUR";

  const row = {
    name,
    slug,
    category_id: str(formData, "category_id"),
    brand: str(formData, "brand"),
    model: str(formData, "model"),
    year,
    refit_year: refit,
    length_m: length,
    width_m: width,
    cabins,
    guests,
    crew,
    captain_included: formData.get("captain_included") === "on",
    home_port: str(formData, "home_port"),
    description_tr: str(formData, "description_tr"),
    description_en: str(formData, "description_en"),
    equipment: lines(formData, "equipment"),
    water_sports: Array.from(new Set([...formData.getAll("water_sports").map(String).filter(Boolean), ...lines(formData, "water_sports_other")])),
    price_mode: priceMode,
    currency,
    price_daily: pd,
    price_weekly: pw,
    is_published: formData.get("is_published") === "on",
    is_featured: formData.get("is_featured") === "on",
    sort_order: sort,
    seo_title: str(formData, "seo_title"),
    seo_description: str(formData, "seo_description"),
  };

  let boatId = id;
  if (id) {
    const { error } = await supabase.from("boats").update(row).eq("id", id);
    if (error) fail(id, error.code === "23505" ? "Bu adres (slug) başka bir teknede kullanılıyor." : "Kaydedilemedi: " + error.message);
  } else {
    const { data, error } = await supabase.from("boats").insert(row).select("id").single();
    if (error || !data) fail(null, error?.code === "23505" ? "Bu adres (slug) başka bir teknede kullanılıyor." : "Kaydedilemedi: " + (error?.message ?? ""));
    boatId = data!.id as string;
  }

  // Destinasyonları eşitle
  const destIds = formData.getAll("destinations").map(String).filter(Boolean);
  await supabase.from("boat_destinations").delete().eq("boat_id", boatId!);
  if (destIds.length > 0) {
    const { error } = await supabase.from("boat_destinations").insert(destIds.map((d) => ({ boat_id: boatId!, destination_id: d })));
    if (error) fail(boatId, "Tekne kaydedildi ama destinasyonlar kaydedilemedi: " + error.message);
  }

  revalidatePath("/");
  revalidatePath("/tekneler");
  revalidatePath("/admin/tekneler");
  redirect(`/admin/tekneler/${boatId}?saved=1`);
}

export async function setPublished(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id"));
  await supabase.from("boats").update({ is_published: formData.get("value") === "true" }).eq("id", id);
  revalidatePath("/tekneler");
  revalidatePath("/admin/tekneler");
  redirect("/admin/tekneler");
}

export async function setFeatured(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id"));
  await supabase.from("boats").update({ is_featured: formData.get("value") === "true" }).eq("id", id);
  revalidatePath("/");
  revalidatePath("/admin/tekneler");
  redirect("/admin/tekneler");
}

export async function deleteBoat(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id"));
  const { data: imgs } = await supabase.from("boat_images").select("path").eq("boat_id", id);
  if (imgs && imgs.length > 0) await supabase.storage.from("media").remove(imgs.map((i: { path: string }) => i.path));
  const { error } = await supabase.from("boats").delete().eq("id", id);
  if (error) redirect(`/admin/tekneler/${id}?error=${encodeURIComponent("Silinemedi: " + error.message)}`);
  revalidatePath("/");
  revalidatePath("/tekneler");
  redirect("/admin/tekneler?deleted=1");
}
