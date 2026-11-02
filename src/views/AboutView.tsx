import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { CountUp } from "@/components/CountUp";
import { getAbout } from "@/lib/site-texts";
import { getBoats, getCategories, getDestinations } from "@/lib/content";
import { href, type Lang } from "@/lib/i18n";

const eyebrow = "text-xs font-semibold uppercase tracking-[0.28em] text-turquoise-dark";
const h2 = "font-display text-3xl font-semibold leading-tight text-navy lg:text-5xl";
const wrap = "mx-auto max-w-7xl px-5 lg:px-8";
const WAVE = (y: number) => `M0 ${y} q180 -60 360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 V400 H0 z`;

function Ic({ d, size = 22 }: { d: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>;
}
const HELM = "M12 19a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1";
const HOST = "M3 20h18M5 20a7 7 0 0 1 14 0M12 9V7M10 7h4M12 13v.01";
const ANCHOR = "M12 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM12 8v13M5 13a7 7 0 0 0 14 0M8 11h8";
const SAIL = "M12 3v13l7-1L12 3ZM11 6v9H6l5-9ZM4 17h16l-2 3H6l-2-3Z";
const PIN = "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5";
const EXP_IC = [HELM, HOST];
const STEP_IC = ["M4 5h16v11H8l-4 4V5ZM8 9h8M8 12h5", "M12 3v13l7-1L12 3ZM11 6v9H6l5-9ZM3 19c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0", "M5 12l5 5 9-10"];
const RESP_IC = ["M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", "M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4ZM9 12l2 2 4-4", "M3 15a4 4 0 0 0 4 4h10a4 4 0 0 0 0-8 6 6 0 0 0-11.5 1.5A3.5 3.5 0 0 0 3 15Z"];

export async function AboutView({ lang }: { lang: Lang }) {
  const [about, cats, dests, { boats }] = await Promise.all([getAbout(), getCategories(lang), getDestinations(lang), getBoats(lang)]);
  const A = about[lang];
  const en = lang === "en";
  const [t1, ...t2] = A.title.split(/(?<=\.)\s+/);
  // Rakamlar: {tekne} ve {liman} yerine yayındaki yat ve liman sayısı. Eski kayıtta "kurucu ortak / destinasyon bölgesi" kaldıysa onlar da sayıya çevrilir.
  const stats = ((A.stats ?? []) as string[][]).map(([v, l]) => {
    if (v.includes("{tekne}") || /kurucu ortak|founding partner/i.test(l)) return [String(boats.length), v.includes("{tekne}") ? l : en ? "boats in our portfolio" : "portföyümüzdeki yat"];
    if (v.includes("{liman}") || /destinasyon bölgesi|destination region/i.test(l)) return [String(dests.length), v.includes("{liman}") ? l : en ? "ports" : "liman"];
    return [v, l];
  });
  const edu = (A.edu ?? []) as string[];
  return (
    <>
      <Header lang={lang} />
      <main>
        {/* Başlık */}
        <section className="relative isolate overflow-hidden pb-28 pt-28 text-white lg:pb-36 lg:pt-40" style={{ background: "linear-gradient(160deg, #05204a 0%, #06264b 45%, #0b4a6e 80%, #0d6a86 100%)" }}>
          <div className="absolute inset-x-0 bottom-0 -z-10 h-28 overflow-hidden" aria-hidden>
            <svg className="wave-a absolute bottom-0 left-0 h-28 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={WAVE(150)} fill="rgba(255,255,255,0.08)" /></svg>
            <svg className="wave-b absolute bottom-0 left-0 h-20 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={WAVE(220)} fill="rgba(255,255,255,0.12)" /></svg>
            <svg className="absolute bottom-0 left-0 h-10 w-full" viewBox="0 0 1440 100" preserveAspectRatio="none"><path d="M0 60 q360 -50 720 0 t720 0 V100 H0z" fill="#ffffff" /></svg>
          </div>
          {/* arka planda yavaşça dönen dümen */}
          <svg className="absolute -right-32 top-10 -z-10 h-[34rem] w-[34rem] animate-spin text-white/[0.05] [animation-duration:90s] motion-reduce:animate-none lg:-right-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.6" aria-hidden><path d={HELM} /></svg>
          <div className={wrap}>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-turquoise">{en ? "About us" : "Hakkımızda"}</p>
            <h1 className="font-display mt-4 max-w-4xl text-4xl font-semibold leading-[1.05] lg:text-7xl">
              {t1}{t2.length > 0 && <><br /><span className="text-turquoise">{t2.join(" ")}</span></>}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">{A.sub}</p>
            {stats.length > 0 && (
              <dl className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-white/10 ring-1 ring-white/10 lg:grid-cols-4">
                {stats.map(([v, l]) => (
                  <div key={l} className="bg-[#06264b]/60 p-5 backdrop-blur lg:p-7">
                    <dt className="sr-only">{l}</dt>
                    <dd>
                      <CountUp value={v} className="font-display block text-4xl font-semibold text-turquoise lg:text-6xl" />
                      <span className="mt-2 block text-sm leading-snug text-white/70">{l}</span>
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </section>

        {/* Hikâye */}
        <section className="py-16 lg:py-28">
          <div className={`${wrap} grid gap-12 lg:grid-cols-[1fr_1.25fr] lg:gap-20`}>
            <div className="lg:sticky lg:top-28 lg:h-fit">
              <p className={eyebrow}>{A.storyEyebrow}</p>
              <h2 className={`${h2} mt-3`}>{A.storyTitle}</h2>
              <p className="mt-6 text-lg leading-relaxed text-navy/70">{A.storyLead}</p>
            </div>
            <ol className="relative ml-4 space-y-10 border-l-2 border-dashed border-turquoise/40 pl-9 lg:pl-12">
              {A.story.map((t, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[3.45rem] top-0 flex h-9 w-9 items-center justify-center rounded-full bg-navy text-turquoise ring-4 ring-white lg:-left-[4.2rem]">
                    <Ic d={i === A.story.length - 1 ? SAIL : ANCHOR} size={16} />
                  </span>
                  <p className={i === 0 ? "text-xl leading-relaxed text-navy/85 lg:text-2xl lg:leading-relaxed" : "text-lg leading-relaxed text-navy/70"}>{t}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Uzmanlıklar */}
        <section className="bg-mist py-16 lg:py-24">
          <div className={wrap}>
            <div className="max-w-3xl">
              <p className={eyebrow}>{A.expEyebrow}</p>
              <h2 className={`${h2} mt-3`}>{A.expTitle}</h2>
              <p className="mt-5 text-lg text-navy/70">{A.expLead}</p>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              {A.exp.map(([title, ...paras], i) => (
                <article key={title} className={`relative overflow-hidden rounded-[2rem] p-7 lg:p-10 ${i === 0 ? "bg-navy text-white" : "bg-white text-navy ring-1 ring-navy/10"}`}>
                  <svg className={`absolute -bottom-10 -right-10 h-56 w-56 ${i === 0 ? "text-white/[0.05]" : "text-navy/[0.04]"}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden><path d={EXP_IC[i % 2]} /></svg>
                  <span className={`relative flex h-14 w-14 items-center justify-center rounded-2xl ${i === 0 ? "bg-turquoise text-navy" : "bg-turquoise/15 text-turquoise-dark"}`}><Ic d={EXP_IC[i % 2]} size={26} /></span>
                  <h3 className="font-display relative mt-6 text-2xl font-semibold lg:text-3xl">{title}</h3>
                  {paras.map((p, k) => <p key={k} className={`relative mt-4 leading-relaxed ${i === 0 ? "text-white/75" : "text-navy/70"}`}>{p}</p>)}
                  {i === 0 && edu.length > 0 && (
                    <ol className="relative mt-8 space-y-2">
                      {edu.map((e, k) => (
                        <li key={e} className="flex items-center gap-3" style={{ marginLeft: `${k * 0.9}rem` }}>
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-turquoise/20 text-xs font-bold text-turquoise">{k + 1}</span>
                          <span className="rounded-full bg-white/[0.07] px-4 py-2 text-sm font-medium text-white/90 ring-1 ring-white/10">{e}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Çalışma anlayışı */}
        <section className="py-16 lg:py-24">
          <div className={wrap}>
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-20">
              <div>
                <p className={eyebrow}>{A.wayEyebrow}</p>
                <h2 className={`${h2} mt-3`}>{A.wayTitle}</h2>
              </div>
              <div className="space-y-4 text-lg leading-relaxed text-navy/70">
                {A.wayText.map((t, i) => <p key={i}>{t}</p>)}
                {cats.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-3">
                    {cats.map((c) => (
                      <Link key={c.slug} href={href(lang, `/tekne-tipleri/${c.slug}`)} className="rounded-full bg-mist px-4 py-2 text-sm font-semibold text-navy ring-1 ring-navy/10 transition hover:bg-navy hover:text-white">{c.name}</Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <ol className="relative mt-14 grid gap-8 lg:grid-cols-3 lg:gap-6">
              <span className="absolute left-0 right-0 top-[2.1rem] hidden h-0.5 bg-[repeating-linear-gradient(90deg,rgba(27,180,196,0.5)_0_10px,transparent_10px_20px)] lg:block" aria-hidden />
              {A.steps.map(([title, text], i) => (
                <li key={title} className="relative">
                  <span className="relative z-10 flex h-[4.2rem] w-[4.2rem] items-center justify-center rounded-2xl bg-navy text-turquoise shadow-lg shadow-navy/20 ring-8 ring-white">
                    <Ic d={STEP_IC[i % STEP_IC.length]} size={26} />
                  </span>
                  <p className="mt-6 text-xs font-bold tracking-[0.25em] text-turquoise-dark">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="font-display mt-2 text-xl font-semibold text-navy">{title}</h3>
                  <p className="mt-2 leading-relaxed text-navy/65">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Sorumluluk */}
        <section className="pb-16 lg:pb-24">
          <div className={wrap}>
            <div className="relative isolate overflow-hidden rounded-[2.5rem] px-7 py-12 text-white lg:px-14 lg:py-20" style={{ background: "linear-gradient(150deg, #05204a 0%, #0a3f63 55%, #0b6a86 100%)" }}>
              <div className="absolute inset-x-0 bottom-0 -z-10 h-24 overflow-hidden opacity-60" aria-hidden>
                <svg className="wave-a absolute bottom-0 left-0 h-24 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={WAVE(160)} fill="rgba(127,220,230,0.14)" /></svg>
              </div>
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-turquoise">{A.respEyebrow}</p>
                <h2 className="font-display mt-3 text-3xl font-semibold leading-tight lg:text-5xl">{A.respTitle}</h2>
                <p className="mt-5 text-white/75">{A.respLead}</p>
              </div>
              <div className="mt-12 grid gap-4 lg:grid-cols-3">
                {A.resp.map(([title, text], i) => (
                  <div key={title} className="rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/10 backdrop-blur transition hover:bg-white/[0.1] lg:p-7">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-turquoise text-navy"><Ic d={RESP_IC[i % RESP_IC.length]} /></span>
                    <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/75">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Alt çağrı + kıyı şeridi */}
        <section className="pb-20 lg:pb-28">
          <div className="mx-auto max-w-4xl px-5 text-center">
            <p className={eyebrow}>{A.ctaEyebrow}</p>
            <h2 className={`${h2} mt-3`}>{A.ctaTitle}</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-navy/70">{A.ctaText}</p>
          </div>
          {dests.length > 0 && (
            <div className="no-scrollbar mt-10 overflow-x-auto">
              <ol className="mx-auto flex w-max items-center px-5">
                {dests.map((d, i) => (
                  <li key={d.slug} className="flex items-center">
                    <Link href={href(lang, `/limanlar/${d.slug}`)} className="group flex flex-col items-center gap-2 px-1">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-turquoise-dark shadow-md shadow-navy/10 ring-1 ring-navy/10 transition group-hover:bg-navy group-hover:text-turquoise"><Ic d={PIN} size={18} /></span>
                      <span className="whitespace-nowrap text-sm font-semibold text-navy">{d.name}</span>
                    </Link>
                    {i < dests.length - 1 && <span className="mx-1 mb-7 h-0.5 w-8 bg-[repeating-linear-gradient(90deg,rgba(6,38,75,0.25)_0_6px,transparent_6px_12px)] lg:w-14" aria-hidden />}
                  </li>
                ))}
              </ol>
            </div>
          )}
          <div className="mt-10 flex flex-wrap justify-center gap-3 px-5">
            <Link href={href(lang, "/iletisim")} className="rounded-full bg-turquoise px-7 py-3.5 font-semibold text-navy shadow-lg shadow-turquoise/30 transition hover:brightness-110">{A.ctaBtn1}</Link>
            <Link href={href(lang, "/destinasyonlar")} className="rounded-full px-7 py-3.5 font-semibold text-navy ring-1 ring-navy/15 transition hover:ring-turquoise">{A.ctaBtn2} →</Link>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  );
}
