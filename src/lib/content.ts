import { createClient } from "@supabase/supabase-js";
import { boats as sampleBoats, categories as sampleCategories, destinations as sampleDestinations, type Boat, type Destination } from "./data";
import { publicImageUrl, supabaseConfigured } from "./supabase/config";
import { normalizePhone } from "./phone";
import { slugify } from "./slug";
import { getOffers } from "./campaigns";
import { getRatings } from "./reviews";
import { t, type Lang } from "./i18n";

// Herkese açık okuma: oturum/çerez gerektirmez, yalnızca RLS'in izin verdiği (yayınlanmış) içerik gelir.
function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type HomeContent = { heroImage: string | null; title: string; subtitle: string };

export const homeDefaults: HomeContent = {
  heroImage: null,
  title: "Hayalinizdeki mavi yolculuğu kiralayın",
  subtitle: "Gulet, motoryat, katamaran ve yelkenli seçeneklerini keşfedin, rezervasyon talebinizi iletin.",
};

export async function getHome(lang: Lang = "tr"): Promise<HomeContent> {
  const defs: HomeContent = lang === "en" ? { heroImage: null, title: t("en").heroTitle, subtitle: t("en").heroSubtitle } : homeDefaults;
  if (!supabaseConfigured()) return defs;
  try {
    const { data } = await db().from("site_settings").select("value").eq("key", "home").maybeSingle();
    const v = (data?.value ?? {}) as { hero_path?: string; title?: string; subtitle?: string; title_en?: string; subtitle_en?: string };
    return {
      heroImage: publicImageUrl(v.hero_path),
      title: (lang === "en" ? v.title_en?.trim() : v.title?.trim()) || defs.title,
      subtitle: (lang === "en" ? v.subtitle_en?.trim() : v.subtitle?.trim()) || defs.subtitle,
    };
  } catch {
    return defs;
  }
}

// Destinasyonlar veritabanından gelir. Veritabanına ulaşılamazsa örnek liste kullanılır.
export async function getDestinations(lang: Lang = "tr"): Promise<Destination[]> {
  if (!supabaseConfigured()) return sampleDestinations;
  try {
    const { data, error } = await db()
      .from("destinations")
      .select("slug,name_tr,name_en,blurb_tr,blurb_en,intro_tr,intro_en,cover_path,seo_title,seo_description")
      .eq("is_published", true)
      .order("sort_order");
    if (error || !data || data.length === 0) return sampleDestinations;
    return data.map((d, i) => ({
      slug: d.slug as string,
      name: ((lang === "en" ? d.name_en : null) || d.name_tr) as string,
      blurb: ((lang === "en" ? d.blurb_en : null) || d.blurb_tr || "") as string,
      intro: ((lang === "en" ? d.intro_en : null) || d.intro_tr || "") as string,
      hue: 175 + i * 9,
      image: publicImageUrl(d.cover_path as string | null),
      seoTitle: (d.seo_title as string | null) ?? "",
      seoDescription: (d.seo_description as string | null) ?? "",
    }));
  } catch {
    return sampleDestinations;
  }
}

// ---- Yatlar ----

type Row = Record<string, any>;

function hueFor(slug: string) {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) % 360;
  return 170 + (h % 60);
}

function mapBoat(r: Row, lang: Lang = "tr"): Boat {
  const imgs = ((r.boat_images ?? []) as { path: string; is_cover: boolean; sort_order: number }[])
    .slice()
    .sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order)
    .map((i) => publicImageUrl(i.path)!)
    .filter(Boolean);
  const dests = ((r.boat_destinations ?? []) as { destinations: { slug: string } | null }[])
    .map((x) => x.destinations?.slug)
    .filter((x): x is string => Boolean(x));
  return {
    slug: r.slug,
    name: r.name,
    type: (lang === "en" ? r.categories?.name_en : null) || r.categories?.name_tr || "",
    brand: r.brand ?? "",
    model: r.model ?? "",
    year: r.year ?? null,
    refit: r.refit_year ?? null,
    port: r.home_port ?? "",
    destinations: dests,
    guests: r.guests ?? 1,
    cabins: r.cabins ?? 0,
    crew: r.crew ?? 0,
    length: Number(r.length_m ?? 0),
    width: Number(r.width_m ?? 0),
    captained: Boolean(r.captain_included),
    priceDaily: r.price_daily == null ? null : Number(r.price_daily),
    priceWeekly: r.price_weekly == null ? null : Number(r.price_weekly),
    included: (r.included ?? []) as string[],
    excluded: (r.excluded ?? []) as string[],
    vatMode: (r.vat_mode === "included" || r.vat_mode === "excluded" ? r.vat_mode : "none") as "none" | "included" | "excluded",
    vatRate: r.vat_rate == null ? 20 : Number(r.vat_rate),
    brochure: r.brochure_path ? publicImageUrl(r.brochure_path as string) : null,
    // APA yüzdesi monthly_prices içinde "apa" anahtarında tutulur (ek sütun gerektirmesin diye)
    apa: [5, 20, 30, 35, 40].includes(Number((r.monthly_prices ?? {}).apa)) ? Number((r.monthly_prices ?? {}).apa) : 0,
    // monthly_prices: {"4": günlük, ..., "w4": haftalık, ...}
    monthly: Object.fromEntries(Object.entries((r.monthly_prices ?? {}) as Record<string, unknown>).filter(([k]) => !k.startsWith("w")).map(([k, v]) => [Number(k), Number(v)]).filter(([k, v]) => k >= 1 && k <= 12 && v > 0)),
    weekly: Object.fromEntries(Object.entries((r.monthly_prices ?? {}) as Record<string, unknown>).filter(([k]) => k.startsWith("w")).map(([k, v]) => [Number(k.slice(1)), Number(v)]).filter(([k, v]) => k >= 1 && k <= 12 && v > 0)),
    showPrice: r.price_mode !== "ask",
    currency: r.currency ?? "EUR",
    equipment: r.equipment ?? [],
    waterSports: r.water_sports ?? [],
    description: (lang === "en" ? r.description_en : null) || r.description_tr || "",
    hue: hueFor(r.slug),
    addedAt: r.created_at ?? "",
    image: imgs[0] ?? null,
    images: imgs,
    featured: Boolean(r.is_featured),
  };
}

const BOAT_SELECT =
  "*, categories(name_tr,name_en), boat_destinations(destinations(slug)), boat_images(path,is_cover,sort_order)";

// Yayındaki yatlar. Supabase tanımlı değilse örnek yatlar (sample: true) döner.
export async function getBoats(lang: Lang = "tr"): Promise<{ boats: Boat[]; sample: boolean }> {
  if (!supabaseConfigured()) return { boats: sampleBoats, sample: true };
  try {
    const { data, error } = await db().from("boats").select(BOAT_SELECT).eq("is_published", true).order("sort_order").order("created_at", { ascending: false });
    if (error) throw error;
    const [offers, ratings] = await Promise.all([getOffers(), getRatings()]);
    return { boats: (data ?? []).map((r) => { const b = mapBoat(r, lang); return { ...b, offer: offers[b.slug] ?? null, rating: ratings[b.slug] ?? null }; }), sample: false };
  } catch {
    return { boats: [], sample: false };
  }
}

export async function getBoatBySlug(slug: string, lang: Lang = "tr"): Promise<{ boat: Boat | null; all: Boat[]; sample: boolean }> {
  const { boats, sample } = await getBoats(lang);
  return { boat: boats.find((b) => b.slug === slug) ?? null, all: boats, sample };
}

export type Category = { slug: string; name: string; intro: string; image: string | null; seoTitle: string; seoDescription: string };

const toCategory = (n: string): Category => ({ slug: slugify(n), name: n, intro: "", image: null, seoTitle: "", seoDescription: "" });

// Yat tipleri. Yeni alanlar (tanıtım metni vb.) henüz eklenmediyse yalnızca ad ve adres okunur.
export async function getCategories(lang: Lang = "tr"): Promise<Category[]> {
  if (!supabaseConfigured()) return sampleCategories.map(toCategory);
  try {
    const full = await db().from("categories").select("slug,name_tr,name_en,intro_tr,cover_path,seo_title,seo_description").eq("is_active", true).order("sort_order");
    if (!full.error && full.data && full.data.length > 0) {
      return full.data.map((c) => ({
        slug: c.slug as string, name: ((lang === "en" ? c.name_en : null) || c.name_tr) as string, intro: (c.intro_tr ?? "") as string,
        image: publicImageUrl(c.cover_path as string | null), seoTitle: (c.seo_title as string | null) ?? "", seoDescription: (c.seo_description as string | null) ?? "",
      }));
    }
    const basic = await db().from("categories").select("slug,name_tr,name_en").eq("is_active", true).order("sort_order");
    if (basic.error || !basic.data || basic.data.length === 0) return sampleCategories.map(toCategory);
    return basic.data.map((c) => ({ slug: c.slug as string, name: ((lang === "en" ? c.name_en : null) || c.name_tr) as string, intro: "", image: null, seoTitle: "", seoDescription: "" }));
  } catch {
    return sampleCategories.map(toCategory);
  }
}

export async function getCategoryNames(lang: Lang = "tr"): Promise<string[]> {
  return (await getCategories(lang)).map((c) => c.name);
}

// ---- İletişim ayarları (Panel > Ayarlar) ----
export type Contact = { phone: string; whatsapp: string; email: string; instagram: string; tiktok: string; linkedin: string };

export async function getContact(): Promise<Contact> {
  // TikTok ve LinkedIn henüz açılmadı: Ayarlar'dan girilene kadar örnek adresler görünür.
  const empty = { phone: "", whatsapp: "", email: "", instagram: "https://www.instagram.com/yatpaketi/", tiktok: "https://www.tiktok.com/@yatpaketi", linkedin: "https://www.linkedin.com/company/yatpaketi/" };
  if (!supabaseConfigured()) return empty;
  try {
    const { data } = await db().from("site_settings").select("value").eq("key", "contact").maybeSingle();
    const v = (data?.value ?? {}) as Partial<Contact>;
    return {
      phone: normalizePhone(v.phone ?? ""), whatsapp: normalizePhone(v.whatsapp ?? ""), email: v.email ?? "",
      // Instagram adresi girilmediyse markanın hesabı gösterilir
      instagram: v.instagram || empty.instagram, tiktok: v.tiktok ?? empty.tiktok, linkedin: v.linkedin ?? empty.linkedin,
    };
  } catch {
    return empty;
  }
}
