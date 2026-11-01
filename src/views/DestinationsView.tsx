import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { Placeholder } from "@/components/Placeholder";
import { Photo } from "@/components/Photo";
import { boatsFor } from "@/lib/data";
import { getBoats, getDestinations } from "@/lib/content";
import { href, t, type Lang } from "@/lib/i18n";

export async function DestinationsView({ lang }: { lang: Lang }) {
  const L = t(lang);
  const [destinations, { boats }] = await Promise.all([getDestinations(lang), getBoats(lang)]);
  return (
    <div lang={lang}>
      <Header lang={lang} />
      <main className="mx-auto max-w-7xl px-5 pb-20 pt-24 lg:px-8 lg:pt-32">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-turquoise">{L.destEyebrow}</p>
        <h1 className="font-display text-3xl font-medium text-navy lg:text-5xl">{L.routePick}</h1>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((d) => (
            <Link key={d.slug} href={href(lang, `/limanlar/${d.slug}`)} className="group overflow-hidden rounded-2xl border border-navy/10 transition hover:-translate-y-1 hover:shadow-xl">
              {d.image ? (
                <div className="relative aspect-[16/10]"><Photo src={d.image} alt={d.name} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" /></div>
              ) : (
                <Placeholder hue={d.hue} className="aspect-[16/10]" />
              )}
              <div className="p-5">
                <h2 className="font-display text-2xl text-navy">{d.name}</h2>
                <p className="mt-1 text-sm text-navy/60">{d.blurb}</p>
                <p className="mt-3 text-sm font-medium text-turquoise-dark">{L.boatsCount(boatsFor(boats, d.slug).length)}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer lang={lang} />
    </div>
  );
}
