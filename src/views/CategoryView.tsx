import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { BoatCard } from "@/components/BoatCard";
import { Photo } from "@/components/Photo";
import { Placeholder } from "@/components/Placeholder";
import { RichText } from "@/components/RichText";
import { getBoats, getCategories } from "@/lib/content";
import { href, t, type Lang } from "@/lib/i18n";

export async function CategoryView({ lang, slug }: { lang: Lang; slug: string }) {
  const L = t(lang);
  const [cats, { boats }] = await Promise.all([getCategories(lang), getBoats(lang)]);
  const c = cats.find((x) => x.slug === slug);
  if (!c) notFound();
  const list = boats.filter((b) => b.type === c.name);

  return (
    <div lang={lang}>
      <Header lang={lang} />
      <main className="pb-20 pt-16 lg:pt-20">
        <section className="relative">
          {c.image ? (
            <div className="relative h-64 lg:h-80"><Photo src={c.image} alt={c.name} priority sizes="100vw" className="object-cover" /></div>
          ) : (
            <Placeholder hue={190} className="h-64 lg:h-80" label={false} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy/70 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-5 pb-8 text-white lg:px-8">
            <h1 className="font-display text-3xl font-medium lg:text-5xl">{L.catHero(c.name)}</h1>
          </div>
        </section>
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          {c.intro && <div className="mt-8 max-w-3xl"><RichText text={c.intro} /></div>}
          <div className="mt-10 flex items-end justify-between gap-4">
            <h2 className="font-display text-2xl text-navy">{L.catBoats(c.name)}</h2>
            <Link href={`${href(lang, "/tekneler")}?tip=${encodeURIComponent(c.name)}`} className="text-sm font-medium text-turquoise-dark">{L.filter}</Link>
          </div>
          {list.length > 0 ? (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{list.map((b) => <BoatCard key={b.slug} b={b} lang={lang} />)}</div>
          ) : (
            <p className="mt-6 rounded-3xl bg-mist p-8 text-navy/70">{L.catNone1} <Link href={href(lang, "/tekneler")} className="font-medium text-turquoise-dark underline underline-offset-4">{L.catNone2}</Link> {L.catNone3}</p>
          )}
        </div>
      </main>
      <Footer lang={lang} />
    </div>
  );
}
