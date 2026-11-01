import { createClient } from "@supabase/supabase-js";
import { supabaseConfigured } from "./supabase/config";
import type { Lang } from "./i18n";

// Kampanya kartları: Admin > Kampanyalar'dan yönetilir, site_texts tablosunda "campaigns" anahtarıyla saklanır.
export type Campaign = {
  id: string;
  active: boolean;
  badge: string; badgeEn: string;      // "Erken Rezervasyon"
  title: string; titleEn: string;      // "Temmuz haftalarında erken rezervasyon fırsatı"
  text: string; textEn: string;        // kısa açıklama
  discount: string;                    // "%15", "1 gün hediye" (boş olabilir)
  until: string;                       // "2027-03-31" (boş = süresiz)
  cta: string; ctaEn: string;          // düğme yazısı
  link: string;                        // "/tekneler", "/iletisim", https://...
  image: string;                       // storage yolu (boş olabilir)
};

export const emptyCampaign = (): Campaign => ({
  id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()),
  active: false, badge: "", badgeEn: "", title: "", titleEn: "", text: "", textEn: "",
  discount: "", until: "", cta: "", ctaEn: "", link: "/tekneler", image: "",
});

// Bitiş gününün sonuna (Türkiye saatiyle) kadar geçerli.
export function endsAt(c: Pick<Campaign, "until">): Date | null {
  if (!c.until) return null;
  const d = new Date(`${c.until}T23:59:59+03:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isLive(c: Campaign, now = new Date()): boolean {
  if (!c.active) return false;
  if (!(c.title.trim() || c.titleEn.trim())) return false;
  const e = endsAt(c);
  return !e || e.getTime() >= now.getTime();
}

export async function getCampaigns(lang: Lang = "tr"): Promise<Campaign[]> {
  if (!supabaseConfigured()) return [];
  try {
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data } = await db.from("site_texts").select("data").eq("key", "campaigns").maybeSingle();
    const items: Campaign[] = Array.isArray(data?.data?.items) ? data!.data.items : [];
    return items.filter((c) => isLive(c)).filter((c) => (lang === "en" ? c.titleEn.trim() : c.title.trim()));
  } catch {
    return [];
  }
}
