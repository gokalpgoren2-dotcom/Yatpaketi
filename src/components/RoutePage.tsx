import Link from "next/link";
import { Header } from "./Header";
import { Footer } from "./Sections";
import { BoatCard } from "./BoatCard";
import { Scroller } from "./Scroller";
import { RouteChart } from "./RouteChart";
import { RouteDays } from "./RouteDays";
import { RouteCard, RouteList } from "./RouteList";
import { href, type Lang } from "@/lib/i18n";
import { getBoats, getContact } from "@/lib/content";
import { ROUTE_UI, routeInfo, toCard } from "@/lib/routes";
import type { Post } from "@/lib/posts";

const wrap = "mx-auto max-w-7xl px-5 lg:px-8";
const eyebrow = "text-xs font-semibold uppercase tracking-[0.28em] text-turquoise-dark";
const WAVE = (y: number) => `M0 ${y} q180 -60 360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 V400 H0 z`;

function Pill({ d, children }: { d: string; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/15 backdrop-blur">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7fdce6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>
      {children}
    </li>
  );
}

// Klasik rota sayfası: dalgalı başlık + hareketli rota şeması, gün gün zaman çizelgesi, uygun yatlar, diğer rotalar.
export async function RoutePage({ p, all, back, lang }: { p: Post; all: Post[]; back?: { href: string; label: string }; lang: Lang }) {
  const U = ROUTE_UI[lang];
  const R = routeInfo(p, lang);
  const [{ boats }, contact] = await Promise.all([getBoats(lang), getContact()]);
  const fit = R.port ? boats.filter((b) => b.destinations.includes(R.port!) || b.port.toLocaleLowerCase("tr").includes(R.from.toLocaleLowerCase("tr"))).slice(0, 8) : [];
  const others = all.filter((x) => x.slug !== p.slug);
  const sameStart = others.filter((x) => routeInfo(x, lang).from === R.from);
  const more = [...sameStart, ...others.filter((x) => !sameStart.includes(x))].slice(0, 6);
  const wa = contact.whatsapp
    ? `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(lang === "ru" ? `Здравствуйте, я хочу получить предложение по маршруту «${p.title}».` : lang !== "tr" ? `Hello, I'd like a quote for the "${p.title}" route.` : `Merhaba, "${p.title}" rotası için teklif almak istiyorum.`)}`
    : href(lang, "/iletisim");

  return (
    <>
      <Header lang={lang} />
      <main>
        {/* Başlık */}
        <section className="relative isolate overflow-hidden pb-24 pt-28 text-white lg:pb-32 lg:pt-36" style={{ background: "linear-gradient(160deg, #05204a 0%, #06264b 45%, #0b4a6e 80%, #0d6a86 100%)" }}>
          <div className="absolute inset-x-0 bottom-0 -z-10 h-28 overflow-hidden" aria-hidden>
            <svg className="wave-a absolute bottom-0 left-0 h-28 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={WAVE(150)} fill="rgba(255,255,255,0.08)" /></svg>
            <svg className="wave-b absolute bottom-0 left-0 h-20 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={WAVE(220)} fill="rgba(255,255,255,0.12)" /></svg>
            <svg className="absolute bottom-0 left-0 h-10 w-full" viewBox="0 0 1440 100" preserveAspectRatio="none"><path d="M0 60 q360 -50 720 0 t720 0 V100 H0z" fill="#ffffff" /></svg>
          </div>
          <div className={`${wrap} grid items-center gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14`}>
            <div>
              {back && <Link href={back.href} className="text-sm text-white/70 hover:text-white">← {back.label}</Link>}
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-turquoise">{U.eyebrow}{R.greek ? ` · ${U.greek}` : ""}</p>
              <h1 className="font-display mt-3 text-4xl font-semibold leading-[1.05] lg:text-6xl">{p.title}</h1>
              <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-lg text-white/85">
                <span className="font-semibold text-white">{R.from}</span>
                <span className="text-turquoise" aria-hidden>{R.loop ? "⟲" : "⟶"}</span>
                <span className="font-semibold text-white">{R.to}</span>
                <span className="text-white/50">·</span>
                <span className="text-white/70">{R.loop ? U.loop : U.oneway}</span>
              </p>
              {p.excerpt && <p className="mt-4 max-w-xl text-white/75">{p.excerpt}</p>}
              <ul className="mt-7 flex flex-wrap gap-2.5">
                {R.days.length > 0 && <Pill d="M7 3v3M17 3v3M4 8h16M5 5h14v15H5z">{U.days(R.days.length)}</Pill>}
                <Pill d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5">{U.stops(R.chart.length)}</Pill>
                <Pill d="M12 3v14M12 3l7 12h-7M3 19c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0">{U.from}: {R.from}</Pill>
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={wa} target={contact.whatsapp ? "_blank" : undefined} rel="noopener noreferrer" className="rounded-full bg-turquoise px-7 py-3.5 text-sm font-semibold text-navy shadow-lg shadow-turquoise/30 transition hover:brightness-110">{U.quote}</a>
                <a href="#program" className="rounded-full px-7 py-3.5 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/10">{U.program} ↓</a>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-turquoise/20 blur-3xl" aria-hidden />
              <div className="aspect-[600/340] overflow-hidden rounded-[1.75rem] shadow-2xl shadow-black/40 ring-1 ring-white/15">
                <RouteChart id={p.slug} stops={R.chart} loop={R.loop} label={U.chartLabel} />
              </div>
            </div>
          </div>
        </section>

        {/* Program */}
        <section id="program" className="scroll-mt-24 py-12 lg:py-20">
          <div className={`${wrap} grid gap-12 lg:grid-cols-[1fr_22rem] lg:gap-16`}>
            <div>
              <p className={eyebrow}>{U.programEyebrow}</p>
              <h2 className="font-display mt-3 text-3xl font-semibold leading-tight text-navy lg:text-5xl">{U.programTitle}</h2>
              {R.intro && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-navy/70">{R.intro}</p>}
              {R.days.length > 0 && <RouteDays days={R.days} dayLabel={U.dayLabel} acts={U.acts} from={U.from} to={U.to} />}
            </div>
            <aside className="space-y-5 lg:sticky lg:top-28 lg:h-fit">
              {R.whoFor.length > 0 && (
                <div className="rounded-3xl bg-mist p-6 lg:p-7">
                  <p className={eyebrow}>{U.whoEyebrow}</p>
                  {R.whoFor.map((w) => <p key={w} className="mt-3 leading-relaxed text-navy/75">{w}</p>)}
                </div>
              )}
              <div className="rounded-3xl border-l-4 border-turquoise bg-white p-6 shadow-sm ring-1 ring-navy/5 lg:p-7">
                <h3 className="font-display text-lg font-semibold text-navy">{U.noteTitle}</h3>
                {R.note && <p className="mt-2 text-sm leading-relaxed text-navy/65">{R.note}</p>}
                {!R.loop && <p className="mt-2 text-sm leading-relaxed text-navy/65">{U.onewayNote}</p>}
                {R.greek && <p className="mt-2 text-sm leading-relaxed text-navy/65">{U.greekNote}</p>}
              </div>
              <div className="rounded-3xl bg-gradient-to-br from-navy to-[#0b4a66] p-6 text-white lg:p-7">
                <p className="font-display text-xl font-semibold">{U.ctaTitle}</p>
                <p className="mt-2 text-sm text-white/75">{U.ctaText}</p>
                <a href={wa} target={contact.whatsapp ? "_blank" : undefined} rel="noopener noreferrer" className="mt-5 block rounded-full bg-turquoise px-6 py-3 text-center text-sm font-semibold text-navy transition hover:brightness-110">{U.quote}</a>
              </div>
            </aside>
          </div>
        </section>

        {/* Uygun yatlar */}
        {fit.length > 0 && (
          <section className="bg-mist py-14 lg:py-20">
            <div className={wrap}>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className={eyebrow}>{U.boatsEyebrow}</p>
                  <h2 className="font-display mt-3 text-3xl font-semibold text-navy lg:text-4xl">{U.boatsTitle(R.from)}</h2>
                </div>
                <Link href={href(lang, "/tekneler")} className="text-sm font-semibold text-turquoise-dark">{U.allBoats} →</Link>
              </div>
              <div className="mt-8">
                <Scroller className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 lg:mx-0 lg:gap-6 lg:px-0">
                  {fit.map((b) => <div key={b.slug} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[calc((100%-3rem)/3)]"><BoatCard b={b} lang={lang} /></div>)}
                </Scroller>
              </div>
            </div>
          </section>
        )}

        {/* Diğer rotalar */}
        {more.length > 0 && (
          <section className="py-14 lg:py-20">
            <div className={wrap}>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="font-display text-3xl font-semibold text-navy lg:text-4xl">{U.more}</h2>
                {back && <Link href={back.href} className="text-sm font-semibold text-turquoise-dark">{U.allRoutes} →</Link>}
              </div>
              <div className="mt-8">
                <Scroller className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 lg:mx-0 lg:gap-6 lg:px-0">
                  {more.map((m) => <div key={m.slug} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[calc((100%-3rem)/3)]"><RouteCard r={toCard(m, lang)} lang={lang} /></div>)}
                </Scroller>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer lang={lang} />
    </>
  );
}

// Klasik rotalar listesi.
export function RoutesIndex({ posts, eyebrow: eb, title, intro, empty, lang }: { posts: Post[]; eyebrow: string; title: string; intro: string; empty: string; lang: Lang }) {
  const cards = posts.map((p) => toCard(p, lang));
  const ports = new Set(cards.map((c) => c.from)).size;
  const feature = cards.find((c) => c.slug === "bodrum-gocek") ?? cards.find((c) => !c.loop) ?? cards[0];
  const en = lang !== "tr";
  const ru = lang === "ru";
  return (
    <>
      <Header lang={lang} />
      <main>
        <section className="relative isolate overflow-hidden pb-24 pt-28 text-white lg:pb-28 lg:pt-36" style={{ background: "linear-gradient(160deg, #05204a 0%, #06264b 45%, #0b4a6e 80%, #0d6a86 100%)" }}>
          <div className="absolute inset-x-0 bottom-0 -z-10 h-28 overflow-hidden" aria-hidden>
            <svg className="wave-a absolute bottom-0 left-0 h-28 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={WAVE(150)} fill="rgba(255,255,255,0.08)" /></svg>
            <svg className="wave-b absolute bottom-0 left-0 h-20 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={WAVE(220)} fill="rgba(255,255,255,0.12)" /></svg>
            <svg className="absolute bottom-0 left-0 h-10 w-full" viewBox="0 0 1440 100" preserveAspectRatio="none"><path d="M0 60 q360 -50 720 0 t720 0 V100 H0z" fill="#ffffff" /></svg>
          </div>
          <div className={`${wrap} grid items-center gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14`}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-turquoise">{eb}</p>
              <h1 className="font-display mt-3 text-4xl font-semibold leading-[1.05] lg:text-6xl">{title}</h1>
              <p className="mt-5 max-w-xl text-lg text-white/80">{intro}</p>
              {cards.length > 0 && (
                <ul className="mt-8 flex flex-wrap gap-8">
                  <li><span className="font-display block text-4xl font-semibold text-turquoise">{cards.length}</span><span className="text-sm text-white/70">{ru ? "маршрутов" : en ? "routes" : "rota"}</span></li>
                  <li><span className="font-display block text-4xl font-semibold text-turquoise">{ports}</span><span className="text-sm text-white/70">{ru ? "портов отправления" : en ? "departure ports" : "kalkış limanı"}</span></li>
                  <li><span className="font-display block text-4xl font-semibold text-turquoise">7</span><span className="text-sm text-white/70">{ru ? "дней, программа по дням" : en ? "days, day by day" : "günlük program"}</span></li>
                </ul>
              )}
            </div>
            {feature && (
              <Link href={feature.href} className="group relative block">
                <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-turquoise/20 blur-3xl" aria-hidden />
                <div className="aspect-[600/340] overflow-hidden rounded-[1.75rem] shadow-2xl shadow-black/40 ring-1 ring-white/15">
                  <RouteChart id={`hero-${feature.slug}`} stops={feature.chart} loop={feature.loop} label={ROUTE_UI[lang].chartLabel} />
                </div>
                <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-navy shadow-lg">{feature.title} →</span>
              </Link>
            )}
          </div>
        </section>
        <section className="pb-20 pt-6 lg:pt-10">
          <div className={wrap}>
            {cards.length === 0 ? <p className="rounded-3xl bg-mist p-8 text-center text-navy/70">{empty}</p> : <RouteList routes={cards} lang={lang} />}
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  );
}
