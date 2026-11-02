import type { Metadata } from "next";
import { DestinationView } from "@/views/DestinationView";
import { boatsFor } from "@/lib/data";
import { getBoats, getDestinations } from "@/lib/content";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [destinations, { boats }] = await Promise.all([getDestinations(), getBoats()]);
  const d = destinations.find((x) => x.slug === slug);
  if (!d) return {};
  return {
    title: d.seoTitle || `${d.name} Yat Kiralama`,
    description: d.seoDescription || `${d.name} çıkışlı gulet, motoryat, katamaran ve yelkenli kiralama seçenekleri. ${d.intro.slice(0, 120)}`,
    alternates: { canonical: `/limanlar/${d.slug}`, languages: { tr: `/limanlar/${d.slug}`, en: `/en/limanlar/${d.slug}` } },
    // Gerçek yat yokken sayfa indekslenmez.
    robots: boatsFor(boats, d.slug).length > 0 ? { index: false, follow: true } : { index: false, follow: false },
  };
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <DestinationView lang="tr" slug={slug} />;
}
