import type { ReactNode } from "react";

// Rehber yazıları için konuya göre çizilmiş kapaklar (fotoğraf yüklenene kadar). Sitenin turkuaz-lacivert çizgisinde, düz renkli.
const NAVY = "#06264B", TURQ = "#1BB4C4", SAND = "#f4e6c8", SUN = "#ffd36b", CORAL = "#e8453c";

const SKY: Record<string, [string, string]> = {
  day: ["#7fd0e6", "#e8f6f2"],
  warm: ["#f7b980", "#fde8bd"],
  dusk: ["#9bb8e6", "#f6dcc4"],
  night: ["#0a3d73", "#2a6aa5"],
};

function Gulet({ x = 0, y = 0, s = 1 }: { x?: number; y?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M250 330 H560 L525 378 H290 Z" fill="#8a5a34" />
      <path d="M250 330 H560 L553 342 H257 Z" fill="#fff" />
      <path d="M395 322 V120 L505 322 Z" fill="#fff" />
      <path d="M385 322 V170 L290 322 Z" fill="#f1f5f9" />
      <rect x="393" y="112" width="4" height="214" fill={NAVY} />
      <path d="M397 112 l30 10 l-30 10z" fill={CORAL} />
      <rect x="340" y="304" width="90" height="26" rx="4" fill={SAND} />
    </g>
  );
}
function Motor({ x = 0, y = 0, s = 1 }: { x?: number; y?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M230 340 H585 L545 388 H275 Z" fill="#fff" />
      <path d="M240 352 H575 L565 362 H250 Z" fill={NAVY} />
      <rect x="320" y="290" width="190" height="52" rx="6" fill="#fff" />
      <rect x="375" y="252" width="110" height="40" rx="6" fill="#f1f5f9" />
      {[335, 370, 405, 440, 475].map((px) => <rect key={px} x={px} y="302" width="22" height="16" rx="3" fill={TURQ} />)}
      <rect x="390" y="262" width="80" height="14" rx="3" fill={TURQ} />
      <rect x="426" y="226" width="3" height="28" fill={NAVY} />
    </g>
  );
}
function Sail({ x = 0, y = 0, s = 1 }: { x?: number; y?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M270 340 H540 L505 376 H305 Z" fill={NAVY} />
      <path d="M404 332 V110 L520 332 Z" fill="#fff" />
      <path d="M394 332 V150 L300 332 Z" fill={TURQ} />
      <rect x="402" y="106" width="4" height="230" fill={NAVY} />
    </g>
  );
}
function Cat({ x = 0, y = 0, s = 1 }: { x?: number; y?: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M250 352 H350 L338 376 H262 Z" fill="#fff" />
      <path d="M450 352 H550 L538 376 H462 Z" fill="#fff" />
      <rect x="290" y="322" width="220" height="30" rx="8" fill="#f1f5f9" />
      <rect x="340" y="296" width="120" height="30" rx="6" fill={TURQ} />
      <path d="M400 296 V130 L478 296 Z" fill="#fff" />
      <rect x="398" y="126" width="4" height="174" fill={NAVY} />
    </g>
  );
}

function Scene({ slug }: { slug: string }): { sky: keyof typeof SKY; el: ReactNode } {
  if (slug.includes("gulet")) return { sky: "day", el: <Gulet /> };
  if (slug.includes("motoryat") || slug.includes("butce")) return {
    sky: "day",
    el: <>
      <Motor x={-70} />
      <g transform="translate(640 150)">
        <circle r="62" fill={SUN} stroke="#e0a92e" strokeWidth="6" /><circle r="46" fill="none" stroke="#e0a92e" strokeWidth="3" />
        <text textAnchor="middle" y="22" fontSize="62" fontWeight="700" fill="#b9811a" fontFamily="Urbanist, system-ui, sans-serif">₺</text>
      </g>
    </>,
  };
  if (slug.includes("hangi-tekne")) return { sky: "day", el: <><Gulet x={-70} y={125} s={0.55} /><Motor x={176} y={122} s={0.55} /><Cat x={430} y={126} s={0.55} /></> };
  if (slug.includes("bavul")) return {
    sky: "warm",
    el: <>
      <g transform="translate(0 40)">
        <path d="M350 190 V170 a14 14 0 0 1 14-14 h72 a14 14 0 0 1 14 14 v20" fill="none" stroke={NAVY} strokeWidth="12" strokeLinecap="round" />
        <rect x="270" y="190" width="260" height="190" rx="22" fill={TURQ} />
        <rect x="270" y="190" width="260" height="190" rx="22" fill="none" stroke={NAVY} strokeWidth="6" />
        <rect x="335" y="190" width="22" height="190" fill={NAVY} opacity="0.25" /><rect x="443" y="190" width="22" height="190" fill={NAVY} opacity="0.25" />
        <rect x="378" y="268" width="44" height="30" rx="6" fill={SAND} stroke={NAVY} strokeWidth="4" />
      </g>
      <g transform="translate(620 250)"><ellipse cx="0" cy="40" rx="86" ry="18" fill={SAND} stroke="#c9ae7a" strokeWidth="4" /><path d="M-48 36 q0-62 48-62 q48 0 48 62z" fill={SAND} stroke="#c9ae7a" strokeWidth="4" /><rect x="-48" y="14" width="96" height="14" fill={CORAL} /></g>
      <g transform="translate(150 280)" fill="none" stroke={NAVY} strokeWidth="7"><circle cx="0" cy="0" r="28" fill={NAVY} opacity="0.85" /><circle cx="86" cy="0" r="28" fill={NAVY} opacity="0.85" /><path d="M28 -4 q15 -14 30 0" /></g>
    </>,
  };
  if (slug.includes("tempo")) return {
    sky: "warm",
    el: <>
      <circle cx="400" cy="318" r="120" fill={SUN} opacity="0.95" />
      <circle cx="400" cy="318" r="160" fill="none" stroke={SUN} strokeWidth="4" opacity="0.5" />
      <circle cx="400" cy="318" r="205" fill="none" stroke={SUN} strokeWidth="3" opacity="0.3" />
      <Sail x={200} y={150} s={0.5} />
    </>,
  };
  if (slug.includes("arkadas")) return {
    sky: "day",
    el: <>
      <Motor x={0} y={30} />
      {[[330, "#ffd36b"], [385, CORAL], [440, "#fff"], [495, NAVY]].map(([cx, c], i) => (
        <g key={i} transform={`translate(${cx} ${i % 2 ? 268 : 258})`}>
          <circle r="20" fill={c as string} stroke={NAVY} strokeWidth="4" />
          <path d="M-22 56 q0 -34 22 -34 q22 0 22 34z" fill={c as string} stroke={NAVY} strokeWidth="4" />
        </g>
      ))}
    </>,
  };
  if (slug.includes("yemek")) return {
    sky: "warm",
    el: <g transform="translate(0 -10)">
      <circle cx="400" cy="250" r="140" fill="#fff" stroke="#d6e3ea" strokeWidth="8" /><circle cx="400" cy="250" r="104" fill="none" stroke="#e5eef3" strokeWidth="4" />
      <path d="M320 250 q60 -64 130 -20 l50 -22 v84 l-50 -22 q-70 44 -130 -20z" fill={TURQ} />
      <circle cx="342" cy="244" r="6" fill="#fff" /><path d="M392 214 q10 36 0 72" fill="none" stroke={NAVY} strokeWidth="4" opacity="0.35" />
      <g transform="translate(180 120)"><rect x="-4" y="0" width="8" height="260" rx="4" fill={NAVY} /><path d="M-22 0 v70 M-8 0 v70 M8 0 v70 M22 0 v70" stroke={NAVY} strokeWidth="5" strokeLinecap="round" /></g>
      <g transform="translate(620 120)"><rect x="-4" y="60" width="8" height="200" rx="4" fill={NAVY} /><path d="M-4 0 q26 10 22 90 h-22z" fill={NAVY} /></g>
      <circle cx="505" cy="345" r="34" fill={SUN} /><circle cx="505" cy="345" r="22" fill="#ffe9a1" />
    </g>,
  };
  if (slug.includes("fotograf")) return {
    sky: "dusk",
    el: <g transform="translate(0 -6)">
      <path d="M340 150 l24 -34 h72 l24 34z" fill={NAVY} />
      <rect x="230" y="150" width="340" height="230" rx="30" fill={NAVY} />
      <rect x="230" y="150" width="340" height="60" rx="30" fill="#0f4a85" />
      <circle cx="400" cy="270" r="84" fill="#fff" /><circle cx="400" cy="270" r="66" fill={TURQ} /><circle cx="400" cy="270" r="40" fill={NAVY} /><circle cx="384" cy="254" r="12" fill="#fff" opacity="0.7" />
      <circle cx="520" cy="182" r="12" fill={SUN} /><rect x="262" y="172" width="44" height="14" rx="5" fill="#fff" opacity="0.8" />
      <path d="M640 140 l10 24 l24 10 l-24 10 l-10 24 l-10 -24 l-24 -10 l24 -10z" fill={SUN} /><path d="M150 330 l7 16 l16 7 l-16 7 l-7 16 l-7 -16 l-16 -7 l16 -7z" fill="#fff" opacity="0.9" />
    </g>,
  };
  if (slug.includes("gunubirlik")) return {
    sky: "dusk",
    el: <>
      <circle cx="250" cy="200" r="74" fill={SUN} />
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x="246" y="92" width="8" height="22" rx="4" fill={SUN} transform={`rotate(${i * 36} 250 200)`} />)}
      <circle cx="550" cy="200" r="74" fill="#eef3fa" /><circle cx="584" cy="178" r="64" fill="#2a6aa5" />
      <circle cx="610" cy="110" r="4" fill="#fff" /><circle cx="680" cy="160" r="3" fill="#fff" /><circle cx="470" cy="120" r="3" fill="#fff" />
      <Sail x={200} y={150} s={0.5} />
    </>,
  };
  if (slug.includes("muzik") || slug.includes("yuz")) return {
    sky: "day",
    el: <>
      <g fill={NAVY}>
        <ellipse cx="260" cy="320" rx="26" ry="19" transform="rotate(-20 260 320)" /><rect x="279" y="170" width="9" height="150" /><path d="M279 170 q50 -6 70 40 v-30 q-20 -42 -70 -30z" />
        <ellipse cx="400" cy="290" rx="26" ry="19" transform="rotate(-20 400 290)" /><rect x="419" y="150" width="9" height="140" /><path d="M419 150 q50 -6 70 40 v-30 q-20 -42 -70 -30z" />
      </g>
      <g transform="translate(580 300)">
        <circle cx="0" cy="0" r="20" fill={SAND} stroke={NAVY} strokeWidth="4" /><path d="M-16 28 q50 -28 100 -4" fill="none" stroke={NAVY} strokeWidth="14" strokeLinecap="round" />
        <path d="M-90 40 q22 -22 44 0 t44 0 t44 0 t44 0" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
      </g>
    </>,
  };
  return { sky: "day", el: <Gulet /> };
}

export function GuideArt({ slug, className = "" }: { slug: string; className?: string }) {
  const { sky, el } = Scene({ slug });
  const [a, b] = SKY[sky];
  const id = `ga-${slug}`;
  return (
    <svg className={className} viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient>
        <linearGradient id={`${id}-s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1cb4c4" /><stop offset="1" stopColor="#0b6a86" /></linearGradient>
      </defs>
      <rect width="800" height="500" fill={`url(#${id})`} />
      <rect y="334" width="800" height="166" fill={`url(#${id}-s)`} />
      {el}
      <path d="M0 392 q50 -22 100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 V500 H0z" fill="rgba(255,255,255,0.16)" />
      <path d="M0 436 q50 -20 100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 t100 0 V500 H0z" fill="rgba(6,38,75,0.3)" />
    </svg>
  );
}

export const hasGuideArt = (kind: string, slug: string) => kind === "guide" && /gulet|motoryat|butce|hangi-tekne|bavul|tempo|arkadas|yemek|fotograf|gunubirlik|muzik|yuz/.test(slug);
