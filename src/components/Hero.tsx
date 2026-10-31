import { SearchBar } from "./SearchBar";

const wave = (y: number) =>
  `M0 ${y} q180 -60 360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 V400 H0 z`;

const delay = (s: number) => ({ animationDelay: `${s}s` });

export function Hero() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy">
        {/* Çizim: gerçek hero fotoğrafı/videosu admin panelinden yüklenecek. */}
        <div
          className="absolute inset-0 -z-10"
          style={{ background: "linear-gradient(180deg, #06264b 0%, #0b4a7d 45%, #1bb4c4 100%)" }}
        />
        <div className="sun-pulse absolute -right-24 top-10 -z-10 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle,rgba(255,226,160,0.95)_0%,rgba(255,190,120,0.45)_35%,rgba(255,190,120,0)_68%)] lg:right-[8%] lg:top-4" aria-hidden />

        <svg className="boat-bob absolute bottom-[4.5rem] right-6 -z-10 h-28 w-28 lg:bottom-24 lg:right-[16%] lg:h-44 lg:w-44" viewBox="0 0 120 120" aria-hidden>
          <path d="M58 12v70H20z" fill="rgba(255,255,255,0.95)" />
          <path d="M64 24v58h34z" fill="rgba(255,255,255,0.8)" />
          <path d="M12 88h96l-14 16H28z" fill="#06264b" />
          <path d="M12 88h96" stroke="#1bb4c4" strokeWidth="3" />
        </svg>

        <div className="absolute inset-x-0 bottom-0 -z-10 h-40 overflow-hidden" aria-hidden>
          <svg className="wave-a absolute bottom-0 left-0 h-40 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={wave(150)} fill="rgba(255,255,255,0.16)" /></svg>
          <svg className="wave-b absolute bottom-0 left-0 h-32 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={wave(200)} fill="rgba(255,255,255,0.22)" /></svg>
          <svg className="wave-c absolute bottom-0 left-0 h-24 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={wave(250)} fill="#ffffff" /></svg>
        </div>

        <div className="mx-auto max-w-7xl px-5 pb-40 pt-28 lg:px-8 lg:pb-52 lg:pt-44">
          <p className="fade-up mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur" style={delay(0)}>
            <span className="h-2 w-2 rounded-full bg-turquoise" /> Yat ve Tekne Kiralama
          </p>
          <h1 className="fade-up font-display max-w-3xl text-[2.6rem] font-medium leading-[1.05] text-white sm:text-6xl lg:text-7xl" style={delay(0.1)}>
            Mavi yolculuğunuzu <span className="text-[#ffd98a]">birkaç dokunuşta</span> planlayın.
          </h1>
          <p className="fade-up mt-6 max-w-xl text-base leading-relaxed text-white/85 lg:text-lg" style={delay(0.25)}>
            Gulet, motoryat, katamaran ve yelkenli seçeneklerini karşılaştırın, tarihinizi ve kişi sayınızı girip rezervasyon talebinizi iletin.
          </p>
        </div>
      </section>

      <div className="fade-up relative z-10 mx-auto -mt-28 max-w-7xl px-5 lg:-mt-36 lg:px-8" style={delay(0.4)}>
        <SearchBar />
        <ul className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-navy/70">
          <li className="flex items-center gap-2"><Dot /> Rezervasyon talebi ücretsiz</li>
          <li className="flex items-center gap-2"><Dot /> Kaptanlı ve kaptansız seçenekler</li>
          <li className="flex items-center gap-2"><Dot /> Kesin rezervasyon, onay sonrası</li>
        </ul>
      </div>
    </>
  );
}

function Dot() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
      <circle cx="8" cy="8" r="8" fill="#1bb4c4" />
      <path d="M4.5 8.2l2.3 2.3 4.7-4.8" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
