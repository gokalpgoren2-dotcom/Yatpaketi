import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { BoatCard } from "@/components/BoatCard";
import { Photo } from "@/components/Photo";
import { Placeholder } from "@/components/Placeholder";
import { RichText } from "@/components/RichText";
import { getBoats, getCategories } from "@/lib/content";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = (await getCategories()).find((x) => x.slug === slug);
  if (!c) return {};
  return {
    title: c.seoTitle || `${c.name} Kiralama`,
    description: c.seoDescription || `${c.name} kiralama seçenekleri ve tekneler.`,
    alternates: { canonical: `/tekne-tipleri/${c.slug}` },
    robots: { index: false, follow: true }, // Google'a açma adımına kadar kapalı
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [cats, { boats }] = await Promise.all([getCategories(), getBoats()]);
  const c = cats.find((x) => x.slug === slug);
  if (!c) notFound();
  const list = boats.filter((b) => b.type === c.name);

  return (
    <>
      <Header />
      <main className="pb-20 pt-16 lg:pt-20">
        <section className="relative">
          {c.image ? (
            <div className="relative h-64 lg:h-80"><Photo src={c.image} alt={c.name} priority sizes="100vw" className="object-cover" /></div>
          ) : (
            <Placeholder hue={190} className="h-64 lg:h-80" label={false} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-5 pb-8 text-white lg:px-8">
            <h1 className="font-display text-3xl font-medium lg:text-5xl">{c.name} Kiralama</h1>
          </div>
        </section>
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          {c.intro && <div className="mt-8 max-w-3xl"><RichText text={c.intro} /></div>}
          <div className="mt-10 flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl text-navy">{c.name} tekneleri</h2>
            <Link href={`/tekneler?tip=${encodeURIComponent(c.name)}`} className="text-sm font-medium text-turquoise-dark">Filtrele</Link>
          </div>
          {list.length > 0 ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{list.map((b) => <BoatCard key={b.slug} b={b} />)}</div>
          ) : (
            <p className="mt-6 rounded-3xl bg-mist p-8 text-navy/70">Bu tipte henüz yayında tekne yok. <Link href="/tekneler" className="font-medium text-turquoise-dark underline underline-offset-4">Tüm tekneleri</Link> inceleyebilirsiniz.</p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
