import { sceneFor } from "./PortScenes";

// Hazır çizim görselleri (public/limanlar). Adres parçalarından eşleşir; yoksa kodla çizilen sahneye düşer.
const IMAGES: [string[], string][] = [
  [["gocek"], "gocek"], [["fethiye", "oludeniz"], "fethiye"], [["bodrum", "gumusluk"], "bodrum"], [["kas", "kekova"], "kas"], [["marmaris", "icmeler", "turunc"], "marmaris"], [["selimiye"], "selimiye"], [["datca", "knidos"], "datca"],
  [["bozburun", "sogut", "ekincik", "dalyan", "gokova"], "koy"], [["istanbul"], "istanbul"], [["yunan"], "yunan-adalari"],
];
function imageFor(slug: string) {
  const t = (slug || "").toLowerCase().split("-");
  const hit = IMAGES.find(([keys]) => keys.some((k) => t.includes(k)));
  return hit ? `/limanlar/${hit[1]}.jpg` : null;
}

// Limanlar için çizim: gün batımı/gündüz gökyüzü, uzak dağlar, kayalık ve çam, sakin deniz, gulet ya da yelkenli.
// Her limanın adresinden (slug) sabit bir görünüm üretilir; aynı liman hep aynı çizimi alır.
function seed(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; };
}
const SKIES = [
  ["#8fd3e8", "#f4e6c8"], // gündüz
  ["#f7b980", "#fbe3b4"], // gün batımı
  ["#7fc4dc", "#e6f3ef"], // açık
  ["#9bb8e6", "#f6dcc4"], // alaca
];

export function PortArt({ slug, className = "" }: { slug: string; className?: string }) {
  const img = imageFor(slug);
  // eslint-disable-next-line @next/next/no-img-element
  if (img) return <img src={img} alt="" loading="lazy" className={`${className} object-cover`} />;
  const scene = sceneFor(slug);
  if (scene) return <svg className={className} viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">{scene}</svg>;
  const r = seed(slug || "x");
  const sky = SKIES[Math.floor(r() * SKIES.length)];
  const sunX = 120 + r() * 560, sunY = 90 + r() * 70, sunR = 34 + r() * 18;
  const id = `pa-${slug}`;
  const ridge = (base: number, amp: number, n: number) => {
    let d = `M0 ${base}`;
    for (let i = 1; i <= n; i++) d += ` Q ${(800 / n) * (i - 0.5)} ${base - amp * (0.4 + r())} ${(800 / n) * i} ${base - amp * 0.3 * r()}`;
    return d + " L800 400 L0 400Z";
  };
  const far = ridge(250, 80, 4), mid = ridge(272, 60, 5);
  const cliffSide = r() > 0.5 ? "L" : "R";
  const cx = cliffSide === "L" ? 0 : 800;
  const dir = cliffSide === "L" ? 1 : -1;
  const cliff = `M${cx} 400 L${cx} 175 Q ${cx + dir * 70} ${170 + r() * 25} ${cx + dir * (150 + r() * 60)} ${268} Q ${cx + dir * 250} ${310} ${cx + dir * 330} 400Z`;
  const trees = Array.from({ length: 5 }, (_, i) => ({ x: cx + dir * (24 + i * 34 + r() * 14), y: 200 + i * 14 + r() * 10, s: 0.8 + r() * 0.7 }));
  const boatX = 260 + r() * 300, boatKind = r() > 0.5 ? "gulet" : "sail";
  const isle = r() > 0.35 ? { x: 380 + r() * 240, w: 90 + r() * 80 } : null;
  return (
    <svg className={className} viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" role="img" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={sky[0]} /><stop offset="1" stopColor={sky[1]} /></linearGradient>
        <linearGradient id={`${id}-sea`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#35b6c7" /><stop offset="0.5" stopColor="#0f7fa6" /><stop offset="1" stopColor="#06264b" /></linearGradient>
        <radialGradient id={`${id}-sun`}><stop offset="0" stopColor="#fff7d6" /><stop offset="1" stopColor="#fff7d6" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="800" height="400" fill={`url(#${id}-sky)`} />
      <circle cx={sunX} cy={sunY} r={sunR * 3} fill={`url(#${id}-sun)`} opacity="0.7" />
      <circle cx={sunX} cy={sunY} r={sunR} fill="#fff4c9" />
      <path d={far} fill="#7aa9bf" opacity="0.55" />
      <path d={mid} fill="#4f8ea6" opacity="0.7" />
      {isle && <path d={`M${isle.x} 282 Q ${isle.x + isle.w * 0.3} 238 ${isle.x + isle.w * 0.55} 252 Q ${isle.x + isle.w * 0.8} 242 ${isle.x + isle.w} 282Z`} fill="#3f7a6e" />}
      <rect y="278" width="800" height="122" fill={`url(#${id}-sea)`} />
      <path d={`M${sunX - 60} 292 h120 M${sunX - 40} 304 h80 M${sunX - 25} 318 h50`} stroke="#fff4c9" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${40 + i * 160 + r() * 40} ${330 + (i % 3) * 18} q 20 -8 40 0 t 40 0`} fill="none" stroke="#fff" strokeWidth="2" opacity="0.28" strokeLinecap="round" />)}
      <g transform={`translate(${boatX} 296)`}>
        <ellipse cx="0" cy="22" rx="70" ry="5" fill="#06264b" opacity="0.25" />
        {boatKind === "sail" ? (
          <>
            <path d="M-4 -90 L-4 8 L-52 8Z" fill="#fff" /><path d="M2 -78 L2 8 L38 8Z" fill="#f3f7fa" />
            <path d="M-60 10 H48 L36 24 H-48Z" fill="#06264b" />
          </>
        ) : (
          <>
            <path d="M-62 6 H62 L46 24 H-50Z" fill="#8a5a33" /><path d="M-62 6 H62" stroke="#fff" strokeWidth="3" />
            <rect x="-30" y="-8" width="46" height="14" rx="3" fill="#fff" /><rect x="-22" y="-4" width="8" height="6" fill="#35b6c7" /><rect x="-8" y="-4" width="8" height="6" fill="#35b6c7" />
            <path d="M30 6 L30 -52 L62 6Z" fill="#fff" opacity="0.95" /><path d="M-48 6 L-48 -34 L-26 6Z" fill="#f3f7fa" />
          </>
        )}
      </g>
      <path d={cliff} fill="#b98a5b" /><path d={cliff} fill="#6e4c2f" opacity="0.25" transform="translate(0 6)" />
      {trees.map((t, i) => (
        <g key={i} transform={`translate(${t.x} ${t.y}) scale(${t.s})`}>
          <rect x="-2" y="20" width="4" height="14" fill="#5a3b22" />
          <path d="M0 -26 L16 6 H-16Z M0 -10 L20 22 H-20Z" fill="#2f6b4f" />
        </g>
      ))}
    </svg>
  );
}
