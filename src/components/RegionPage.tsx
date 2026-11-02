import Link from "next/link";
import { Header } from "./Header";
import { Footer } from "./Sections";
import { Photo } from "./Photo";
import { Scroller } from "./Scroller";
import { MapZoom } from "./MapZoom";
import { BoatCard } from "./BoatCard";
import { RouteCard } from "./RouteList";
import { SectionNav } from "./culture/SectionNav";
import { href, type Lang } from "@/lib/i18n";
import { gt } from "@/lib/guide-text";
import { REGION_UI, regionText, type RegionText } from "@/lib/regions";
import { regionMapFor } from "@/lib/region-maps";
import { toCard } from "@/lib/routes";
import { getPosts, type Post } from "@/lib/posts";
import { getBoats, getContact } from "@/lib/content";

const wrap = "mx-auto max-w-7xl px-5 lg:px-8";
const eyebrow = "text-xs font-semibold uppercase tracking-[0.28em] text-turquoise-dark";
const h2 = "font-display mt-3 text-3xl font-semibold leading-tight text-navy lg:text-5xl";
const WAVE = (y: number) => `M0 ${y} q180 -60 360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 V400 H0 z`;
const NAVY_BG = { background: "linear-gradient(160deg, #05204a 0%, #06264b 45%, #0b4a6e 80%, #0d6a86 100%)" };

// Bölgeye göre kalkış limanları (tekneler) ve rotalarda aranacak yer adları.
const REGION: Record<string, { ports: string[]; places: string[] }> = {
  "fethiye-korfezi-gocek": { ports: ["gocek", "fethiye"], places: ["Göcek", "Fethiye", "Tersane Adası", "Tersane Island", "Yassıcalar", "Ölüdeniz", "Gemiler Adası", "Gemiler Island"] },
  "bodrum-gokova-korfezi": { ports: ["bodrum"], places: ["Bodrum", "Gökova", "Karaada", "Akyaka", "Sedir Adası", "Sedir Island", "Gümüşlük", "Yalıkavak"] },
  "datca-hisaronu-korfezi": { ports: ["datca"], places: ["Datça", "Knidos", "Hisarönü", "Orhaniye"] },
  "bozburun-sogut": { ports: ["bozburun", "selimiye"], places: ["Bozburun", "Selimiye", "Söğüt", "Sömbeki"] },
  "marmaris-ekincik": { ports: ["marmaris"], places: ["Marmaris", "Ekincik", "Dalyan"] },
  "kas-kekova": { ports: ["kas"], places: ["Kekova", "Kalkan & Kaş", "Meis", "Kastellorizo"] },
};

function Ic({ d, size = 22 }: { d: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>;
}
// Durak adına göre ikon: antik/tarih, ada, köy/liman, kumsal, koy.
function stopIcon(name: string, text: string) {
  const s = `${name} ${text}`.toLocaleLowerCase("tr");
  if (/antik|kale|kalıntı|tarih|batık|ruin|castle|ancient|history/.test(s)) return "M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M2 10h20L12 3 2 10Z";
  if (/ada|island|islet/.test(s)) return "M3 18c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0M6 15c1-4 3-6 6-6s5 2 6 6M12 9V4l4 2-4 2";
  if (/köy|liman|kasaba|village|harbour|town|marina/.test(s)) return "M3 21h18M5 21V11l7-6 7 6v10M10 21v-5h4v5";
  if (/kumsal|plaj|beach/.test(s)) return "M3 20h18M12 20 7 8M7 8a8 8 0 0 1 12 2L7 8Z";
  return "M3 18c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0M5 14c2-5 5-8 7-8s5 3 7 8";
}

// Fotoğraf yoksa gösterilen deniz deseni.
function Sea({ label }: { label: string }) {
  return (
    <div className="absolute inset-0" style={{ background: "linear-gradient(160deg, #06264b 0%, #0b6a86 60%, #1bb4c4 100%)" }} aria-label={label} role="img">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="none" aria-hidden>
        <circle cx="300" cy="90" r="34" fill="#ffd79a" fillOpacity="0.85" />
        <path d="M0 170 L70 120 L140 160 L220 105 L300 165 L400 140 V200 H0Z" fill="#06264b" fillOpacity="0.55" />
        <path d="M0 200 q50 -14 100 0 t100 0 t100 0 t100 0 V300 H0z" fill="#ffffff" fillOpacity="0.12" />
        <path d="M0 235 q50 -14 100 0 t100 0 t100 0 t100 0 V300 H0z" fill="#06264b" fillOpacity="0.3" />
      </svg>
    </div>
  );
}

function Waves() {
  return (
    <div className="absolute inset-x-0 bottom-0 -z-10 h-28 overflow-hidden" aria-hidden>
      <svg className="wave-a absolute bottom-0 left-0 h-28 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={WAVE(150)} fill="rgba(255,255,255,0.08)" /></svg>
      <svg className="wave-b absolute bottom-0 left-0 h-20 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={WAVE(220)} fill="rgba(255,255,255,0.12)" /></svg>
      <svg className="absolute bottom-0 left-0 h-10 w-full" viewBox="0 0 1440 100" preserveAspectRatio="none"><path d="M0 60 q360 -50 720 0 t720 0 V100 H0z" fill="#ffffff" /></svg>
    </div>
  );
}

// Bölge kartı (liste ve "diğer bölgeler" için): harita olduğu gibi üstte, sade beyaz gövde.
export function RegionCard({ p, lang }: { p: Post; lang: Lang }) {
  const R = regionText(p.slug, lang);
  const map = regionMapFor("destination", p.slug);
  const U = REGION_UI[lang];
  return (
    <Link href={href(lang, `/destinasyonlar/${p.slug}`)} className="group flex h-full flex-col rounded-[1.75rem] bg-white p-2.5 ring-1 ring-navy/10 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10 hover:ring-turquoise/40">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[1.35rem] bg-navy">
        {map ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={map} alt={p.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
        ) : p.cover ? <Photo src={p.cover} alt={p.title} sizes="(min-width:1024px) 33vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" /> : <Sea label={p.title} />}
      </div>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
        {R && <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-turquoise-dark">{R.introEyebrow}</p>}
        <h3 className="font-display mt-1.5 text-xl font-semibold leading-snug text-navy">{p.title}</h3>
        {p.excerpt && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-navy/60">{p.excerpt}</p>}
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          {R && <span className="text-xs font-semibold text-navy/45">{U.stopsCount(R.stops.length)} · {U.exploreCount(R.explore.length)}</span>}
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mist text-navy transition group-hover:bg-turquoise group-hover:text-white" aria-hidden>→</span>
        </div>
      </div>
    </Link>
  );
}

// Destinasyon (bölge) sayfası.
// Fotoğraf sırası (panel galerisi): 1-3 → keşif kartları, kalanlar → galeri. Harita başlığın yanında, tıklayınca büyür.
export async function RegionPage({ p, R, photos, map, back, lang }: { p: Post; R: RegionText; photos: string[]; map: string | null; more?: Post[]; back?: { href: string; label: string }; lang: Lang }) {
  const U = REGION_UI[lang];
  const T = gt(lang);
  const cfg = REGION[p.slug];
  const [{ boats }, routes, contact, allDest] = await Promise.all([getBoats(lang), getPosts("route", undefined, lang), getContact(), getPosts("destination", undefined, lang)]);
  const fit = cfg ? boats.filter((b) => b.destinations.some((d) => cfg.ports.includes(d))).slice(0, 8) : [];
  const routeCards = cfg ? routes.map((r) => toCard(r, lang)).filter((c) => c.chart.some((s) => cfg.places.includes(s))).slice(0, 8) : [];
  const others = allDest.filter((d) => d.slug !== p.slug);
  const explorePhotos = photos.slice(0, R.explore.length);
  const gallery = photos.slice(R.explore.length);
  const wa = contact.whatsapp ? `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(U.waText(p.title))}` : href(lang, "/iletisim");
  const nav: string[][] = [[U.navStops, "duraklar"], [U.navExplore, "kesif"]];
  if (fit.length) nav.push([U.navBoats, "tekneler"]);
  if (routeCards.length) nav.push([U.navRoutes, "rotalar"]);
  if (gallery.length) nav.push([U.gallery, "galeri"]);
  const pills: [string, string][] = [
    [U.stopsCount(R.stops.length), "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"],
    [U.exploreCount(R.explore.length), "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM15.5 8.5l-2 5-5 2 2-5 5-2Z"],
  ];
  if (routeCards.length) pills.push([U.routesCount(routeCards.length), "M4 19c3-6 6 0 9-6s5-4 7-8"]);

  return (
    <>
      <Header lang={lang} />
      <main>
        {/* Başlık + harita */}
        <section className="relative isolate overflow-hidden pb-24 pt-28 text-white lg:pb-32 lg:pt-36" style={NAVY_BG}>
          <Waves />
          <div className={`${wrap} grid items-center gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-14`}>
            <div>
              <p className="text-sm text-white/60">
                {back && <><Link href={back.href} className="hover:text-white">← {back.label}</Link><span className="mx-2">/</span></>}
                <span className="font-semibold text-white/90">{p.title}</span>
              </p>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-turquoise">{R.introEyebrow}</p>
              <h1 className="font-display mt-3 text-4xl font-semibold leading-[1.05] lg:text-6xl">{R.introTitle}</h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/80">{R.introLead}</p>
              <ul className="mt-7 flex flex-wrap gap-2.5">
                {pills.map(([t, d]) => (
                  <li key={t} className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium ring-1 ring-white/15 backdrop-blur">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7fdce6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>{t}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#duraklar" className="rounded-full bg-turquoise px-7 py-3.5 text-sm font-semibold text-navy shadow-lg shadow-turquoise/30 transition hover:brightness-110">{R.introCta} ↓</a>
                <a href={wa} target={contact.whatsapp ? "_blank" : undefined} rel="noopener noreferrer" className="rounded-full px-7 py-3.5 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/10">{U.quote}</a>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-turquoise/20 blur-3xl" aria-hidden />
              {map ? (
                <MapZoom src={map} title={p.title} label={`Yatpaketi / ${T.destinations}`} alt={lang === "en" ? `${p.title} map` : `${p.title} haritası`} open={U.enlarge} close={U.close} />
              ) : (
                <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">{p.cover ? <Photo src={p.cover} alt={p.title} priority sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" /> : <Sea label={p.title} />}</div>
              )}
            </div>
          </div>
        </section>

        <SectionNav items={nav} />

        {/* Giriş metni */}
        <section className="py-14 lg:py-20">
          <div className={`${wrap} grid gap-6 lg:grid-cols-[1fr_1.6fr] lg:gap-20`}>
            <p className={eyebrow}>{p.title}</p>
            <p className="text-xl leading-relaxed text-navy/80 lg:text-2xl lg:leading-relaxed">{R.introText}</p>
          </div>
        </section>

        {/* Duraklar */}
        <section id="duraklar" className="scroll-mt-32 bg-mist py-16 lg:py-24">
          <div className={wrap}>
            <div className="max-w-3xl">
              <p className={eyebrow}>{R.stopsEyebrow}</p>
              <h2 className={h2}>{R.stopsTitle}</h2>
              <p className="mt-4 text-lg text-navy/65">{R.stopsLead}</p>
            </div>
            <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {R.stops.map(([name, tag, text], i) => (
                <li key={name} className="group relative overflow-hidden rounded-[1.75rem] bg-white p-6 ring-1 ring-navy/5 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-navy/10 hover:ring-turquoise/40 lg:p-7">
                  <span className="absolute -right-2 -top-5 font-display text-[6.5rem] font-semibold leading-none text-navy/[0.04] transition group-hover:text-turquoise/15" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
                  <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-turquoise/15 text-turquoise-dark transition duration-300 group-hover:bg-navy group-hover:text-turquoise"><Ic d={stopIcon(name, tag)} /></span>
                  <h3 className="font-display relative mt-5 text-xl font-semibold text-navy">{name}</h3>
                  <p className="relative mt-1 text-sm font-semibold text-turquoise-dark">{tag}</p>
                  <p className="relative mt-3 text-sm leading-relaxed text-navy/65">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Keşif */}
        <section id="kesif" className="scroll-mt-32 py-16 lg:py-24">
          <div className={wrap}>
            <div className="max-w-3xl">
              <p className={eyebrow}>{R.exploreEyebrow}</p>
              <h2 className={h2}>{R.exploreTitle}</h2>
              <p className="mt-4 text-lg text-navy/65">{R.exploreLead}</p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3 lg:gap-6">
              {R.explore.map(([name, tag, text], i) => (
                <article key={name} className="group relative flex min-h-[26rem] flex-col justify-end overflow-hidden rounded-[2rem] text-white shadow-xl shadow-navy/10">
                  {explorePhotos[i] ? <Photo src={explorePhotos[i]} alt={name} sizes="(min-width:768px) 33vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" /> : <Sea label={name} />}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/55 to-transparent" />
                  <div className="relative p-6 lg:p-7">
                    <span className="text-xs font-bold tracking-[0.25em] text-turquoise">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="font-display mt-2 text-2xl font-semibold lg:text-3xl">{name}</h3>
                    <p className="mt-1 text-sm font-semibold text-turquoise">{tag}</p>
                    <p className="mt-3 text-sm leading-relaxed text-white/80">{text}</p>
                  </div>
                </article>
              ))}
            </div>

            {/* İpucu */}
            <aside className="mt-10 flex flex-col gap-5 rounded-[2rem] bg-mist p-7 sm:flex-row lg:p-10">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-navy text-turquoise"><Ic d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3Z" size={26} /></span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-turquoise-dark">{R.noteEyebrow}</p>
                <h3 className="font-display mt-2 text-2xl font-semibold text-navy">{R.noteTitle}</h3>
                <p className="mt-3 max-w-4xl leading-relaxed text-navy/70">{R.noteText}</p>
              </div>
            </aside>
          </div>
        </section>

        {/* Tekneler */}
        {fit.length > 0 && (
          <section id="tekneler" className="scroll-mt-32 bg-mist py-16 lg:py-20">
            <div className={wrap}>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className={eyebrow}>{U.boatsEyebrow}</p>
                  <h2 className={h2}>{U.boatsTitle}</h2>
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

        {/* Rotalar */}
        {routeCards.length > 0 && (
          <section id="rotalar" className="scroll-mt-32 py-16 lg:py-20">
            <div className={wrap}>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className={eyebrow}>{U.routesEyebrow}</p>
                  <h2 className={h2}>{U.routesTitle}</h2>
                </div>
                <Link href={href(lang, "/rotalar")} className="text-sm font-semibold text-turquoise-dark">{U.allRoutes} →</Link>
              </div>
              <div className="mt-8">
                <Scroller className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 lg:mx-0 lg:gap-6 lg:px-0">
                  {routeCards.map((r) => <div key={r.slug} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[calc((100%-3rem)/3)]"><RouteCard r={r} lang={lang} /></div>)}
                </Scroller>
              </div>
            </div>
          </section>
        )}

        {/* Galeri */}
        {gallery.length > 0 && (
          <section id="galeri" className="scroll-mt-32 pb-16 lg:pb-20">
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

        {/* Çağrı */}
        <section className="pb-16 lg:pb-20">
          <div className={wrap}>
            <div className="relative isolate overflow-hidden rounded-[2rem] p-8 text-white lg:p-14" style={{ background: "linear-gradient(135deg, #06264b 0%, #0b4a6e 60%, #0d6a86 100%)" }}>
              <svg className="absolute -right-10 -top-10 -z-10 h-72 w-72 text-white/[0.06]" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 3v13l7-1L12 3ZM11 6v9H6l5-9ZM4 17h16l-2 3H6l-2-3Z" /></svg>
              <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-turquoise">{U.planEyebrow}</p>
                  <h2 className="font-display mt-3 text-3xl font-semibold lg:text-4xl">{U.planTitle}</h2>
                  <p className="mt-3 text-white/75">{U.planText}</p>
                </div>
                <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                  <a href={wa} target={contact.whatsapp ? "_blank" : undefined} rel="noopener noreferrer" className="rounded-full bg-turquoise px-7 py-3.5 text-center text-sm font-semibold text-navy transition hover:brightness-110">{U.quote}</a>
                  <Link href={href(lang, "/tekneler")} className="rounded-full px-7 py-3.5 text-center text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/10">{T.browse}</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Diğer bölgeler */}
        {others.length > 0 && (
          <section className="pb-20">
            <div className={wrap}>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="font-display text-3xl font-semibold text-navy lg:text-4xl">{T.moreDest}</h2>
                {back && <Link href={back.href} className="text-sm font-semibold text-turquoise-dark">{U.allRegions} →</Link>}
              </div>
              <div className="mt-8">
                <Scroller className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 lg:mx-0 lg:gap-6 lg:px-0">
                  {others.map((m) => <div key={m.slug} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[calc((100%-3rem)/3)]"><RegionCard p={m} lang={lang} /></div>)}
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

// Destinasyonlar listesi.
export function RegionsIndex({ posts, eyebrow: eb, title, intro, empty, lang }: { posts: Post[]; eyebrow: string; title: string; intro: string; empty: string; lang: Lang }) {
  const U = REGION_UI[lang];
  const stops = posts.reduce((n, p) => n + (regionText(p.slug, lang)?.stops.length ?? 0), 0);
  return (
    <>
      <Header lang={lang} />
      <main>
        <section className="relative isolate overflow-hidden pb-20 pt-28 text-white lg:pb-24 lg:pt-32" style={NAVY_BG}>
          <Waves />
          <div className={`${wrap} flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between`}>
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-turquoise">{eb}</p>
              <h1 className="font-display mt-3 text-4xl font-semibold leading-tight lg:text-5xl">{title}</h1>
              <p className="mt-4 text-white/75 lg:text-lg">{intro}</p>
            </div>
            {posts.length > 0 && (
              <ul className="flex shrink-0 gap-8 lg:pb-1">
                <li><span className="font-display block text-3xl font-semibold text-turquoise">{posts.length}</span><span className="text-sm text-white/65">{U.regions}</span></li>
                {stops > 0 && <li><span className="font-display block text-3xl font-semibold text-turquoise">{stops}</span><span className="text-sm text-white/65">{U.stopsLabel}</span></li>}
              </ul>
            )}
          </div>
        </section>
        <section className="pb-20 pt-6 lg:pt-10">
          <div className={wrap}>
            {posts.length === 0 ? (
              <p className="rounded-3xl bg-mist p-8 text-center text-navy/70">{empty}</p>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                {posts.map((p) => <RegionCard key={p.slug} p={p} lang={lang} />)}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  );
}
