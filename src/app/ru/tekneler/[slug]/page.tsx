import type { Metadata } from "next";
import { getBoatBySlug } from "@/lib/content";
import { BoatView } from "@/views/BoatView";

export const revalidate = 60;
export const maxDuration = 30;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { boat: b } = await getBoatBySlug(slug, "ru");
  if (!b) return {};
  return {
    title: [b.name, b.type && `Аренда: ${b.type}`, b.port].filter(Boolean).join(" | "),
    description: `${b.name}: гостей — ${b.guests}${b.cabins ? `, кают — ${b.cabins}` : ""}${b.length ? `, ${b.length} м` : ""}.${b.port ? ` Отправление: ${b.port}.` : ""} Аренда яхты в Турции.`,
    alternates: { canonical: `/ru/tekneler/${b.slug}`, languages: { tr: `/tekneler/${b.slug}`, en: `/en/tekneler/${b.slug}`, ru: `/ru/tekneler/${b.slug}` } },
    robots: { index: false, follow: true },
  };
}

export default async function BoatPageRu({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <BoatView lang="ru" slug={slug} />;
}
