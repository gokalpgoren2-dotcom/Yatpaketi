import { createClient } from "@supabase/supabase-js";
import { supabaseConfigured } from "./supabase/config";
import type { Lang } from "./i18n";

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
  boats: string[];              // seçili teknelerin slug'ları; boşsa tüm tekneler
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

export type CampaignView = { id: string; badge: string; discount: string; title: string; text: string; link: string; cta: string; until: string; image: string };

export function buildView(c: Campaign, lang: Lang, names: Record<string, string>): CampaignView | null {
  const en = lang === "en";
  const picked = c.boats.filter((s) => names[s]);
  if (c.boats.length > 0 && picked.length === 0) return null; // seçilen tekneler artık yayında değil
  const p = c.percent;
  const early = c.kind === "early";
  const auto = en
    ? { badge: early ? "Early Booking" : "Offer", title: early ? `${p}% off when you book early` : `${p}% off`, }
    : { badge: early ? "Erken Rezervasyon" : "İndirim", title: early ? `Erken rezervasyonda %${p} indirim` : `%${p} indirim fırsatı` };
  const list = picked.map((s) => names[s]);
  const shown = list.slice(0, 3).join(", ") + (list.length > 3 ? (en ? ` +${list.length - 3} more` : ` +${list.length - 3} tekne`) : "");
  const autoText = list.length === 0
    ? (en ? "Valid on all yachts." : "Tüm teknelerde geçerli.")
    : (en ? `Valid on: ${shown}.` : `Geçerli tekneler: ${shown}.`);
  const link = picked.length === 1 ? `/tekneler/${picked[0]}` : "/tekneler";
  const cta = picked.length === 1 ? (en ? "View the yacht" : "Tekneyi incele") : (en ? "Browse yachts" : "Tekneleri incele");
  return {
    id: c.id,
    badge: auto.badge,
    discount: en ? `${p}%` : `%${p}`,
    title: (en ? c.titleEn.trim() : c.title.trim()) || auto.title,
    text: (en ? c.textEn.trim() : c.text.trim()) || autoText,
    link, cta, until: c.until, image: c.image,
  };
}

export async function getCampaigns(lang: Lang = "tr"): Promise<CampaignView[]> {
  if (!supabaseConfigured()) return [];
  try {
    const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data } = await db.from("site_texts").select("data").eq("key", "campaigns").maybeSingle();
    const items: Campaign[] = Array.isArray(data?.data?.items) ? data!.data.items : [];
    const live = items.filter((c) => c && c.kind && c.percent && isLive(c));
    if (live.length === 0) return [];
    const { data: boats } = await db.from("boats").select("slug,name").eq("is_published", true);
    const names: Record<string, string> = {};
    for (const b of boats ?? []) names[b.slug as string] = b.name as string;
    return live.map((c) => buildView(c, lang, names)).filter((v): v is CampaignView => v !== null);
  } catch {
    return [];
  }
}
