import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { BoatCard } from "@/components/BoatCard";
import { Placeholder } from "@/components/Placeholder";
import { Photo } from "@/components/Photo";
import { RichText } from "@/components/RichText";
import { boatsFor } from "@/lib/data";
import { getBoats, getDestinations } from "@/lib/content";
import { href, t, type Lang } from "@/lib/i18n";

export async function DestinationView({ lang, slug }: { lang: Lang; slug: string }) {
  const L = t(lang);
  const [destinations, { boats, sample }] = await Promise.all([getDestinations(lang), getBoats(lang)]);
  const d = destinations.find((x) => x.slug === slug);
  if (!d) notFound();
  const list = boatsFor(boats, d.slug);

  return (
    <div lang={lang}>
      <Header lang={lang} />
      <main className="pb-20 pt-16 lg:pt-20">
        <section className="relative">
          {d.image ? (
            <div className="relative h-72 lg:h-[26rem]"><Photo src={d.image} alt={d.name} priority quality={95} sizes="100vw" className="object-cover" /></div>
          ) : (
            <Placeholder hue={d.hue} className="h-72 lg:h-[26rem]" label={false} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-5 pb-8 text-white lg:px-8">
            <h1 className="font-display text-3xl font-medium lg:text-5xl">{L.destHero(d.name)}</h1>
            <p className="mt-2 max-w-2xl text-white/85">{d.blurb}</p>
          </div>
        </section>
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
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
        </div>
      </main>
      <Footer lang={lang} />
    </div>
  );
}
