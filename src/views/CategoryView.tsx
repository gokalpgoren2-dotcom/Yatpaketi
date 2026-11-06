import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { BoatCard } from "@/components/BoatCard";
import { BoatIcon } from "@/components/BoatIcon";
import { Photo } from "@/components/Photo";
import { getBoats, getCategories } from "@/lib/content";
import { href, t, type Lang } from "@/lib/i18n";

const WAVE = (y: number) => `M0 ${y} q180 -60 360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 V400 H0 z`;
const wrap = "mx-auto max-w-7xl px-5 lg:px-8";

// Yat tipi sayfalarının kısa tanıtımları (tr, en, ru)
const LEAD: Record<string, [string, string, string]> = {
  gulet: [
    "Geniş güverteleri, ahşap işçiliği ve deneyimli mürettebatıyla mavi yolculuğun klasik yatları.",
    "The classic yachts of the blue cruise: wide decks, fine woodwork and an experienced crew.",
    "Классические яхты голубого круиза: широкие палубы, ручная работа по дереву и опытный экипаж.",
  ],
  motoryat: [
    "Daha az sürede daha çok koy: hızlı, konforlu ve modern motoryatlar ile trawler'lar.",
    "More coves in less time: fast, comfortable modern motor yachts and trawlers.",
    "Больше бухт за меньшее время: быстрые, комфортные современные моторные яхты и траулеры.",
  ],
  yelkenli: [
    "Rüzgârla seyrin sessizliği: yelkenli yatlar ve geniş yaşam alanlı katamaranlar.",
    "The quiet of sailing with the wind: sailing yachts and spacious catamarans.",
    "Тишина хода под парусом: парусные яхты и просторные катамараны.",
  ],
  "luks-yat": [
    "Jakuzi, geniş mürettebat ve su oyuncaklarıyla ayrıcalıklı bir tatil için seçkin yatlar.",
    "Exceptional yachts with jacuzzis, larger crews and water toys for a truly special holiday.",
    "Исключительные яхты с джакузи, большим экипажем и водными игрушками для особенного отдыха.",
  ],
};

export async function CategoryView({ lang, slug }: { lang: Lang; slug: string }) {
  const L = t(lang);
  const ru = lang === "ru";
  const en = lang !== "tr";
  const i = ru ? 2 : en ? 1 : 0;
  const [cats, { boats }] = await Promise.all([getCategories(lang), getBoats(lang)]);
  const c = cats.find((x) => x.slug === slug);
  if (!c) notFound();
  const list = boats.filter((b) => b.type === c.name);
  const lead = LEAD[c.slug]?.[i] ?? c.intro;
  const ports = new Set(list.map((b) => b.port).filter(Boolean)).size;
  const stats: [string, string][] = [
    [String(list.length), ru ? "яхт" : en ? (list.length === 1 ? "yacht" : "yachts") : "yat"],
    ...(ports ? [[String(ports), ru ? "портов отправления" : en ? (ports === 1 ? "departure port" : "departure ports") : "kalkış limanı"] as [string, string]] : []),
  ];
  const tabs = [{ slug: "all", name: L.navAllBoats, to: href(lang, "/tekneler") }, ...cats.map((x) => ({ slug: x.slug, name: x.name, to: href(lang, `/tekne-tipleri/${x.slug}`) }))];
  const filterHref = `${href(lang, "/tekneler")}?tip=${encodeURIComponent(c.name)}`;
  const refine = ru ? "Подобрать по фильтрам" : en ? "Refine with filters" : "Detaylı filtrele";

  return (
    <div lang={lang}>
      <Header lang={lang} />
      <main>
        <section className="relative isolate overflow-hidden pb-36 pt-28 text-white lg:pb-44 lg:pt-36" style={{ background: "linear-gradient(160deg, #05204a 0%, #06264b 45%, #0b4a6e 80%, #0d6a86 100%)" }}>
          {c.image && (
            <div className="absolute inset-0 -z-20" aria-hidden>
              <Photo src={c.image} alt="" priority sizes="100vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/70 to-navy/40" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 -z-10 h-28 overflow-hidden" aria-hidden>
            <svg className="wave-a absolute bottom-0 left-0 h-28 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={WAVE(150)} fill="rgba(255,255,255,0.08)" /></svg>
            <svg className="wave-b absolute bottom-0 left-0 h-20 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={WAVE(220)} fill="rgba(255,255,255,0.12)" /></svg>
            <svg className="absolute bottom-0 left-0 h-10 w-full" viewBox="0 0 1440 100" preserveAspectRatio="none"><path d="M0 60 q360 -50 720 0 t720 0 V100 H0z" fill="#ffffff" /></svg>
          </div>
          <div className={`${wrap} lg:flex lg:items-end lg:justify-between lg:gap-10`}>
            <div className="max-w-2xl">
              <Link href={href(lang, "/tekneler")} className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-turquoise hover:text-white">
                <BoatIcon name={c.slug} className="h-5 w-5" />
                {L.listEyebrow}
              </Link>
              <h1 className="font-display mt-4 text-4xl font-semibold leading-[1.05] lg:text-6xl">{L.catHero(c.name)}</h1>
              {lead && <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 lg:text-lg">{lead}</p>}
            </div>
            {list.length > 0 && (
              <dl className="mt-8 flex flex-wrap gap-3 lg:mt-0 lg:flex-nowrap">
                {stats.map(([v, k]) => (
                  <div key={k} className="min-w-[7.5rem] rounded-2xl bg-white/10 px-5 py-4 ring-1 ring-white/15 backdrop-blur">
                    <dt className="sr-only">{k}</dt>
                    <dd className="font-display text-2xl font-semibold leading-none">{v}</dd>
                    <dd className="mt-1.5 text-xs text-white/65">{k}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </section>

        {/* Yat tipleri arasında geçiş */}
        <div className={`${wrap} relative z-10 -mt-28 lg:-mt-32`}>
          <nav aria-label={L.listEyebrow} className="rounded-3xl bg-white p-4 shadow-2xl shadow-navy/15 ring-1 ring-navy/5 lg:p-5">
            <div className="flex items-center gap-3">
              <div className="-mx-1 flex flex-1 snap-x gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
                {tabs.map((x) => {
                  const on = x.slug === c.slug;
                  return (
                    <Link key={x.slug} href={x.to} aria-current={on ? "page" : undefined}
                      className={`flex min-w-[6.5rem] shrink-0 snap-start flex-col items-center gap-1.5 rounded-2xl border px-4 py-3 text-center text-xs font-semibold transition ${on ? "border-navy bg-navy text-white" : "border-navy/10 bg-mist text-navy/70 hover:border-turquoise/60 hover:text-navy"}`}>
                      <BoatIcon name={x.slug} className="h-6 w-6" />
                      {x.name}
                    </Link>
                  );
                })}
              </div>
              <Link href={filterHref} className="hidden shrink-0 items-center gap-2 rounded-xl bg-turquoise px-5 py-3 text-sm font-semibold text-navy shadow-lg shadow-turquoise/25 transition hover:brightness-110 md:inline-flex">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M14 4v4M8 10v4M16 16v4" /></svg>
                {refine}
              </Link>
            </div>
          </nav>
        </div>

        <div className={`${wrap} pb-20 pt-10`}>
          {list.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{list.map((b) => <BoatCard key={b.slug} b={b} lang={lang} />)}</div>
          ) : (
            <div className="rounded-3xl bg-mist p-10 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-turquoise-dark shadow-sm"><BoatIcon name={c.slug} className="h-7 w-7" /></span>
              <p className="mx-auto mt-4 max-w-md text-navy/70">{L.catNone1}</p>
              <Link href={href(lang, "/tekneler")} className="mt-5 inline-block rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-white">{L.navAllBoats}</Link>
            </div>
          )}

          <Link href={filterHref} className="mt-8 flex items-center justify-center gap-2 rounded-xl bg-turquoise px-5 py-3 text-sm font-semibold text-navy md:hidden">{refine}</Link>

          {/* Yardım çağrısı */}
          <div className="mt-14 flex flex-col items-start gap-5 overflow-hidden rounded-3xl p-8 text-white sm:flex-row sm:items-center sm:justify-between lg:p-10" style={{ background: "linear-gradient(135deg, #06264b 0%, #0b4a6e 60%, #0d6a86 100%)" }}>
            <div>
              <p className="font-display text-2xl font-semibold">{ru ? "Не нашли подходящую яхту?" : en ? "Can't find the right yacht?" : "Aradığınız yatı bulamadınız mı?"}</p>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">{ru ? "Напишите даты и количество гостей — мы подберём варианты, которых ещё нет на сайте." : en ? "Tell us your dates and group size — we'll find options that aren't on the site yet." : "Tarihlerinizi ve kişi sayınızı yazın; sitede henüz yer almayan seçenekleri de sizin için bulalım."}</p>
            </div>
            <Link href={href(lang, "/iletisim")} className="shrink-0 rounded-full bg-white px-6 py-3 text-sm font-semibold text-navy transition hover:bg-turquoise">{ru ? "Написать нам" : en ? "Contact us" : "Bize yazın"}</Link>
          </div>
        </div>
      </main>
      <Footer lang={lang} />
    </div>
  );
}
