import { createClient } from "@supabase/supabase-js";
import { cache } from "react";
import { publicImageUrl, supabaseConfigured } from "./supabase/config";
import type { Lang } from "./i18n";

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
const COLS_EN = COLS + ",title_en,excerpt_en,content_en,seo_title_en,seo_description_en";

function map(r: Record<string, any>, lang: Lang): Post {
  const en = lang !== "tr";
  const ru = lang === "ru";
  return {
    slug: r.slug,
    kind: r.kind,
    title: (en ? r.title_en : r.title_tr) ?? "",
    excerpt: (en ? r.excerpt_en : r.excerpt_tr) ?? "",
    content: (en ? r.content_en : r.content_tr) ?? "",
    cover: publicImageUrl(r.cover_path),
    publishedAt: r.published_at ?? null,
    seoTitle: (en ? r.seo_title_en : r.seo_title) ?? "",
    seoDescription: (en ? r.seo_description_en : r.seo_description) ?? "",
  };
}

// İngilizce sütunlar veritabanında yoksa (SQL henüz çalışmadıysa) İngilizce için boş döner, Türkçe etkilenmez.
export async function getPosts(kinds: PostKind | PostKind[], limit?: number, lang: Lang = "tr"): Promise<Post[]> {
  if (!supabaseConfigured()) return [];
  try {
    const list = Array.isArray(kinds) ? kinds : [kinds];
    let q = db().from("blog_posts").select(lang !== "tr" ? COLS_EN : COLS).eq("status", "published").in("kind", list).order("sort_order").order("published_at", { ascending: false, nullsFirst: false });
    if (lang !== "tr") q = q.not("title_en", "is", null).neq("title_en", "");
    if (limit) q = q.limit(limit);
    const { data, error } = await q;
    if (error || !data) return [];
    return (data as any[]).map((r) => map(r, lang));
  } catch {
    return [];
  }
}

export async function getPost(kind: PostKind, slug: string, lang: Lang = "tr"): Promise<Post | null> {
  if (!supabaseConfigured()) return null;
  try {
    const { data, error } = await db().from("blog_posts").select(lang !== "tr" ? COLS_EN : COLS).eq("status", "published").eq("kind", kind).eq("slug", slug).maybeSingle();
    if (error || !data) return null;
    const p = map(data as any, lang);
    return p.title ? p : null;
  } catch {
    return null;
  }
}

// Menü ve alt bilgi için: hangi bölümlerin dolu olduğu.
export const getNavInfo = cache(async (lang: Lang = "tr") => {
  const [guides, blogs, pages, rest] = await Promise.all([
    getPosts("guide", 1, lang), getPosts("blog", 1, lang), getPosts("page", undefined, lang), getPosts(["destination", "route", "package", "process"], undefined, lang),
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
