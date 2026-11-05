import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { BoatIcon } from "@/components/BoatIcon";
import { ServicePicker } from "@/components/ServicePicker";
import { getServices } from "@/lib/site-texts";
import { getCategories, getContact } from "@/lib/content";
import { href, type Lang } from "@/lib/i18n";
import { pick } from "@/lib/ru";

const eyebrow = "text-xs font-semibold uppercase tracking-[0.28em] text-turquoise-dark";
const h2 = "font-display text-3xl font-semibold leading-tight text-navy lg:text-5xl";
const wrap = "mx-auto max-w-7xl px-5 lg:px-8";
const WAVE = (y: number) => `M0 ${y} q180 -60 360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 V400 H0 z`;

// Hizmet ikonları (sırayla): yat kiralama, transfer, ikmal, alışveriş, organizasyon
const ICONS = [
  "M12 3v13l7-1L12 3ZM11 6v9H6l5-9ZM3 19c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0",
  "M3 13l2-5h14l2 5v5H3v-5ZM3 13h18M7 18v2M17 18v2M7 15.5h.01M17 15.5h.01",
  "M4 20V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14M3 20h12M4 10h10M14 8h2l3 3v7a1.5 1.5 0 0 1-3 0v-3h-2",
  "M5 8h14l-1 12H6L5 8ZM9 8V6a3 3 0 0 1 6 0v2",
  "M9 4h6v3H9zM6 5h3M15 5h3v16H6V5M9 13l2 2 4-4",
];
const ALL_IC = ["M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20Z", "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2", "M4 9h16v11H4zM8 9V5h8v4M4 13h16"];

function Ic({ d, size = 22 }: { d: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>;
}

export async function ServicesView({ lang }: { lang: Lang }) {
  const [svc, cats, contact] = await Promise.all([getServices(), getCategories(lang), getContact()]);
  const S = pick(svc, lang);
  const en = lang !== "tr";
  const ru = lang === "ru";
  const [t1, ...t2] = S.title.split(/(?<=\.)\s+/);
  const [lt1, ...lt2] = S.listTitle.split(/(?<=\.)\s+/);
  const items = S.items as string[][];
  const n = items.length;
  const [first, ...rest] = items;
  return (
    <>
      <Header lang={lang} />
      <main>
        {/* Başlık: ortada Yatpaketi, çevresinde hizmetler */}
        <section className="relative isolate overflow-hidden pb-24 pt-28 text-white lg:pb-32 lg:pt-36" style={{ background: "linear-gradient(160deg, #05204a 0%, #06264b 45%, #0b4a6e 80%, #0d6a86 100%)" }}>
          <div className="absolute inset-x-0 bottom-0 -z-10 h-28 overflow-hidden" aria-hidden>
            <svg className="wave-a absolute bottom-0 left-0 h-28 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={WAVE(150)} fill="rgba(255,255,255,0.08)" /></svg>
            <svg className="wave-b absolute bottom-0 left-0 h-20 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={WAVE(220)} fill="rgba(255,255,255,0.12)" /></svg>
            <svg className="absolute bottom-0 left-0 h-10 w-full" viewBox="0 0 1440 100" preserveAspectRatio="none"><path d="M0 60 q360 -50 720 0 t720 0 V100 H0z" fill="#ffffff" /></svg>
          </div>
          <div className={`${wrap} grid items-center gap-14 lg:grid-cols-[1.1fr_1fr] lg:gap-16`}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-turquoise">{S.listEyebrow}</p>
              <h1 className="font-display mt-4 text-4xl font-semibold leading-[1.05] lg:text-6xl">
                {t1}{t2.length > 0 && <><br /><span className="text-turquoise">{t2.join(" ")}</span></>}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">{S.sub}</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a href="#hizmetler" className="rounded-full bg-turquoise px-7 py-3.5 text-sm font-semibold text-navy shadow-lg shadow-turquoise/30 transition hover:brightness-110">{ru ? "Наши услуги" : en ? "See the services" : "Hizmetleri görün"} ↓</a>
                <a href="#plan" className="rounded-full px-7 py-3.5 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/10">{S.ctaBtn1}</a>
              </div>
            </div>

            <div className="relative mx-auto aspect-square w-full max-w-[26rem]" aria-hidden>
              <div className="absolute inset-[16%] animate-spin rounded-full border border-dashed border-white/25 [animation-duration:80s] motion-reduce:animate-none" />
              <div className="absolute inset-[30%] rounded-full bg-turquoise/15 blur-2xl" />
              <div className="absolute inset-[31%] flex flex-col items-center justify-center rounded-full bg-white text-center text-navy shadow-2xl shadow-black/30">
                <span className="text-turquoise-dark"><Ic d={ICONS[0]} size={30} /></span>
                <span className="font-display mt-1.5 px-3 text-sm font-semibold leading-tight lg:text-base">{lt2.join(" ") || lt1}</span>
              </div>
              {items.map(([title], i) => {
                const a = (-90 + (360 / n) * i) * (Math.PI / 180);
                return (
                  <div key={title} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${50 + 34 * Math.cos(a)}%`, top: `${50 + 34 * Math.sin(a)}%` }}>
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy text-turquoise shadow-xl shadow-black/30 ring-1 ring-white/15 lg:h-16 lg:w-16"><Ic d={ICONS[i % ICONS.length]} size={26} /></span>
                      <span className="whitespace-nowrap rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">{title}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Hizmetler */}
        <section id="hizmetler" className="scroll-mt-24 py-16 lg:py-24">
          <div className={wrap}>
            <div className="max-w-3xl">
              <p className={eyebrow}>{S.listEyebrow}</p>
              <h2 className={`${h2} mt-3`}>{lt1}{lt2.length > 0 && <> <span className="text-turquoise-dark">{lt2.join(" ")}</span></>}</h2>
              <p className="mt-5 text-lg text-navy/70">{S.listLead}</p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {first && (
                <article className="relative isolate overflow-hidden rounded-[2rem] p-7 text-white md:col-span-2 lg:p-10" style={{ background: "linear-gradient(150deg, #06264b 0%, #0b4a6e 65%, #0d6a86 100%)" }}>
                  <svg className="absolute -bottom-10 -right-6 -z-10 h-64 w-64 text-white/[0.06]" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 3v13l7-1L12 3ZM11 6v9H6l5-9ZM4 17h16l-2 3H6l-2-3Z" /></svg>
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-turquoise text-navy"><Ic d={ICONS[0]} size={26} /></span>
                    <span className="font-display text-5xl font-semibold text-white/10">01</span>
                  </div>
                  <h3 className="font-display mt-6 text-3xl font-semibold">{first[0]}</h3>
                  <p className="mt-3 max-w-2xl leading-relaxed text-white/75">{first[1]}</p>
                  {cats.length > 0 && (
                    <div className="mt-7 flex flex-wrap gap-2">
                      {cats.map((c) => (
                        <Link key={c.slug} href={href(lang, `/tekne-tipleri/${c.slug}`)} className="group flex items-center gap-2 rounded-full bg-white/10 py-1.5 pl-1.5 pr-4 text-sm font-semibold ring-1 ring-white/15 transition hover:bg-white hover:text-navy">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-turquoise transition group-hover:bg-turquoise group-hover:text-white"><BoatIcon name={c.slug} /></span>
                          {c.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </article>
              )}
              {rest.map(([title, text], k) => {
                const i = k + 1;
                return (
                  <article key={title} className="group relative overflow-hidden rounded-[2rem] bg-white p-7 ring-1 ring-navy/10 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-navy/10 hover:ring-turquoise/40 lg:p-8">
                    <span className="absolute -right-2 -top-5 font-display text-[6.5rem] font-semibold leading-none text-navy/[0.04] transition group-hover:text-turquoise/15" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                    <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-turquoise/15 text-turquoise-dark transition duration-300 group-hover:bg-navy group-hover:text-turquoise"><Ic d={ICONS[i % ICONS.length]} size={26} /></span>
                    <h3 className="font-display relative mt-6 text-2xl font-semibold text-navy">{title}</h3>
                    <p className="relative mt-3 leading-relaxed text-navy/65">{text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* Neden birlikte */}
        <section className="pb-16 lg:pb-24">
          <div className={wrap}>
            <div className="grid gap-10 rounded-[2.5rem] bg-mist p-7 lg:grid-cols-[1fr_1.5fr] lg:gap-16 lg:p-14">
              <div>
                <p className={eyebrow}>{S.allEyebrow}</p>
                <h2 className="font-display mt-3 text-3xl font-semibold leading-tight text-navy lg:text-4xl">{S.allTitle}</h2>
                <p className="mt-5 text-navy/70">{S.allLead}</p>
              </div>
              <ol className="space-y-4">
                {(S.all as string[][]).map(([title, text], i) => (
                  <li key={title} className="flex gap-5 rounded-3xl bg-white p-6 ring-1 ring-navy/5">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-navy text-turquoise"><Ic d={ALL_IC[i % ALL_IC.length]} /></span>
                    <div>
                      <h3 className="text-lg font-semibold text-navy">{title}</h3>
                      <p className="mt-1 leading-relaxed text-navy/65">{text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Plan: hizmet seçici */}
        <section id="plan" className="scroll-mt-24 pb-20 lg:pb-28">
          <div className={wrap}>
            <div className="relative isolate overflow-hidden rounded-[2.5rem] px-7 py-12 text-white lg:px-14 lg:py-16" style={{ background: "linear-gradient(135deg, #06264b 0%, #0b4a6e 55%, #0d6a86 100%)" }}>
              <div className="absolute -right-24 -top-24 -z-10 h-96 w-96 rounded-full bg-turquoise/20 blur-3xl" aria-hidden />
              <div className="absolute inset-x-0 bottom-0 -z-10 h-20 overflow-hidden opacity-60" aria-hidden>
                <svg className="wave-a absolute bottom-0 left-0 h-20 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={WAVE(170)} fill="rgba(127,220,230,0.14)" /></svg>
              </div>
              <div className="grid gap-10 lg:grid-cols-[1fr_1.35fr] lg:gap-16">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-turquoise">{S.ctaEyebrow}</p>
                  <h2 className="font-display mt-3 text-3xl font-semibold leading-tight lg:text-5xl">{S.ctaTitle}</h2>
                  <p className="mt-5 text-white/75">{S.ctaText}</p>
                  <Link href={href(lang, "/tekneler")} className="mt-7 inline-block text-sm font-semibold text-turquoise underline-offset-4 hover:underline">{S.ctaBtn2} →</Link>
                </div>
                <ServicePicker items={items.map(([t]) => t)} icons={ICONS} whatsapp={contact.whatsapp} contactHref={href(lang, "/iletisim")} lang={lang} />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  );
}
