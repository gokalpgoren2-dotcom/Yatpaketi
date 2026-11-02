import Link from "next/link";
import { Header } from "./Header";
import { Footer } from "./Sections";
import { Photo } from "./Photo";
import { PostCard } from "./PostCard";
import { Scroller } from "./Scroller";
import { MapHero } from "./MapZoom";
import { href, type Lang } from "@/lib/i18n";
import { gt } from "@/lib/guide-text";
import { REGION_UI, type RegionText } from "@/lib/regions";
import type { Post } from "@/lib/posts";

const wrap = "mx-auto max-w-7xl px-5 lg:px-8";
const eyebrow = "text-xs font-semibold uppercase tracking-[0.28em] text-turquoise-dark";
const h2 = "font-display mt-3 text-3xl font-semibold leading-tight text-navy lg:text-5xl";

// Fotoğraf yoksa gösterilen sade deniz deseni.
function Sea({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#0b6a86] via-[#1bb4c4] to-[#7fdce6]" aria-label={label} role="img">
      <svg className="absolute inset-x-0 bottom-0 h-1/2 w-full" viewBox="0 0 400 100" preserveAspectRatio="none" aria-hidden>
        <path d="M0 40 q50 -20 100 0 t100 0 t100 0 t100 0 V100 H0z" fill="rgba(255,255,255,0.18)" />
        <path d="M0 65 q50 -18 100 0 t100 0 t100 0 t100 0 V100 H0z" fill="rgba(6,38,75,0.25)" />
      </svg>
    </div>
  );
}

// Destinasyon (bölge) sayfası: giriş, numaralı duraklar, fotoğraflı keşif kartları, not, harita, galeri.
// Fotoğraf sırası (panel galerisi): 1 → giriş, 2-4 → keşif kartları, kalanlar → galeri.
export function RegionPage({ p, R, photos, map, more, back, lang }: { p: Post; R: RegionText; photos: string[]; map: string | null; more: Post[]; back?: { href: string; label: string }; lang: Lang }) {
  const U = REGION_UI[lang];
  const T = gt(lang);
  const introPhoto = photos[0] ?? p.cover;
  const explorePhotos = photos.slice(1, 1 + R.explore.length);
  const gallery = photos.slice(1 + R.explore.length);
  const head = (
    <>
      {back && <Link href={back.href} className="text-sm text-white/80 hover:text-white">← {back.label}</Link>}
      <h1 className="font-display mt-3 max-w-3xl text-4xl font-semibold leading-tight lg:text-6xl">{p.title}</h1>
      {p.excerpt && <p className="mt-3 max-w-2xl text-lg text-white/85">{p.excerpt}</p>}
    </>
  );
  return (
    <>
      <Header lang={lang} />
      <main>
        {/* Başlık: bölge haritası (tıklayınca büyür) */}
        {map ? (
          <MapHero src={map} alt={lang === "en" ? `${p.title} map` : `${p.title} haritası`} open={lang === "en" ? "Enlarge map" : "Haritayı büyüt"} close={lang === "en" ? "Close" : "Kapat"}>
            {head}
          </MapHero>
        ) : (
          <section className="relative isolate overflow-hidden bg-navy pb-12 pt-28 text-white lg:pb-16 lg:pt-36">
            {p.cover && <div className="absolute inset-0 -z-10 opacity-30"><Photo src={p.cover} alt="" priority sizes="100vw" className="object-cover" /></div>}
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy via-navy/85 to-navy/50" />
            <div className={wrap}>{head}</div>
          </section>
        )}

        {/* Giriş */}
        <section className="py-14 lg:py-24">
          <div className={`${wrap} grid items-center gap-10 lg:grid-cols-2 lg:gap-16`}>
            <div>
              <p className={eyebrow}>{R.introEyebrow}</p>
              <h2 className={h2}>{R.introTitle}</h2>
              <p className="mt-6 text-lg leading-relaxed text-navy/75">{R.introLead}</p>
              <p className="mt-4 leading-relaxed text-navy/60">{R.introText}</p>
              <a href="#duraklar" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-turquoise px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-turquoise/25 transition hover:bg-turquoise-dark">
                {R.introCta}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 5v14M6 13l6 6 6-6" /></svg>
              </a>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-mist shadow-xl shadow-navy/10">
              {introPhoto ? <Photo src={introPhoto} alt={p.title} sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" /> : <Sea label={p.title} />}
            </div>
          </div>
        </section>

        {/* Duraklar */}
        <section id="duraklar" className="scroll-mt-24 bg-mist py-14 lg:py-24">
          <div className={wrap}>
            <p className={eyebrow}>{R.stopsEyebrow}</p>
            <h2 className={h2}>{R.stopsTitle}</h2>
            <p className="mt-4 max-w-2xl text-navy/65">{R.stopsLead}</p>
            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {R.stops.map(([name, tag, text], i) => (
                <li key={name} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-navy/5 transition hover:-translate-y-0.5 hover:shadow-md lg:p-7">
                  <span className="text-sm font-semibold text-turquoise-dark">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-display mt-3 text-xl font-semibold text-navy">{name}</h3>
                  <p className="mt-1.5 text-sm font-semibold text-turquoise-dark">{tag}</p>
                  <p className="mt-3 text-sm leading-relaxed text-navy/65">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* İleri keşif */}
        <section className="py-14 lg:py-24">
          <div className={wrap}>
            <p className={eyebrow}>{R.exploreEyebrow}</p>
            <h2 className={h2}>{R.exploreTitle}</h2>
            <p className="mt-4 max-w-3xl text-navy/65">{R.exploreLead}</p>
            <div className="mt-10 grid gap-5 md:grid-cols-3 lg:gap-6">
              {R.explore.map(([name, tag, text], i) => (
                <article key={name} className="overflow-hidden rounded-3xl bg-white shadow-lg shadow-navy/5 ring-1 ring-navy/5">
                  <div className="relative aspect-[4/3] bg-mist">
                    {explorePhotos[i] ? <Photo src={explorePhotos[i]} alt={name} sizes="(min-width:768px) 33vw, 100vw" className="object-cover" /> : <Sea label={name} />}
                  </div>
                  <div className="p-6 lg:p-7">
                    <h3 className="font-display text-xl font-semibold text-navy lg:text-2xl">{name}</h3>
                    <p className="mt-1.5 text-sm font-semibold text-turquoise-dark">{tag}</p>
                    <p className="mt-3 text-sm leading-relaxed text-navy/65">{text}</p>
                  </div>
                </article>
              ))}
            </div>

            {/* Not kutusu */}
            <aside className="mt-12 rounded-2xl border-l-4 border-turquoise bg-mist p-6 lg:p-8">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-navy/50">{R.noteEyebrow}</p>
              <h3 className="font-display mt-2 text-2xl font-semibold text-navy">{R.noteTitle}</h3>
              <p className="mt-3 max-w-4xl leading-relaxed text-navy/65">{R.noteText}</p>
            </aside>
          </div>
        </section>

        {/* Galeri */}
        {gallery.length > 0 && (
          <section className="pb-14 lg:pb-24">
            <div className={wrap}>
              <p className={eyebrow}>{U.gallery}</p>
              <div className="mt-6 grid auto-rows-[10rem] grid-cols-2 gap-3 sm:auto-rows-[12rem] lg:grid-cols-4 lg:gap-4">
                {gallery.map((src, i) => (
                  <div key={src} className={`relative overflow-hidden rounded-2xl bg-mist lg:rounded-3xl ${i === 0 && gallery.length > 2 ? "col-span-2 row-span-2" : ""}`}>
                    <Photo src={src} alt={`${p.title} ${i + 1}`} sizes="(min-width:1024px) 25vw, 50vw" className="object-cover transition duration-500 hover:scale-105" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Plan */}
        <section className="pb-14 lg:pb-20">
          <div className={wrap}>
            <div className="flex flex-col gap-6 rounded-3xl bg-gradient-to-br from-navy to-[#0b4a66] p-8 text-white lg:flex-row lg:items-center lg:justify-between lg:p-12">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-turquoise">{U.planEyebrow}</p>
                <h2 className="font-display mt-3 text-2xl font-semibold lg:text-3xl">{U.planTitle}</h2>
                <p className="mt-3 text-white/75">{U.planText}</p>
              </div>
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <Link href={href(lang, "/tekneler")} className="rounded-full bg-turquoise px-7 py-3.5 text-center text-sm font-semibold text-navy transition hover:brightness-110">{T.browse}</Link>
                <Link href={href(lang, "/iletisim")} className="rounded-full px-7 py-3.5 text-center text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/10">{U.write}</Link>
              </div>
            </div>
          </div>
        </section>

        {more.length > 0 && (
          <section className="pb-20">
            <div className={wrap}>
              <h2 className="font-display text-2xl font-semibold text-navy lg:text-3xl">{T.moreDest}</h2>
              <div className="mt-6">
                <Scroller className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 lg:mx-0 lg:gap-6 lg:px-0">
                  {more.map((m, i) => <div key={m.slug} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[calc((100%-3rem)/3)]"><PostCard p={m} i={i} lang={lang} /></div>)}
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
