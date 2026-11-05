import type { Metadata } from "next";
import { getBoatBySlug } from "@/lib/content";
import { BoatView } from "@/views/BoatView";

export const revalidate = 60;
export const maxDuration = 30;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { boat: b } = await getBoatBySlug(slug, "en");
  if (!b) return {};
  return {
    title: [b.name, b.type && `${b.type} Charter`, b.port].filter(Boolean).join(" | "),
    description: `${b.name}: ${b.guests} guests${b.cabins ? `, ${b.cabins} cabins` : ""}${b.length ? `, ${b.length} m` : ""}.${b.port ? ` Departing from ${b.port}.` : ""} ${b.type ? b.type.toLowerCase() + " charter." : "Boat charter."}`,
    alternates: { canonical: `/en/tekneler/${b.slug}`, languages: { tr: `/tekneler/${b.slug}`, en: `/en/tekneler/${b.slug}`, ru: `/ru/tekneler/${b.slug}` } },
    robots: { index: false, follow: true },
  };
}

export default async function BoatPageEn({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <BoatView lang="en" slug={slug} />;
}
