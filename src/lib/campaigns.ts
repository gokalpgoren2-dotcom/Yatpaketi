import { createClient } from "@supabase/supabase-js";
import { supabaseConfigured } from "./supabase/config";
import type { Lang } from "./i18n";
import type { Offer } from "./data";

// Kampanya kartları: Admin > Kampanyalar'dan yönetilir, site_texts tablosunda "campaigns" anahtarıyla saklanır.
export type CampaignKind = "early" | "discount";
export const PERCENTS = [5, 10, 15, 20, 25, 30, 35, 40, 50];
export const KINDS: { key: CampaignKind; tr: string; hint: string }[] = [
  { key: "early", tr: "Erken rezervasyon", hint: "Önceden rezervasyon yaptıranlara indirim" },
  { key: "discount", tr: "İndirim", hint: "Belirli bir süre geçerli genel indirim" },
];

export type Campaign = {
  id: string;
  active: boolean;
  kind: CampaignKind;
  percent: number;
  boats: string[];              // seçili yatların slug'ları; boşsa tüm yatlar
  until: string;                // "2027-03-31"; boşsa süresiz
  title: string; titleEn: string; // isteğe bağlı: kendi başlığınız (boşsa otomatik yazılır)
  text: string; textEn: string;   // isteğe bağlı: kendi açıklamanız
  image: string;                // isteğe bağlı arka plan fotoğrafı (storage yolu)
};

export const emptyCampaign = (): Campaign => ({
  id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now()),
  active: true, kind: "early", percent: 10, boats: [], until: "", title: "", titleEn: "", text: "", textEn: "", image: "",
});

export function endsAt(until: string): Date | null {
  if (!until) return null;
  const d = new Date(`${until}T23:59:59+03:00`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isLive(c: Campaign, now = new Date()): boolean {
  if (!c.active) return false;
  const e = endsAt(c.until);
  return !e || e.getTime() >= now.getTime();
}

// Yat kartlarında ve yat sayfasında gösterilecek kampanya: yat başına en yüksek yüzdeli geçerli kampanya.
export async function getOffers(): Promise<Record<string, Offer>> {
  if (!supabaseConfigured()) return {};
  try {
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data } = await db.from("site_texts").select("data").eq("key", "campaigns").maybeSingle();
    const items: Campaign[] = Array.isArray(data?.data?.items) ? data!.data.items : [];
    const live = items.filter((c) => c && c.kind && c.percent && isLive(c));
    if (live.length === 0) return {};
    const { data: boats } = await db.from("boats").select("slug").eq("is_published", true);
    const out: Record<string, Offer> = {};
    for (const b of boats ?? []) {
      const slug = b.slug as string;
      for (const c of live) {
        if (c.boats.length > 0 && !c.boats.includes(slug)) continue;
        if (!out[slug] || c.percent > out[slug].percent) out[slug] = { kind: c.kind, percent: c.percent, until: c.until };
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function offerLabel(o: Offer, lang: Lang): string {
  const en = lang !== "tr";
  const ru = lang === "ru";
  if (o.kind === "early") return ru ? `Раннее бронирование −${o.percent}%` : en ? `Early booking ${o.percent}% off` : `Erken rezervasyon %${o.percent}`;
  return ru ? `Скидка ${o.percent}%` : en ? `${o.percent}% off` : `%${o.percent} indirim`;
}

export function offerUntil(o: Offer, lang: Lang): string {
  const e = endsAt(o.until);
  if (!e) return "";
  const date = e.toLocaleDateString(lang === "ru" ? "ru-RU" : lang !== "tr" ? "en-GB" : "tr-TR", { day: "numeric", month: "long", timeZone: "Europe/Istanbul" });
  return lang === "ru" ? `Действует до ${date}` : lang !== "tr" ? `Valid until ${date}` : `${date} tarihine kadar geçerli`;
}
