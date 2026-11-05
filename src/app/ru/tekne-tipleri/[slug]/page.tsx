import type { Metadata } from "next";
import { getCategories } from "@/lib/content";
import { CategoryView } from "@/views/CategoryView";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = (await getCategories("ru")).find((x) => x.slug === slug);
  if (!c) return {};
  return {
    title: `Аренда: ${c.name}`,
    description: `${c.name}: варианты аренды и яхты в Турции.`,
    alternates: { canonical: `/ru/tekne-tipleri/${c.slug}`, languages: { tr: `/tekne-tipleri/${c.slug}`, en: `/en/tekne-tipleri/${c.slug}`, ru: `/ru/tekne-tipleri/${c.slug}` } },
    robots: { index: false, follow: true },
  };
}

export default async function CategoryPageRu({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CategoryView lang="ru" slug={slug} />;
}
