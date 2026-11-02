import { Scroller } from "./Scroller";
import { Photo } from "./Photo";
import { ContactBubble } from "./ContactBubble";
import Link from "next/link";
import { Logo } from "./Logo";
import { BoatCard } from "./BoatCard";
import { BoatIcon } from "./BoatIcon";
import { Placeholder } from "./Placeholder";
import { PortArt } from "./PortArt";
import { type Boat, type Destination } from "@/lib/data";
import type { Category } from "@/lib/content";
import { getContact } from "@/lib/content";
import { formatPhone } from "@/lib/phone";
import { getNavInfo, type Post } from "@/lib/posts";
import { gt } from "@/lib/guide-text";
import { PostCard, postHref } from "./PostCard";
import { href, t, type Lang } from "@/lib/i18n";

function Heading({ eyebrow, title, id, action, dark = false }: { eyebrow: string; title: string; id?: string; action?: { href: string; label: string }; dark?: boolean }) {
  return (
    <div id={id} className="mb-8 flex scroll-mt-24 flex-wrap items-end justify-between gap-4 lg:mb-12">
      <div className="max-w-2xl">
        <p className={`text-xs font-semibold uppercase tracking-[0.28em] ${dark ? "text-turquoise" : "text-turquoise-dark"}`}>{eyebrow}</p>
        <h2 className={`font-display mt-3 text-3xl font-semibold leading-tight lg:text-5xl ${dark ? "text-white" : "text-navy"}`}>{title}</h2>
      </div>
      {action && (
        <Link href={action.href} className={`group flex items-center gap-3 rounded-full py-2 pl-5 pr-2 text-sm font-semibold ring-1 transition ${dark ? "text-white ring-white/25 hover:bg-white/10" : "text-navy ring-navy/15 hover:ring-turquoise"}`}>
          {action.label}
          <span className={`flex h-8 w-8 items-center justify-center rounded-full transition group-hover:translate-x-0.5 ${dark ? "bg-turquoise text-navy" : "bg-navy text-white group-hover:bg-turquoise"}`} aria-hidden>→</span>
        </Link>
      )}
    </div>
  );
}

const SEC_WAVE = (y: number) => `M0 ${y} q180 -60 360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 V400 H0 z`;
function Ic({ d, size = 22 }: { d: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>;
}

const wrap = "mx-auto max-w-7xl px-5 lg:px-8";

export function Categories({ items, lang = "tr" }: { items: Category[]; lang?: Lang }) {
  const L = t(lang);
  return (
    <section className="pb-4 pt-14 lg:pt-20">
      <div className={wrap}>
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-turquoise-dark">{L.byType}</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex lg:flex-wrap">
          {items.map((c) => (
            <Link
              key={c.slug}
              href={href(lang, `/tekne-tipleri/${c.slug}`)}
              className="group flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-navy ring-1 ring-navy/10 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-navy/10 hover:ring-turquoise lg:pr-7"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-turquoise/10 text-turquoise-dark transition group-hover:bg-turquoise group-hover:text-white"><BoatIcon name={c.slug} /></span>
              <span className="min-w-0 truncate">{c.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedBoats({ items, sample, cats = [], lang = "tr" }: { items: Boat[]; sample: boolean; cats?: Category[]; lang?: Lang }) {
  const L = t(lang);
  return (
    <section className="py-14 lg:py-24">
      <div className={wrap}>
        <Heading id="tekneler" eyebrow={L.featuredEyebrow} title={L.featuredTitle} action={{ href: href(lang, "/tekneler"), label: L.allBoatsBtn }} />
        {cats.length > 0 && (
          <div className="no-scrollbar -mx-5 -mt-2 mb-8 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:-mt-4 lg:flex-wrap lg:px-0">
            {cats.map((c) => (
              <Link key={c.slug} href={href(lang, `/tekne-tipleri/${c.slug}`)} className="group flex shrink-0 items-center gap-2.5 rounded-full bg-mist py-1.5 pl-1.5 pr-4 text-sm font-semibold text-navy transition hover:bg-navy hover:text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-turquoise-dark transition group-hover:bg-turquoise group-hover:text-white"><BoatIcon name={c.slug} /></span>
                {c.name}
              </Link>
            ))}
          </div>
        )}
        {sample && <p className="-mt-4 mb-6 text-sm text-navy/50">{L.sampleHome}</p>}
        {items.length === 0 ? (
          <p className="rounded-3xl bg-mist p-8 text-center text-navy/70">{L.noBoatsHome}</p>
        ) : (
          <Scroller className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 lg:mx-0 lg:gap-6 lg:px-0">
            {items.map((b) => (
              <div key={b.slug} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[calc((100%-3rem)/3)]">
                <BoatCard b={b} lang={lang} />
              </div>
            ))}
          </Scroller>
        )}
      </div>
    </section>
  );
}

const STEP_IC = ["M4 5h16v11H8l-4 4V5ZM8 9h8M8 12h5", "M4 6h16v14H4zM8 3v4M16 3v4M4 10h16M9 15l2 2 4-4", "M12 3v13l7-1L12 3ZM11 6v9H6l5-9ZM3 19c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0"];
export function HowItWorks({ lang = "tr" }: { lang?: Lang }) {
  const L = t(lang);
  const steps = L.steps;
  return (
    <section className="py-14 lg:py-20">
      <div className={wrap}>
        <div className="relative isolate overflow-hidden rounded-[2.5rem] px-6 py-12 sm:px-10 lg:px-14 lg:py-20" style={{ background: "linear-gradient(150deg, #05204a 0%, #0a3f63 55%, #0b6a86 100%)" }}>
          <div className="absolute inset-x-0 bottom-0 -z-10 h-24 overflow-hidden opacity-70" aria-hidden>
            <svg className="wave-a absolute bottom-0 left-0 h-24 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={SEC_WAVE(160)} fill="rgba(127,220,230,0.14)" /></svg>
          </div>
          <Heading dark eyebrow={L.howEyebrow} title={L.howTitle} action={{ href: href(lang, "/kiralama-sureci"), label: lang === "en" ? "Charter process" : "Kiralama süreci" }} />
          <ol className="relative grid gap-5 md:grid-cols-3 lg:gap-6">
            <span className="absolute left-8 right-8 top-[2.6rem] hidden h-0.5 bg-[repeating-linear-gradient(90deg,rgba(127,220,230,0.45)_0_10px,transparent_10px_20px)] md:block" aria-hidden />
            {steps.map(([n, title, d], i) => (
              <li key={n} className="relative rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/10 backdrop-blur transition hover:bg-white/[0.1] lg:p-7">
                <div className="flex items-center justify-between">
                  <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-turquoise text-navy shadow-lg shadow-turquoise/25"><Ic d={STEP_IC[i % 3]} size={24} /></span>
                  <span className="font-display text-5xl font-semibold text-white/10">{n}</span>
                </div>
                <h3 className="font-display mt-6 text-xl font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export function Destinations({ items, lang = "tr" }: { items: Destination[]; lang?: Lang }) {
  const L = t(lang);
  return (
    <section className="bg-mist py-14 lg:py-24">
      <div className={wrap}>
        <Heading id="limanlar" eyebrow={L.destEyebrow} title={L.destTitle} action={{ href: href(lang, "/limanlar"), label: L.seeAll }} />
        <Scroller center className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 lg:mx-0 lg:gap-6 lg:px-0">
          {items.map((d, i) => (
            <Link
              key={d.slug}
              href={href(lang, `/limanlar/${d.slug}`)}
              className="group relative aspect-[4/5] w-[76%] shrink-0 snap-start overflow-hidden rounded-[1.75rem] shadow-lg shadow-navy/10 sm:w-[42%] lg:w-[23.5%]"
            >
              <PortArt slug={d.slug} className="absolute inset-0 h-full w-full transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/10 to-transparent" />
              <span className="absolute left-4 top-4 rounded-full bg-white/90 px-2.5 py-1 font-display text-xs font-semibold text-navy shadow backdrop-blur">{String(i + 1).padStart(2, "0")}</span>
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-turquoise">{L.country}</p>
                <h3 className="font-display mt-1 text-3xl font-semibold">{d.name}</h3>
                <div className="mt-1 flex items-end justify-between gap-3">
                  <p className="line-clamp-2 text-sm text-white/80">{d.blurb}</p>
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur transition group-hover:bg-turquoise group-hover:text-navy group-hover:ring-turquoise" aria-hidden>→</span>
                </div>
              </div>
            </Link>
          ))}
        </Scroller>
      </div>
    </section>
  );
}

export function RentalModes({ lang = "tr" }: { lang?: Lang }) {
  const L = t(lang);
  const modes = [
    { title: L.modes[0][0], text: L.modes[0][1], hue: 178, href: "/tekneler?kiralama=gunluk" },
    { title: L.modes[1][0], text: L.modes[1][1], hue: 200, href: "/tekneler?kiralama=haftalik" },
    { title: L.modes[2][0], text: L.modes[2][1], hue: 225, href: "/tekneler?tip=L%C3%BCks%20Yat" },
  ];
  return (
    <section className="py-14 lg:py-20">
      <div className={wrap}>
        <Heading eyebrow={L.modesEyebrow} title={L.modesTitle} />
        <div className="grid gap-4 md:grid-cols-3 lg:gap-6">
          {modes.map((m) => (
            <Link key={m.title} href={href(lang, m.href)} className="group relative flex min-h-[15rem] items-end overflow-hidden rounded-3xl p-6 text-white lg:min-h-[19rem] lg:p-8">
              <Placeholder hue={m.hue} className="absolute inset-0 transition duration-500 group-hover:scale-105" label={false} />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/65 to-navy/25" />
              <div className="relative [text-shadow:0_1px_8px_rgb(0_0_0/0.35)]">
                <h3 className="font-display text-2xl">{m.title}</h3>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/85">{m.text}</p>
                <span className="mt-4 inline-block rounded-full bg-white px-4 py-2 text-xs font-semibold text-navy">{L.seeBoats}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Routes({ lang = "tr" }: { lang?: Lang }) {
  const L = t(lang);
  return (
    <section className="py-14 lg:py-20">
      <div className={wrap}>
        <div className="rounded-[2rem] bg-navy p-6 text-white sm:p-10 lg:p-14">
          <div id="mavi-yolculuk" className="mb-8 scroll-mt-24 max-w-2xl lg:mb-10">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-turquoise">{L.routesEyebrow}</p>
            <h2 className="font-display text-3xl font-medium lg:text-4xl">{L.routesTitle}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3 lg:gap-6">
            {L.routes.map(([name, days, stops]) => (
              <div key={name} className="rounded-2xl bg-white/[0.07] p-6 ring-1 ring-white/10">
                <p className="inline-block rounded-full bg-turquoise px-3 py-1 text-xs font-semibold">{days}</p>
                <h3 className="font-display mt-4 text-2xl">{name}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{stops}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const WHY_IC = [
  "M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4ZM9 12l2 2 4-4",
  "M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20Z",
  "M12 19a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM12 2v3M12 19v3M2 12h3M19 12h3",
  "M12 20s-8-4.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6.5-8 11-8 11Z",
];
export function WhyUs({ lang = "tr" }: { lang?: Lang }) {
  const L = t(lang);
  const items = L.why;
  return (
    <section className="py-14 lg:py-24" id="hakkimizda">
      <div className={wrap}>
        <Heading eyebrow={L.whyEyebrow} title={L.whyTitle} action={{ href: href(lang, "/hakkimizda"), label: lang === "en" ? "About us" : "Hakkımızda" }} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {items.map(([title, d], i) => (
            <div key={title} className="group relative overflow-hidden rounded-[1.75rem] bg-white p-6 ring-1 ring-navy/10 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-navy/10 hover:ring-turquoise/40 lg:p-7">
              <span className="absolute -right-2 -top-5 font-display text-[6.5rem] font-semibold leading-none text-navy/[0.04] transition group-hover:text-turquoise/15" aria-hidden>{i + 1}</span>
              <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-turquoise/15 text-turquoise-dark transition duration-300 group-hover:bg-navy group-hover:text-turquoise"><Ic d={WHY_IC[i % WHY_IC.length]} /></span>
              <h3 className="font-display relative mt-5 text-lg font-semibold text-navy">{title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-navy/65">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Blog({ items, lang = "tr" }: { items: Post[]; lang?: Lang }) {
  const L = t(lang);
  if (lang === "en") return null;
  if (items.length === 0) return null;
  return (
    <section className="py-14 lg:py-24" id="blog">
      <div className={wrap}>
        <Heading eyebrow={L.blogEyebrow} title={L.blogTitle} action={{ href: "/rehber", label: L.allPosts }} />
        <Scroller className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 lg:mx-0 lg:gap-6 lg:px-0">
          {items.map((p, i) => (
            <div key={p.slug} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[calc((100%-3rem)/3)]">
              <PostCard p={p} i={i} />
            </div>
          ))}
        </Scroller>
      </div>
    </section>
  );
}

const FOOT_WAVE = (y: number) => `M0 ${y} q180 -60 360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 V400 H0 z`;

export async function Footer({ lang = "tr" }: { lang?: Lang } = {}) {
  const L = t(lang);
  const [c, nav] = await Promise.all([getContact(), getNavInfo(lang)]);
  const hasGuide = nav.hasGuides || nav.hasDestinations || nav.hasRoutes || nav.hasPackages || nav.hasProcess;
  const explore = [
    { href: href(lang, "/tekneler"), label: L.navBoats },
    { href: href(lang, "/limanlar"), label: L.navDest },
    { href: href(lang, "/hizmetlerimiz"), label: L.navServices },
    ...(hasGuide ? [{ href: href(lang, "/rehber"), label: L.navGuide }] : []),
  ];
  const company = [
    { href: href(lang, "/hakkimizda"), label: L.navAbout },
    { href: href(lang, "/iletisim"), label: L.navContact },
    { href: "/musteri", label: L.customerLogin },
  ];
  return (
    <footer id="iletisim" className="relative isolate scroll-mt-20 overflow-hidden pb-24 pt-14 text-sm text-white/80" style={{ background: "linear-gradient(180deg, #05224a 0%, #0a3d73 45%, #0d5f94 78%, #1d8fb0 100%)" }}>
      <div className="absolute inset-x-0 bottom-0 -z-10 h-2/3 bg-[radial-gradient(ellipse_at_50%_100%,rgba(127,220,230,0.28)_0%,rgba(127,220,230,0)_70%)]" aria-hidden />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-32 overflow-hidden" aria-hidden>
        <svg className="wave-a absolute bottom-0 left-0 h-32 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={FOOT_WAVE(150)} fill="rgba(255,255,255,0.14)" /></svg>
        <svg className="wave-b absolute bottom-0 left-0 h-24 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={FOOT_WAVE(220)} fill="rgba(255,255,255,0.2)" /></svg>
        <svg className="wave-c absolute bottom-0 left-0 h-16 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={FOOT_WAVE(280)} fill="rgba(6,38,75,0.55)" /></svg>
      </div>
      <ContactBubble whatsapp={c.whatsapp} phone={c.phone} phoneLabel={formatPhone(c.phone)} email={c.email} />
      <div className={`${wrap} flex flex-col justify-between gap-6 md:flex-row`}>
        <div>
          <div className="inline-block rounded-xl bg-white px-4 py-2"><Logo height={32} /></div>
          <p className="mt-2 max-w-xs">{L.footTag}</p>
          <p className="mt-3">Fethiye, Muğla</p>
          {(c.phone || c.email) && (
            <p className="mt-3 flex flex-col gap-1">
              {c.phone && <a href={`tel:+${c.phone}`} className="hover:text-white">{formatPhone(c.phone)}</a>}
              {c.email && <a href={`mailto:${c.email}`} className="break-all hover:text-white">{c.email}</a>}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-x-12 gap-y-2 md:gap-x-16">
          {[explore, company].map((col, k) => (
            <ul key={k} className="flex flex-col gap-2.5">
              {col.map((l) => <li key={l.href}><Link href={l.href} className="hover:text-white">{l.label}</Link></li>)}
            </ul>
          ))}
        </div>
      </div>
      <p className={`${wrap} mt-8 border-t border-white/15 pt-6`}>© {new Date().getFullYear()} yatpaketi. {L.rights}</p>
    </footer>
  );
}
