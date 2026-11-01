import { createClient } from "@supabase/supabase-js";
import { publicImageUrl, supabaseConfigured, supabaseOrigin } from "./supabase/config";

export type Review = {
  id: string; boatSlug: string | null; boatName: string; author: string; rating: number; body: string;
  photo: string | null; tourLabel: string | null; createdAt: string;
};
export type Rating = { avg: number; count: number };

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
}

export const reviewPhotoUrl = (path: string | null | undefined) => (path ? `${supabaseOrigin()}/storage/v1/object/public/reviews/${path}` : null);

type Row = { id: string; boat_slug: string | null; boat_name: string; author_name: string; rating: number; body: string; photo_path: string | null; tour_label: string | null; created_at: string };
export const mapReview = (r: Row): Review => ({
  id: r.id, boatSlug: r.boat_slug, boatName: r.boat_name, author: r.author_name, rating: r.rating, body: r.body,
  photo: reviewPhotoUrl(r.photo_path), tourLabel: r.tour_label, createdAt: r.created_at,
});

const COLS = "id,boat_slug,boat_name,author_name,rating,body,photo_path,tour_label,created_at";

// Yalnızca onaylı yorumlar gelir (RLS). Hata olursa boş liste döner, sayfa bozulmaz.
export async function getReviews(opts: { boatSlugs?: string[]; limit?: number } = {}): Promise<Review[]> {
  if (!supabaseConfigured()) return [];
  try {
    let q = db().from("reviews").select(COLS).eq("status", "approved").order("created_at", { ascending: false });
    if (opts.boatSlugs) {
      if (opts.boatSlugs.length === 0) return [];
      q = q.in("boat_slug", opts.boatSlugs);
    }
    const { data } = await q.limit(opts.limit ?? 50);
    return ((data ?? []) as Row[]).map(mapReview);
  } catch {
    return [];
  }
}

export async function getRatings(): Promise<Record<string, Rating>> {
  if (!supabaseConfigured()) return {};
  try {
    const { data } = await db().from("reviews").select("boat_slug,rating").eq("status", "approved").not("boat_slug", "is", null);
    const sum: Record<string, { s: number; n: number }> = {};
    for (const r of data ?? []) {
      const k = r.boat_slug as string;
      (sum[k] ??= { s: 0, n: 0 }).s += r.rating as number;
      sum[k].n += 1;
    }
    return Object.fromEntries(Object.entries(sum).map(([k, v]) => [k, { avg: v.s / v.n, count: v.n }]));
  } catch {
    return {};
  }
}

export function averageOf(list: Review[]): Rating | null {
  if (list.length === 0) return null;
  return { avg: list.reduce((a, r) => a + r.rating, 0) / list.length, count: list.length };
}

export { publicImageUrl };
