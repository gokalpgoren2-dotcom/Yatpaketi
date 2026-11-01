import { createClient } from "@supabase/supabase-js";
import { supabaseConfigured } from "./supabase/config";
import { FAQ_DEFAULT, type FaqItem } from "./faq";
import { CULTURE } from "./culture";

// Panelden kaydedilen sayfa metinleri (site_texts tablosu). Kayıt yoksa ya da tablo henüz yoksa koddaki varsayılanlar kullanılır.
async function read(key: string): Promise<any | null> {
  if (!supabaseConfigured()) return null;
  try {
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await db.from("site_texts").select("data").eq("key", key).maybeSingle();
    if (error || !data) return null;
    return data.data;
  } catch {
    return null;
  }
}

export async function getFaqItems(): Promise<FaqItem[]> {
  const d = await read("faq");
  return Array.isArray(d?.items) ? (d.items as FaqItem[]) : FAQ_DEFAULT;
}

export type CultureData = typeof CULTURE;
export async function getCulture(): Promise<CultureData> {
  const d = await read("culture");
  if (!d) return CULTURE;
  return { tr: { ...CULTURE.tr, ...(d.tr ?? {}) }, en: { ...CULTURE.en, ...(d.en ?? {}) } };
}

import { ABOUT } from "./about";
export type AboutData = typeof ABOUT;
export async function getAbout(): Promise<AboutData> {
  const d = await read("about");
  if (!d) return ABOUT;
  return { tr: { ...ABOUT.tr, ...(d.tr ?? {}) }, en: { ...ABOUT.en, ...(d.en ?? {}) } };
}

import { SERVICES } from "./services";
export type ServicesData = typeof SERVICES;
export async function getServices(): Promise<ServicesData> {
  const d = await read("services");
  if (!d) return SERVICES;
  return { tr: { ...SERVICES.tr, ...(d.tr ?? {}) }, en: { ...SERVICES.en, ...(d.en ?? {}) } };
}

export async function getFeaturedOrder(): Promise<string[]> {
  const d = await read("featured");
  return Array.isArray(d?.order) ? d.order : [];
}

import { publicImageUrl } from "./supabase/config";
// Liman sayfalarındaki ek fotoğraflar: { liman-adresi: [yol, ...] } (site_texts: port_photos)
export async function getPortPhotos(slug: string): Promise<string[]> {
  const d = await read("port_photos");
  const list = d?.[slug];
  return Array.isArray(list) ? (list.map((x: string) => publicImageUrl(x)).filter(Boolean) as string[]) : [];
}
