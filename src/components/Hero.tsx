import { Photo } from "./Photo";
import Link from "next/link";
import { SearchBar } from "./SearchBar";
import { HeroMap } from "./HeroMap";
import type { Destination } from "@/lib/data";
import type { HomeContent, Category } from "@/lib/content";
import { href, t, type Lang } from "@/lib/i18n";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const wave = (y: number) => `M0 ${y} q180 -60 360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 V400 H0 z`;
const delay = (s: number) => ({ animationDelay: `${s}s` });

export function Hero({ home, destinations, categories = [], lang = "tr" }: { home: HomeContent; destinations: Destination[]; categories?: Category[]; lang?: Lang }) {
  const L = t(lang);
  return (
    <section className={`relative isolate flex items-center justify-center overflow-hidden bg-navy pt-20 text-center ${home.heroImage ? "min-h-[34rem] lg:min-h-[40rem]" : "min-h-[34rem] lg:min-h-[42rem]"}`}>
      {home.heroImage ? (
        <>
          <div className="absolute inset-0 -z-20"><Photo src={home.heroImage} alt="" priority sizes="100vw" className="object-cover" /></div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy/55 via-navy/25 to-navy/70" />
        </>
      ) : (
        <>
          {/* Fotoğraf yüklenene kadar kıyı haritası. Panel > Site İçeriği'nden fotoğraf eklenir. */}
          <div className="absolute inset-0 -z-20" style={{ background: "linear-gradient(180deg, #0a5a9c 0%, #1189c4 55%, #22b0cc 100%)" }} />
          <HeroMap destinations={destinations} lang={lang} />
        </>
      )}

      <div className={`pointer-events-none mx-auto w-full px-5 pt-14 lg:pt-16 ${home.heroImage ? "max-w-4xl pb-14 lg:pb-20" : "max-w-4xl pb-72 lg:max-w-7xl lg:px-10 lg:pb-16"}`}>
       <div className={home.heroImage ? "" : "lg:max-w-[34rem] lg:text-left"}>
        <h1 className="fade-up font-[family-name:var(--font-urbanist),var(--font-inter),sans-serif] text-[2.4rem] font-bold leading-[1.08] tracking-tight text-white [text-shadow:0_2px_24px_rgba(6,38,75,0.45)] sm:text-5xl lg:text-[3.3rem]" style={delay(0)}>
          {home.title}
        </h1>
        <p className={`fade-up mt-5 max-w-xl text-base leading-relaxed text-white/90 [text-shadow:0_1px_12px_rgba(6,38,75,0.5)] lg:text-lg ${home.heroImage ? "mx-auto" : "mx-auto lg:mx-0"}`} style={delay(0.12)}>
          {home.subtitle}
        </p>
        <div className="fade-up pointer-events-auto mt-9" style={delay(0.25)}>
          <SearchBar destinations={destinations} categories={categories} lang={lang} />
        </div>
        <p className="fade-up pointer-events-auto mt-6 text-sm text-white/90" style={delay(0.35)}>
          <span className="font-semibold">{L.popular}</span>{" "}
          {destinations.slice(0, 5).map((d, i) => (
            <span key={d.slug}>
              {i > 0 && <span aria-hidden> • </span>}
              <Link href={`${href(lang, "/tekneler")}?destinasyon=${d.slug}`} className="underline decoration-white/50 underline-offset-4 hover:decoration-white">{d.name}</Link>
            </span>
          ))}
        </p>
       </div>
      </div>
    </section>
  );
}
