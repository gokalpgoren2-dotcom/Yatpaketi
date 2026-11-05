import type { Metadata } from "next";
import { boatsFor } from "@/lib/data";
import { getBoats, getDestinations } from "@/lib/content";
import { DestinationView } from "@/views/DestinationView";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [destinations, { boats }] = await Promise.all([getDestinations("en"), getBoats("en")]);
  const d = destinations.find((x) => x.slug === slug);
  if (!d) return {};
  return {
    title: d.seoTitle || `${d.name} Boat Charter`,
    description: `Gulet, motor yacht, catamaran and sailing yacht charter from ${d.name}. ${d.intro.slice(0, 120)}`,
    alternates: { canonical: `/en/limanlar/${d.slug}`, languages: { tr: `/limanlar/${d.slug}`, en: `/en/limanlar/${d.slug}`, ru: `/ru/limanlar/${d.slug}` } },
    robots: boatsFor(boats, d.slug).length > 0 ? { index: false, follow: true } : { index: false, follow: false },
  };
}

export default async function DestinationPageEn({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <DestinationView lang="en" slug={slug} />;
}
