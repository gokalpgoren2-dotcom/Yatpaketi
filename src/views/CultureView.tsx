import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { Photo } from "@/components/Photo";
import { GuletScene } from "@/components/culture/GuletScene";
import { SectionNav } from "@/components/culture/SectionNav";
import { YachtGlossary } from "@/components/culture/YachtGlossary";
import { getCulture } from "@/lib/site-texts";
import { getPost } from "@/lib/posts";
import { href, type Lang } from "@/lib/i18n";

const eyebrow = "text-xs font-semibold uppercase tracking-[0.28em] text-turquoise-dark";
const h2 = "font-display text-3xl font-semibold leading-tight text-navy lg:text-5xl";
const wrap = "mx-auto max-w-7xl px-5 lg:px-8";
const WAVE = (y: number) => `M0 ${y} q180 -60 360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 V400 H0 z`;

function Ic({ d, size = 22 }: { d: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>;
}
// Teknede yaşam kartlarının ikonları (sırayla)
const LIFE_IC = [
  "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM15.5 8.5l-2 5-5 2 2-5 5-2Z",
  "M12 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM12 8v13M5 13a7 7 0 0 0 14 0M8 11h8",
  "M4 5h16v11H8l-4 4V5ZM8 9h8M8 12h5",
  "M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z",
  "M3 21h18M5 21V11l7-6 7 6v10M10 21v-5h4v5",
  "M4 6h16v14H4zM8 3v4M16 3v4M4 10h16M8 14h3M13 14h3M8 17h3",
];
const ECO_IC = ["M6 7h12l-1 14H7L6 7ZM4 7h16M9 7V4h6v3M10 11v6M14 11v6", "M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z", "M5 19c8 0 14-6 14-14-8 0-14 6-14 14ZM5 19l7-7"];
const GU_IC: Record<string, string> = {
  "/rotalar": "M4 19c3-6 6 0 9-6s5-4 7-8M4 19h.01M20 5h.01",
  "/kiralama-sureci": "M9 4h6v3H9zM6 5h3M15 5h3v16H6V5M9 11h6M9 15h4",
  "/sss": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6M12 17h.01",
  "/destinasyonlar": "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5",
};

export async function CultureView({ lang }: { lang: Lang }) {
  const C = (await getCulture())[lang];
  const en = lang === "en";
  // Kapak fotoğrafı: panel > Yazılar > "Yat ve Yatçılık Kültürü" sayfasına yüklenen fotoğraf (TR kaydında). Yoksa çizim gösterilir.
  const page = await getPost("page", "yat-ve-yatcilik-kulturu", "tr");
  const cover = page?.cover ?? null;
  const [firstPara, ...restParas] = C.blueText;
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
          <div className={`${wrap} grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16`}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-turquoise">{C.heroEyebrow}</p>
              <h1 className="font-display mt-4 text-4xl font-semibold leading-[1.05] lg:text-6xl">{C.title}</h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/80">{C.sub}</p>
              <a href="#giris" className="mt-8 inline-flex items-center gap-2 rounded-full bg-turquoise px-7 py-3.5 text-sm font-semibold text-navy shadow-lg shadow-turquoise/30 transition hover:brightness-110">{en ? "Start reading" : "Okumaya başlayın"} ↓</a>
            </div>
            <div className="relative">
              <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-turquoise/20 blur-3xl" aria-hidden />
              <div className="relative aspect-[3/2] overflow-hidden rounded-[2rem] shadow-2xl shadow-black/40 ring-1 ring-white/15">
                {cover ? <Photo src={cover} alt={C.title} priority sizes="(min-width:1024px) 55vw, 100vw" className="object-cover" /> : <GuletScene label={C.title} />}
              </div>
            </div>
          </div>
        </section>

        <SectionNav items={C.chips} />

        {/* Giriş */}
        <section id="giris" className="scroll-mt-32 py-16 lg:py-24">
          <div className={`${wrap} grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-20`}>
            <div>
              <h2 className={h2}>{C.heroTitle}</h2>
            </div>
            <div>
              <p className="text-xl leading-relaxed text-navy/80 lg:text-2xl lg:leading-relaxed">{C.heroLead}</p>
              {C.heroText.map((t) => <p key={t} className="mt-5 leading-relaxed text-navy/65">{t}</p>)}
            </div>
          </div>
        </section>

        {/* Mavi yolculuk: dergi düzeni */}
        <section id="mavi-yolculuk" className="scroll-mt-32 bg-mist py-16 lg:py-24">
          <div className={wrap}>
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-5">
                <p className={eyebrow}>{C.blueEyebrow}</p>
                <h2 className={`${h2} mt-3`}>{C.blueTitle}</h2>
                <p className="mt-5 text-lg text-navy/70">{C.blueLead}</p>
                <div className="relative mt-10 hidden overflow-hidden rounded-[2rem] bg-navy p-8 text-white lg:block">
                  <svg className="absolute -bottom-6 -right-6 h-48 w-48 text-white/[0.07]" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 3v13l7-1L12 3ZM11 6v9H6l5-9ZM4 17h16l-2 3H6l-2-3Z" /></svg>
                  <p className="font-display text-7xl font-semibold leading-none text-turquoise">“</p>
                  <p className="font-display -mt-4 text-2xl font-semibold leading-snug">{C.quote}</p>
                </div>
              </div>
              <div className="lg:col-span-7">
                {firstPara && <p className="text-lg leading-relaxed text-navy/80 first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-7xl first-letter:font-semibold first-letter:leading-[0.8] first-letter:text-turquoise-dark">{firstPara}</p>}
                {restParas.map((t, i) => (
                  <p key={t} className={`mt-6 leading-relaxed text-navy/70 ${i === 0 ? "border-l-4 border-turquoise pl-5 text-lg text-navy/80" : ""}`}>{t}</p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Teknede yaşam */}
        <section id="teknede-yasam" className="scroll-mt-32 py-16 lg:py-24">
          <div className={wrap}>
            <div className="max-w-3xl">
              <p className={eyebrow}>{C.lifeEyebrow}</p>
              <h2 className={`${h2} mt-3`}>{C.lifeTitle}</h2>
              <p className="mt-5 text-lg text-navy/70">{C.lifeLead}</p>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {C.life.map(([t, d], i) => (
                <article key={t} className="group relative overflow-hidden rounded-[1.75rem] bg-white p-7 ring-1 ring-navy/10 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-navy/10 hover:ring-turquoise/40">
                  <span className="absolute -right-3 -top-6 font-display text-[7rem] font-semibold leading-none text-navy/[0.04] transition group-hover:text-turquoise/10" aria-hidden>{i + 1}</span>
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-turquoise/15 text-turquoise-dark transition duration-300 group-hover:bg-navy group-hover:text-turquoise"><Ic d={LIFE_IC[i % LIFE_IC.length]} /></span>
                  <h3 className="font-display relative mt-5 text-xl font-semibold text-navy">{t}</h3>
                  <p className="relative mt-2 text-[15px] leading-relaxed text-navy/65">{d}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Alıntı (mobilde; masaüstünde mavi yolculuk bölümünde) */}
        <section className="pb-4 lg:hidden">
          <div className={wrap}>
            <blockquote className="rounded-[2rem] bg-navy p-8 text-white">
              <p className="font-display text-6xl leading-none text-turquoise">“</p>
              <p className="font-display -mt-3 text-2xl font-semibold leading-snug">{C.quote}</p>
            </blockquote>
          </div>
        </section>

        {/* Denize saygı */}
        <section id="denize-saygi" className="scroll-mt-32 py-12 lg:py-16">
          <div className={wrap}>
            <div className="relative isolate overflow-hidden rounded-[2.5rem] px-7 py-12 text-white lg:px-14 lg:py-20" style={{ background: "linear-gradient(150deg, #05204a 0%, #0a3f63 55%, #0b6a86 100%)" }}>
              <div className="absolute inset-x-0 bottom-0 -z-10 h-24 overflow-hidden opacity-60" aria-hidden>
                <svg className="wave-a absolute bottom-0 left-0 h-24 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={WAVE(160)} fill="rgba(127,220,230,0.14)" /></svg>
              </div>
              <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-turquoise">{C.ecoEyebrow}</p>
                  <h2 className="font-display mt-3 text-3xl font-semibold leading-tight lg:text-5xl">{C.ecoTitle}</h2>
                  <p className="mt-5 text-white/75">{C.ecoLead}</p>
                </div>
                <ol className="space-y-4">
                  {C.eco.map(([t, d], i) => (
                    <li key={t} className="flex gap-5 rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/10 backdrop-blur transition hover:bg-white/[0.1]">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-turquoise text-navy"><Ic d={ECO_IC[i % ECO_IC.length]} /></span>
                      <div>
                        <h3 className="text-lg font-semibold">{t}</h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-white/75">{d}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* Sözlük: etkileşimli tekne */}
        <section id="denizcilik-sozlugu" className="scroll-mt-32 py-16 lg:py-24">
          <div className={wrap}>
            <div className="max-w-3xl">
              <p className={eyebrow}>{C.gloEyebrow}</p>
              <h2 className={`${h2} mt-3`}>{C.gloTitle}</h2>
              <p className="mt-5 text-lg text-navy/70">{C.gloLead}</p>
            </div>
            <div className="mt-12">
              <YachtGlossary items={C.glo} hint={en ? "Bow facing up · tap a word" : "Teknenin başı yukarıda · bir kelimeye dokunun"} />
            </div>
          </div>
        </section>

        {/* Rehberler */}
        <section id="rehberler" className="scroll-mt-32 bg-mist py-16 lg:py-24">
          <div className={wrap}>
            <div className="max-w-3xl">
              <p className={eyebrow}>{C.guEyebrow}</p>
              <h2 className={`${h2} mt-3`}>{C.guTitle}</h2>
              <p className="mt-5 text-lg text-navy/70">{C.guLead}</p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {C.gu.map(([t, d, to]) => (
                <Link key={to} href={href(lang, to)} className="group flex flex-col rounded-[1.75rem] bg-white p-6 ring-1 ring-navy/10 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-navy/10">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-navy text-turquoise transition group-hover:bg-turquoise group-hover:text-navy"><Ic d={GU_IC[to] ?? LIFE_IC[0]} /></span>
                  <h3 className="mt-5 font-display text-lg font-semibold text-navy">{t}</h3>
                  <p className="mt-1 text-sm text-navy/65">{d}</p>
                  <span className="mt-auto pt-4 text-sm font-semibold text-turquoise-dark">{en ? "Explore" : "Göz atın"} <span className="inline-block transition group-hover:translate-x-1">→</span></span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  );
}
