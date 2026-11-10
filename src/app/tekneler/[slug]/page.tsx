import type { Metadata } from "next";
import { getBoatBySlug, getBoats } from "@/lib/content";
import { BoatView } from "@/views/BoatView";

export const revalidate = 60;
export const maxDuration = 30;

// Yat sayfaları yayına alınırken önceden hazırlanır; ilk ziyaretçi de beklemeden açar.
export async function generateStaticParams() {
  const { boats, sample } = await getBoats();
  return sample ? [] : boats.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { boat: b } = await getBoatBySlug(slug);
  if (!b) return {};
  return {
    title: [b.name, b.type && `${b.type} Kiralama`, b.port].filter(Boolean).join(" | "),
    description: `${b.name}: ${b.guests} misafir${b.cabins ? `, ${b.cabins} kabin` : ""}${b.length ? `, ${b.length} m` : ""}.${b.port ? ` ${b.port} çıkışlı` : ""} ${b.type ? b.type.toLowerCase() + " kiralama." : "yat kiralama."}`,
    alternates: { canonical: `/tekneler/${b.slug}`, languages: { tr: `/tekneler/${b.slug}`, en: `/en/tekneler/${b.slug}`, ru: `/ru/tekneler/${b.slug}` } },
    robots: { index: false, follow: true }, // rezervasyon talep formu hazır olana kadar kapalı
  };
}

export default async function BoatPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <BoatView lang="tr" slug={slug} />;
}
