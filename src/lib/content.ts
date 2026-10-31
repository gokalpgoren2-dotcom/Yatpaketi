import { createClient } from "@supabase/supabase-js";
import { destinations as sampleDestinations, type Destination } from "./data";
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
