import { Fragment } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { RichText } from "@/components/RichText";
import { ProcessTrack } from "@/components/ProcessTrack";
import { getPosts, type Post } from "@/lib/posts";
import { getContact } from "@/lib/content";
import { href, type Lang } from "@/lib/i18n";
import { gt } from "@/lib/guide-text";

const wrap = "mx-auto max-w-7xl px-5 lg:px-8";
const WAVE = (y: number) => `M0 ${y} q180 -60 360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 V400 H0 z`;

// Adım ikonları (adım adresine göre). Bilinmeyen adımlar çapa ikonu alır.
const ICON: Record<string, string> = {
  talep: "M4 5h16v11H8l-4 4V5ZM8 9h8M8 12h5",
  "musaitlik-teklif": "M4 6h16v14H4zM8 3v4M16 3v4M4 10h16M9 15l2 2 4-4",
  "onay-sozlesme": "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17c1-1.5 2-1.5 3 0s2 1.5 3 0",
  "detaylar-kumanya-listesi": "M9 4h6v3H9zM6 5h3M15 5h3v16H6V5M9 11h6M9 15h4",
  "kumanya-alimi": "M4 8h16l-1.5 12h-13L4 8ZM9 8V6a3 3 0 0 1 6 0v2M9 12v4M15 12v4",
  "karsilama-welcome": "M8 21h8M12 17v4M6 3h12l-1 6a5 5 0 0 1-10 0L6 3ZM7 7h10",
  "seyir-gunleri": "M12 3v13l7-1L12 3ZM11 6v9H6l5-9ZM3 19c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0",
  "donus-teslim": "M14 7a4 4 0 1 1-3.9 4.9L3 19v2h3v-2h2v-2h2l1.1-1.1A4 4 0 0 1 14 7ZM16 9h.01",
  sonrasi: "M12 20s-8-4.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6.5-8 11-8 11Z",
};
const ANCHOR = "M12 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM12 8v13M5 13a7 7 0 0 0 14 0M8 11h8";
const BOX = "M4 9h16v11H4zM8 9V5h8v4M4 13h16";
const PHASE_OF: Record<string, number> = { talep: 0, "musaitlik-teklif": 0, "onay-sozlesme": 0, "detaylar-kumanya-listesi": 1, "kumanya-alimi": 1, "karsilama-welcome": 2, "seyir-gunleri": 2, "donus-teslim": 2, sonrasi: 3 };

const UI = {
  tr: {
    eyebrow: "Yatpaketi Rehberi", title: "Talepten iskeleye, adım adım.", lead: "Bir mesajla başlayan yolculuğunuz, limanda sizi bekleyen tekneyle devam eder. Her aşamada ne olacağını, sizden ne beklendiğini ve bizim neyi üstlendiğimizi burada bulabilirsiniz.",
    start: "Adımları görün", quote: "Hemen talep gönderin", step: "Adım",
    phases: [["Rezervasyon", "Talep, teklif ve onay"], ["Hazırlık", "Detaylar ve kumanya"], ["Yolculuk", "Karşılamadan teslime"], ["Sonrası", "Anılar ve geri bildirim"]],
    when: { talep: "Şimdi", "musaitlik-teklif": "Talebinizden sonra", "onay-sozlesme": "Teklifi onayladığınızda", "detaylar-kumanya-listesi": "Yolculuktan önce", "kumanya-alimi": "Biniş öncesi", "karsilama-welcome": "1. gün", "seyir-gunleri": "Yolculuk boyunca", "donus-teslim": "Son gün", sonrasi: "Dönüşte" } as Record<string, string>,
    turum: "Turum'da takip edin",
    mock: { label: "Örnek görünüm", title: "Turum", trip: "Göcek · 7 gün", items: [["Sözleşme imzalandı", "done"], ["Yolcu listesi", "done"], ["Kumanya listesi", "now"], ["Karşılama · Göcek Marina", "next"]] as [string, string][], ready: "Hazırlık", now: "Hazırlanıyor" },
    factsTitle: "Kısaca bilmeniz gerekenler",
    facts: [["Talep sizi bağlamaz", "Talep göndermek ücretsizdir; bu aşamada ödeme yapmazsınız."], ["Fiyatı ne belirler?", "Tekne, sezon, rota ve süre. Teklif bu bilgilere göre netleşir."], ["Kumanya", "Listenize göre alınır, belgeleriyle ayrıca hesaplanır."], ["Esnek rota", "Kaptan, güvenliğiniz için rotayı hava durumuna göre ayarlar."]],
    ctaTitle: "İlk adım sadece bir mesaj.", ctaText: "Tatil tarihinizi, kişi sayınızı ve aklınızdaki bölgeyi yazın; size uygun tekneleri ve teklifi birlikte netleştirelim.", boats: "Tekneleri inceleyin", faq: "Sık sorulan sorular",
    wa: "Merhaba, tekne kiralamak istiyorum. Tarih ve kişi sayısı: ",
  },
  en: {
    eyebrow: "Yatpaketi Guide", title: "From request to the quay, step by step.", lead: "Your voyage starts with a message and continues with a boat waiting for you in port. Here you'll find what happens at each stage, what we need from you and what we take care of.",
    start: "See the steps", quote: "Send a request", step: "Step",
    phases: [["Booking", "Request, quote and confirmation"], ["Preparation", "Details and provisions"], ["The voyage", "From welcome to hand-over"], ["Afterwards", "Memories and feedback"]],
    when: { talep: "Now", "musaitlik-teklif": "After your request", "onay-sozlesme": "When you accept the quote", "detaylar-kumanya-listesi": "Before the trip", "kumanya-alimi": "Before boarding", "karsilama-welcome": "Day 1", "seyir-gunleri": "Throughout the trip", "donus-teslim": "Last day", sonrasi: "Back home" } as Record<string, string>,
    turum: "Follow it on My Tour",
    mock: { label: "Example view", title: "My Tour", trip: "Göcek · 7 days", items: [["Contract signed", "done"], ["Guest list", "done"], ["Provisions list", "now"], ["Welcome · Göcek Marina", "next"]] as [string, string][], ready: "Preparation", now: "In progress" },
    factsTitle: "Good to know",
    facts: [["A request is not binding", "Sending a request is free; no payment is taken at this stage."], ["What sets the price?", "The boat, season, route and duration. Your quote is based on these."], ["Provisions", "Bought from your list and charged separately, with receipts."], ["A flexible route", "Your captain adjusts the route to the weather for your safety."]],
    ctaTitle: "The first step is just a message.", ctaText: "Tell us your dates, group size and the region you have in mind; we'll find the right boats and finalise your quote together.", boats: "Browse boats", faq: "FAQ",
    wa: "Hello, I'd like to charter a boat. Dates and group size: ",
  },
};
const FACT_ICONS = ["M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4ZM9 12l2 2 4-4", "M20 12l-8 8-9-9V3h8l9 9ZM7.5 7.5h.01", "M4 8h16l-1.5 12h-13L4 8ZM9 8V6a3 3 0 0 1 6 0v2", "M12 3v13l7-1L12 3ZM11 6v9H6l5-9ZM3 19c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0"];

function Ic({ d, size = 22, className = "" }: { d: string; size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d={d} />
    </svg>
  );
}

function Step({ s, i, U }: { s: Post; i: number; U: (typeof UI)["tr"] }) {
  const right = i % 2 === 1;
  const turum = /turum|my tour/i.test(s.content);
  return (
    <li data-step id={s.slug} className="group relative scroll-mt-40 pb-10 lg:grid lg:grid-cols-2 lg:gap-28 lg:pb-14">
      <span className="absolute left-[1.65rem] top-6 z-10 flex h-11 w-11 -translate-x-1/2 items-center justify-center rounded-full border-2 border-navy/10 bg-white font-display text-lg font-semibold text-navy/40 transition duration-500 group-data-[on]:border-navy group-data-[on]:bg-navy group-data-[on]:text-white group-data-[on]:shadow-lg group-data-[on]:shadow-navy/30 lg:left-1/2 lg:h-14 lg:w-14 lg:text-xl">
        {i + 1}
      </span>
      <article className={`ml-14 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy/5 transition duration-500 group-data-[on]:shadow-xl group-data-[on]:shadow-navy/10 lg:ml-0 lg:p-8 ${right ? "lg:col-start-2" : ""}`}>
        <div className="flex items-start justify-between gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-turquoise/15 text-turquoise-dark transition duration-500 group-data-[on]:bg-turquoise group-data-[on]:text-white">
            <Ic d={ICON[s.slug] ?? ANCHOR} />
          </span>
          {U.when[s.slug] && <span className="rounded-full bg-mist px-3 py-1.5 text-xs font-semibold text-navy/60">{U.when[s.slug]}</span>}
        </div>
        <h3 className="font-display mt-5 text-2xl font-semibold leading-snug text-navy lg:text-[1.7rem]">{s.title}</h3>
        {s.excerpt && <p className="mt-2 text-lg font-medium leading-relaxed text-turquoise-dark">{s.excerpt}</p>}
        {s.content && <div className="mt-4 text-[15px] leading-relaxed text-navy/70"><RichText text={s.content} /></div>}
        {turum && (
          <Link href="/musteri" className="mt-5 inline-flex items-center gap-2 rounded-full bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-turquoise-dark">
            <Ic d={BOX} size={16} />{U.turum} →
          </Link>
        )}
      </article>
    </li>
  );
}

export async function ProcessView({ lang }: { lang: Lang }) {
  const T = gt(lang);
  const U = UI[lang];
  const [steps, contact] = await Promise.all([getPosts("process", undefined, lang), getContact()]);
  const wa = contact.whatsapp ? `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(U.wa)}` : href(lang, "/iletisim");
  const phaseOf = (s: Post, i: number) => PHASE_OF[s.slug] ?? Math.min(3, Math.floor((i / Math.max(steps.length, 1)) * 4));
  const counts = [0, 0, 0, 0];
  steps.forEach((s, i) => { counts[phaseOf(s, i)]++; });

  return (
    <>
      <Header lang={lang} />
      <main>
        {/* Başlık */}
        <section className="relative isolate overflow-hidden pb-28 pt-28 text-white lg:pb-36 lg:pt-36" style={{ background: "linear-gradient(160deg, #05204a 0%, #06264b 45%, #0b4a6e 80%, #0d6a86 100%)" }}>
          <div className="absolute inset-x-0 bottom-0 -z-10 h-28 overflow-hidden" aria-hidden>
            <svg className="wave-a absolute bottom-0 left-0 h-28 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={WAVE(150)} fill="rgba(255,255,255,0.08)" /></svg>
            <svg className="wave-b absolute bottom-0 left-0 h-20 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={WAVE(220)} fill="rgba(255,255,255,0.12)" /></svg>
            <svg className="absolute bottom-0 left-0 h-10 w-full" viewBox="0 0 1440 100" preserveAspectRatio="none"><path d="M0 60 q360 -50 720 0 t720 0 V100 H0z" fill="#f7f9fa" /></svg>
          </div>
          <div className={`${wrap} grid items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16`}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-turquoise">{U.eyebrow} · {T.process}</p>
              <h1 className="font-display mt-4 text-4xl font-semibold leading-[1.05] lg:text-6xl">{U.title}</h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">{U.lead}</p>
              {steps.length > 0 && (
                <ol className="mt-8 grid max-w-xl grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {U.phases.map(([name, desc], k) => counts[k] > 0 && (
                    <li key={name} className="rounded-2xl bg-white/[0.07] p-3.5 ring-1 ring-white/10 backdrop-blur">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-turquoise">0{k + 1}</span>
                      <p className="mt-1 font-semibold leading-tight">{name}</p>
                      <p className="mt-1 text-xs leading-snug text-white/55">{desc}</p>
                    </li>
                  ))}
                </ol>
              )}
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#adimlar" className="rounded-full bg-turquoise px-7 py-3.5 text-sm font-semibold text-navy shadow-lg shadow-turquoise/30 transition hover:brightness-110">{U.start} ↓</a>
                <a href={wa} target={contact.whatsapp ? "_blank" : undefined} rel="noopener noreferrer" className="rounded-full px-7 py-3.5 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/10">{U.quote}</a>
              </div>
            </div>

            {/* Örnek Turum kartı */}
            <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
              <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-turquoise/25 blur-3xl" aria-hidden />
              <div className="rotate-[-2deg] rounded-[2rem] bg-white p-6 text-navy shadow-2xl shadow-black/40 transition duration-500 hover:rotate-0 lg:p-7" role="img" aria-label={`${U.mock.title} · ${U.mock.label}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy text-white"><Ic d={BOX} size={20} /></span>
                    <div>
                      <p className="font-display text-lg font-semibold leading-tight">{U.mock.title}</p>
                      <p className="text-xs text-navy/50">{U.mock.trip}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-mist px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-navy/45">{U.mock.label}</span>
                </div>
                <div className="mt-5 flex items-center justify-between text-xs font-semibold"><span className="text-navy/60">{U.mock.ready}</span><span className="text-turquoise-dark">2/4</span></div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-mist"><div className="h-full w-1/2 rounded-full bg-gradient-to-r from-turquoise to-[#0b6a86]" /></div>
                <ul className="mt-5 space-y-2.5">
                  {U.mock.items.map(([t, st]) => (
                    <li key={t} className={`flex items-center gap-3 rounded-2xl p-3 ${st === "now" ? "bg-turquoise/10 ring-1 ring-turquoise/30" : "bg-mist"}`}>
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${st === "done" ? "bg-turquoise text-white" : st === "now" ? "bg-white text-turquoise-dark ring-2 ring-turquoise" : "bg-white text-navy/30 ring-1 ring-navy/15"}`}>
                        {st === "done" ? <Ic d="M5 12l5 5 9-10" size={15} /> : st === "now" ? <span className="h-2 w-2 animate-pulse rounded-full bg-turquoise" /> : <Ic d="M12 7v5l3 2" size={14} />}
                      </span>
                      <span className={`flex-1 text-sm font-medium ${st === "next" ? "text-navy/45" : ""}`}>{t}</span>
                      {st === "now" && <span className="text-[11px] font-semibold text-turquoise-dark">{U.mock.now}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Adımlar */}
        <section id="adimlar" className="scroll-mt-20 bg-mist pb-16 pt-14 lg:pb-24 lg:pt-20">
          <div className={wrap}>
            {steps.length === 0 ? (
              <p className="rounded-3xl bg-white p-8 text-center text-navy/70">{T.processEmpty}</p>
            ) : (
              <ProcessTrack titles={steps.map((s) => s.title)} stepLabel={U.step}>
                <ol className="pt-14">
                  {steps.map((s, i) => {
                    const ph = phaseOf(s, i);
                    const first = i === 0 || phaseOf(steps[i - 1], i - 1) !== ph;
                    return (
                      <Fragment key={s.slug}>
                        {first && (
                          <li className="relative z-10 mb-8 flex lg:justify-center">
                            <span className="ml-14 inline-flex items-center gap-3 rounded-full bg-white py-2 pl-2 pr-5 shadow-md shadow-navy/5 ring-1 ring-navy/5 lg:ml-0">
                              <span className="rounded-full bg-turquoise px-3 py-1 text-xs font-bold text-navy">0{ph + 1}</span>
                              <span className="font-display font-semibold text-navy">{U.phases[ph][0]}</span>
                              <span className="hidden text-sm text-navy/50 sm:inline">· {U.phases[ph][1]}</span>
                            </span>
                          </li>
                        )}
                        <Step s={s} i={i} U={U} />
                      </Fragment>
                    );
                  })}
                </ol>
              </ProcessTrack>
            )}
          </div>
        </section>

        {/* Kısa bilgiler */}
        <section className="py-14 lg:py-20">
          <div className={wrap}>
            <h2 className="font-display text-3xl font-semibold text-navy lg:text-4xl">{U.factsTitle}</h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {U.facts.map(([t, d], k) => (
                <li key={t} className="rounded-3xl bg-white p-6 ring-1 ring-navy/10">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy text-turquoise"><Ic d={FACT_ICONS[k]} size={20} /></span>
                  <h3 className="mt-4 font-semibold text-navy">{t}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-navy/65">{d}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Çağrı */}
        <section className="pb-20">
          <div className={wrap}>
            <div className="relative isolate overflow-hidden rounded-[2rem] p-8 text-white lg:p-14" style={{ background: "linear-gradient(135deg, #06264b 0%, #0b4a6e 60%, #0d6a86 100%)" }}>
              <svg className="absolute -right-10 -top-10 -z-10 h-72 w-72 text-white/[0.06]" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 3v13l7-1L12 3ZM11 6v9H6l5-9ZM4 17h16l-2 3H6l-2-3Z" /></svg>
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <h2 className="font-display text-3xl font-semibold lg:text-4xl">{U.ctaTitle}</h2>
                  <p className="mt-3 text-white/75">{U.ctaText}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                  <a href={wa} target={contact.whatsapp ? "_blank" : undefined} rel="noopener noreferrer" className="rounded-full bg-turquoise px-7 py-3.5 text-center text-sm font-semibold text-navy transition hover:brightness-110">{U.quote}</a>
                  <Link href={href(lang, "/tekneler")} className="rounded-full px-7 py-3.5 text-center text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/10">{U.boats}</Link>
                </div>
              </div>
              <p className="mt-8 text-sm text-white/60"><Link href={href(lang, "/sss")} className="underline underline-offset-4 hover:text-white">{U.faq} →</Link></p>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  );
}
