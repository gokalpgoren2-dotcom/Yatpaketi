import { Photo } from "./Photo";
import Link from "next/link";
import { SearchBar } from "./SearchBar";
import type { Destination } from "@/lib/data";
import type { HomeContent } from "@/lib/content";
import { href, t, type Lang } from "@/lib/i18n";

const wave = (y: number) => `M0 ${y} q180 -60 360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 V400 H0 z`;
const delay = (s: number) => ({ animationDelay: `${s}s` });

export function Hero({ home, destinations, lang = "tr" }: { home: HomeContent; destinations: Destination[]; lang?: Lang }) {
  const L = t(lang);
  return (
    <section className="relative isolate flex min-h-[34rem] items-center justify-center overflow-hidden bg-navy pt-20 text-center lg:min-h-[40rem]">
      {home.heroImage ? (
        <>
          <div className="absolute inset-0 -z-20"><Photo src={home.heroImage} alt="" priority sizes="100vw" className="object-cover" /></div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy/55 via-navy/25 to-navy/70" />
        </>
      ) : (
        <>
          {/* Fotoğraf yüklenene kadar çizim. Panel > Site İçeriği'nden fotoğraf eklenir. */}
          <div className="absolute inset-0 -z-20" style={{ background: "linear-gradient(180deg, #06264b 0%, #0b4a7d 50%, #1bb4c4 100%)" }} />
          <div className="sun-pulse absolute -right-24 top-16 -z-10 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle,rgba(255,226,160,0.9)_0%,rgba(255,190,120,0.4)_35%,rgba(255,190,120,0)_68%)]" aria-hidden />
          <div className="absolute inset-x-0 bottom-0 -z-10 h-32 overflow-hidden" aria-hidden>
            <svg className="wave-a absolute bottom-0 left-0 h-32 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={wave(150)} fill="rgba(255,255,255,0.14)" /></svg>
            <svg className="wave-b absolute bottom-0 left-0 h-24 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={wave(220)} fill="rgba(255,255,255,0.2)" /></svg>
            <svg className="wave-c absolute bottom-0 left-0 h-16 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={wave(280)} fill="rgba(6,38,75,0.55)" /></svg>
          </div>
        </>
      )}

      <div className="mx-auto w-full max-w-4xl px-5 py-14 lg:py-20">
        <h1 className="fade-up font-display text-[2.4rem] font-medium leading-[1.1] text-white [text-shadow:0_2px_24px_rgba(6,38,75,0.45)] sm:text-5xl lg:text-6xl" style={delay(0)}>
          {home.title}
        </h1>
        <p className="fade-up mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/90 [text-shadow:0_1px_12px_rgba(6,38,75,0.5)] lg:text-lg" style={delay(0.12)}>
          {home.subtitle}
        </p>
        <div className="fade-up mt-9" style={delay(0.25)}>
          <SearchBar destinations={destinations} lang={lang} />
        </div>
        <p className="fade-up mt-6 text-sm text-white/90" style={delay(0.35)}>
          <span className="font-semibold">{L.popular}</span>{" "}
          {destinations.slice(0, 5).map((d, i) => (
            <span key={d.slug}>
              {i > 0 && <span aria-hidden> • </span>}
              <Link href={`${href(lang, "/tekneler")}?destinasyon=${d.slug}`} className="underline decoration-white/50 underline-offset-4 hover:decoration-white">{d.name}</Link>
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
