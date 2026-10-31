import { createClient } from "@supabase/supabase-js";
import { boats as sampleBoats, categories as sampleCategories, destinations as sampleDestinations, type Boat, type Destination } from "./data";
import { publicImageUrl, supabaseConfigured } from "./supabase/config";

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

export async function getHome(): Promise<HomeContent> {
  if (!supabaseConfigured()) return homeDefaults;
  try {
    const { data } = await db().from("site_settings").select("value").eq("key", "home").maybeSingle();
    const v = (data?.value ?? {}) as { hero_path?: string; title?: string; subtitle?: string };
    return {
      heroImage: publicImageUrl(v.hero_path),
      title: v.title?.trim() || homeDefaults.title,
      subtitle: v.subtitle?.trim() || homeDefaults.subtitle,
    };
  } catch {
    return homeDefaults;
  }
}

// Destinasyonlar veritabanından gelir. Veritabanına ulaşılamazsa örnek liste kullanılır.
export async function getDestinations(): Promise<Destination[]> {
  if (!supabaseConfigured()) return sampleDestinations;
  try {
    const { data, error } = await db()
      .from("destinations")
      .select("slug,name_tr,blurb_tr,intro_tr,cover_path")
      .eq("is_published", true)
      .order("sort_order");
    if (error || !data || data.length === 0) return sampleDestinations;
    return data.map((d, i) => ({
      slug: d.slug as string,
      name: d.name_tr as string,
      blurb: (d.blurb_tr as string | null) ?? "",
      intro: (d.intro_tr as string | null) ?? "",
      hue: 175 + i * 9,
      image: publicImageUrl(d.cover_path as string | null),
    }));
  } catch {
    return sampleDestinations;
  }
}

// ---- Tekneler ----

type Row = Record<string, any>;

function hueFor(slug: string) {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) % 360;
  return 170 + (h % 60);
}

function mapBoat(r: Row): Boat {
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
    type: r.categories?.name_tr ?? "",
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
    showPrice: r.price_mode !== "ask",
    currency: r.currency ?? "EUR",
    equipment: r.equipment ?? [],
    waterSports: r.water_sports ?? [],
    description: r.description_tr ?? "",
    hue: hueFor(r.slug),
    addedAt: r.created_at ?? "",
    image: imgs[0] ?? null,
    images: imgs,
    featured: Boolean(r.is_featured),
  };
}

const BOAT_SELECT =
  "*, categories(name_tr), boat_destinations(destinations(slug)), boat_images(path,is_cover,sort_order)";

// Yayındaki tekneler. Supabase tanımlı değilse örnek tekneler (sample: true) döner.
export async function getBoats(): Promise<{ boats: Boat[]; sample: boolean }> {
  if (!supabaseConfigured()) return { boats: sampleBoats, sample: true };
  try {
    const { data, error } = await db().from("boats").select(BOAT_SELECT).eq("is_published", true).order("sort_order").order("created_at", { ascending: false });
    if (error) throw error;
    return { boats: (data ?? []).map(mapBoat), sample: false };
  } catch {
    return { boats: [], sample: false };
  }
}

export async function getBoatBySlug(slug: string): Promise<{ boat: Boat | null; all: Boat[]; sample: boolean }> {
  const { boats, sample } = await getBoats();
  return { boat: boats.find((b) => b.slug === slug) ?? null, all: boats, sample };
}

export async function getCategoryNames(): Promise<string[]> {
  if (!supabaseConfigured()) return sampleCategories;
  try {
    const { data, error } = await db().from("categories").select("name_tr").eq("is_active", true).order("sort_order");
    if (error || !data || data.length === 0) return sampleCategories;
    return data.map((c) => c.name_tr as string);
  } catch {
    return sampleCategories;
  }
}

// ---- İletişim ayarları (Panel > Ayarlar) ----
export type Contact = { phone: string; whatsapp: string; email: string };

export async function getContact(): Promise<Contact> {
  const empty = { phone: "", whatsapp: "", email: "" };
  if (!supabaseConfigured()) return empty;
  try {
    const { data } = await db().from("site_settings").select("value").eq("key", "contact").maybeSingle();
    const v = (data?.value ?? {}) as Partial<Contact>;
    return { phone: v.phone ?? "", whatsapp: v.whatsapp ?? "", email: v.email ?? "" };
  } catch {
    return empty;
  }
}
