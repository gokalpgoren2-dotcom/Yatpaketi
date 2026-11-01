import type { Metadata } from "next";
import { getCategories } from "@/lib/content";
import { CategoryView } from "@/views/CategoryView";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = (await getCategories()).find((x) => x.slug === slug);
  if (!c) return {};
  return {
    title: c.seoTitle || `${c.name} Kiralama`,
    description: c.seoDescription || `${c.name} kiralama seçenekleri ve tekneler.`,
    alternates: { canonical: `/tekne-tipleri/${c.slug}`, languages: { tr: `/tekne-tipleri/${c.slug}`, en: `/en/tekne-tipleri/${c.slug}` } },
    robots: { index: false, follow: true }, // Google'a açma adımına kadar kapalı
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CategoryView lang="tr" slug={slug} />;
}
