import { createClient } from "@supabase/supabase-js";
import { cache } from "react";
import { publicImageUrl, supabaseConfigured } from "./supabase/config";

export type PostKind = "blog" | "guide" | "page" | "destination" | "route" | "package" | "process";

export type Post = {
  slug: string;
  kind: PostKind;
  title: string;
  excerpt: string;
  content: string;
  cover: string | null;
  publishedAt: string | null;
  seoTitle: string;
  seoDescription: string;
};

function db() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const COLS = "slug,kind,title_tr,excerpt_tr,content_tr,cover_path,published_at,seo_title,seo_description";

function map(r: Record<string, any>): Post {
  return {
    slug: r.slug,
    kind: r.kind,
    title: r.title_tr ?? "",
    excerpt: r.excerpt_tr ?? "",
    content: r.content_tr ?? "",
    cover: publicImageUrl(r.cover_path),
    publishedAt: r.published_at ?? null,
    seoTitle: r.seo_title ?? "",
    seoDescription: r.seo_description ?? "",
  };
}

// Yayındaki yazılar. Veritabanı alanı (kind) henüz eklenmediyse ya da bağlantı yoksa boş liste döner.
export async function getPosts(kinds: PostKind | PostKind[], limit?: number): Promise<Post[]> {
  if (!supabaseConfigured()) return [];
  try {
    const list = Array.isArray(kinds) ? kinds : [kinds];
    let q = db().from("blog_posts").select(COLS).eq("status", "published").in("kind", list).order("sort_order").order("published_at", { ascending: false, nullsFirst: false });
    if (limit) q = q.limit(limit);
    const { data, error } = await q;
    if (error || !data) return [];
    return data.map(map);
  } catch {
    return [];
  }
}

export async function getPost(kind: PostKind, slug: string): Promise<Post | null> {
  if (!supabaseConfigured()) return null;
  try {
    const { data, error } = await db().from("blog_posts").select(COLS).eq("status", "published").eq("kind", kind).eq("slug", slug).maybeSingle();
    if (error || !data) return null;
    return map(data);
  } catch {
    return null;
  }
}

// Menü ve alt bilgi için: hangi bölümlerin dolu olduğu.
export const getNavInfo = cache(async () => {
  const [guides, blogs, pages, rest] = await Promise.all([
    getPosts("guide", 1), getPosts("blog", 1), getPosts("page"), getPosts(["destination", "route", "package", "process"]),
  ]);
  const has = (k: PostKind) => rest.some((p) => p.kind === k);
  return {
    hasGuides: guides.length > 0,
    hasBlog: blogs.length > 0,
    hasDestinations: has("destination"),
    hasRoutes: has("route"),
    hasPackages: has("package"),
    hasProcess: has("process"),
    pages: pages.map((p) => ({ slug: p.slug, title: p.title })),
  };
});
