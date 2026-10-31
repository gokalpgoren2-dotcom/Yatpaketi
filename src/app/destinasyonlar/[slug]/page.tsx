import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { BoatCard } from "@/components/BoatCard";
import { Placeholder } from "@/components/Placeholder";
import { Photo } from "@/components/Photo";
import { boatsFor } from "@/lib/data";
import { getBoats, getDestinations } from "@/lib/content";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [destinations, { boats }] = await Promise.all([getDestinations(), getBoats()]);
  const d = destinations.find((x) => x.slug === slug);
  if (!d) return {};
  return {
    title: `${d.name} Tekne Kiralama`,
    description: `${d.name} çıkışlı gulet, motoryat, katamaran ve yelkenli kiralama seçenekleri. ${d.intro}`,
    alternates: { canonical: `/destinasyonlar/${d.slug}` },
    // Gerçek tekne yokken sayfa indekslenmez.
    robots: boatsFor(boats, d.slug).length > 0 ? { index: false, follow: true } : { index: false, follow: false },
  };
}

export default async function DestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [destinations, { boats, sample }] = await Promise.all([getDestinations(), getBoats()]);
  const d = destinations.find((x) => x.slug === slug);
  if (!d) notFound();
  const list = boatsFor(boats, d.slug);

  return (
    <>
      <Header />
      <main className="pb-20 pt-16 lg:pt-20">
        <section className="relative">
          {d.image ? (
            <div className="relative h-64 lg:h-80"><Photo src={d.image} alt={d.name} priority sizes="100vw" className="object-cover" /></div>
          ) : (
            <Placeholder hue={d.hue} className="h-64 lg:h-80" label={false} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-5 pb-8 text-white lg:px-8">
            <h1 className="font-display text-3xl font-medium lg:text-5xl">{d.name} Tekne Kiralama</h1>
            <p className="mt-2 max-w-2xl text-white/85">{d.blurb}</p>
          </div>
        </section>
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <p className="mt-8 max-w-2xl leading-relaxed text-navy/70">{d.intro}</p>
          {sample && <p className="mt-2 text-sm text-navy/50">Örnek içerik: Veritabanı bağlı olmadığı için örnek veri gösteriliyor.</p>}
          <div className="mt-10 flex items-end justify-between">
            <h2 className="font-display text-2xl text-navy">{d.name} çıkışlı tekneler</h2>
            <Link href={`/tekneler?destinasyon=${d.slug}`} className="text-sm font-medium text-turquoise-dark">Filtrele</Link>
          </div>
          {list.length > 0 ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{list.map((b) => <BoatCard key={b.slug} b={b} />)}</div>
          ) : (
            <p className="mt-6 rounded-2xl bg-mist p-8 text-navy/70">Bu destinasyon için henüz tekne eklenmedi.</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
