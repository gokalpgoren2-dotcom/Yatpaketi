import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { BoatCard } from "@/components/BoatCard";
import { Placeholder } from "@/components/Placeholder";
import { PortArt } from "@/components/PortArt";
import { RichText } from "@/components/RichText";
import { IstanbulSkyline } from "@/components/IstanbulSkyline";
import { boatsFor } from "@/lib/data";
import { getBoats, getDestinations } from "@/lib/content";
import { getReviews } from "@/lib/reviews";
import { ReviewSection } from "@/components/Reviews";
import { href, t, type Lang } from "@/lib/i18n";

export async function DestinationView({ lang, slug }: { lang: Lang; slug: string }) {
  const L = t(lang);
  const [destinations, { boats, sample }] = await Promise.all([getDestinations(lang), getBoats(lang)]);
  const d = destinations.find((x) => x.slug === slug);
  if (!d) notFound();
  const list = boatsFor(boats, d.slug);
  const reviews = await getReviews({ boatSlugs: list.map((b) => b.slug), limit: 9 });

  return (
    <div lang={lang}>
      <Header lang={lang} />
      <main className="pb-20 pt-16 lg:pt-20">
        <section className="relative">
          <PortArt slug={d.slug} className="block h-72 w-full lg:h-[26rem]" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-5 pb-8 text-white lg:px-8">
            <h1 className="font-display text-3xl font-medium lg:text-5xl">{L.destHero(d.name)}</h1>
            <p className="mt-2 max-w-2xl text-white/85">{d.blurb}</p>
          </div>
        </section>
        <div className="relative isolate mx-auto max-w-7xl px-5 lg:px-8">
          {/* İstanbul: arka planda soluk Boğaz çizimi */}
          {d.slug === "istanbul" && <IstanbulSkyline className="pointer-events-none absolute inset-x-0 top-2 -z-10 h-auto w-full text-navy opacity-[0.07] lg:top-0" />}
          {d.intro && <div className="mt-8 max-w-3xl"><RichText text={d.intro} /></div>}
          {sample && <p className="mt-2 text-sm text-navy/50">{L.sampleData}</p>}
          <div className="mt-10 flex items-end justify-between">
            <h2 className="font-display text-2xl text-navy">{L.destBoats(d.name)}</h2>
            <Link href={`${href(lang, "/tekneler")}?destinasyon=${d.slug}`} className="text-sm font-medium text-turquoise-dark">{L.filter}</Link>
          </div>
          {list.length > 0 ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{list.map((b) => <BoatCard key={b.slug} b={b} lang={lang} />)}</div>
          ) : (
            <p className="mt-6 rounded-2xl bg-mist p-8 text-navy/70">{L.destNone}</p>
          )}
          <ReviewSection reviews={reviews} lang={lang} showBoat title={lang === "en" ? `Guest reviews from ${d.name}` : `${d.name} çıkışlı misafir yorumları`} />
        </div>
      </main>
      <Footer lang={lang} />
    </div>
  );
}
