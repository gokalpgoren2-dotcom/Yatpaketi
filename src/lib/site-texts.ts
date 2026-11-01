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
