import Link from "next/link";
import type { Destination } from "@/lib/data";
import { href, type Lang } from "@/lib/i18n";

// Bodrum – Antalya kıyısının sadeleştirilmiş, çizgi film tarzı haritası. Ölçekli değildir; kıyı şekli gerçeğe benzer.
type Pt = [number, number]; // [boylam, enlem]

const COAST: Pt[] = [
  [27.75, 39.2], [27.55, 38.6], [27.35, 38.2], [27.27, 37.9], [27.12, 37.78], [27.15, 37.7], [27.25, 37.55], [27.2, 37.42], [27.3, 37.33], [27.45, 37.34], [27.6, 37.28], [27.65, 37.2],
  [27.55, 37.13], [27.42, 37.12], [27.3, 37.1], [27.22, 37.05], [27.25, 36.99], [27.33, 36.99], [27.43, 37.02],
  [27.52, 37.03], [27.65, 37.04], [27.8, 37.02], [27.95, 37.03], [28.1, 37.06], [28.3, 37.06], [28.25, 36.97],
  [28.1, 36.9], [27.9, 36.85], [27.7, 36.8], [27.5, 36.76], [27.37, 36.7], [27.45, 36.66], [27.65, 36.71],
  [27.85, 36.72], [27.98, 36.72], [27.95, 36.58], [28.03, 36.5], [28.12, 36.58], [28.2, 36.68], [28.22, 36.75],
  [28.25, 36.82], [28.28, 36.85], [28.38, 36.8], [28.45, 36.72], [28.5, 36.78], [28.55, 36.83], [28.65, 36.78],
  [28.75, 36.7], [28.85, 36.7], [28.95, 36.73], [29.05, 36.68], [29.12, 36.64], [29.15, 36.56], [29.1, 36.48],
  [29.2, 36.38], [29.3, 36.28], [29.4, 36.25], [29.55, 36.22], [29.65, 36.2], [29.8, 36.17], [29.95, 36.22],
  [30.1, 36.28], [30.3, 36.3], [30.45, 36.25], [30.5, 36.4], [30.57, 36.6], [30.65, 36.8], [30.72, 36.87],
  [30.9, 36.85], [31.2, 36.8], [31.6, 36.78],
];
const ISLANDS: Pt[][] = [
  // Rodos
  [[28.1, 36.45], [28.23, 36.4], [28.25, 36.28], [28.12, 36.12], [28.08, 36.05], [27.88, 35.95], [27.75, 35.88], [27.78, 36.02], [27.72, 36.2], [27.75, 36.35], [27.95, 36.42]],
  // Kos
  [[26.93, 36.75], [27.05, 36.83], [27.28, 36.9], [27.32, 36.85], [27.12, 36.78], [27.0, 36.72]],
  // Simi, Tilos, Halki, Meis
  [[27.8, 36.62], [27.88, 36.63], [27.88, 36.57], [27.8, 36.56]],
  [[27.3, 36.47], [27.42, 36.45], [27.4, 36.38], [27.3, 36.4]],
  [[27.55, 36.25], [27.65, 36.24], [27.6, 36.18]],
  [[29.55, 36.16], [29.63, 36.15], [29.58, 36.11]],
];

// Destinasyon adı ya da adresi -> yaklaşık konum. Burada olmayan destinasyonlar haritada pin almaz (menüde yine görünür).
const PLACES: Record<string, Pt> = {
  bodrum: [27.43, 37.03], datca: [27.68, 36.73], marmaris: [28.27, 36.85], dalyan: [28.65, 36.78], gocek: [28.93, 36.74],
  fethiye: [29.12, 36.62], oludeniz: [29.15, 36.56], kalkan: [29.41, 36.25], kas: [29.64, 36.2], kemer: [30.57, 36.6],
  antalya: [30.7, 36.86], bozburun: [28.05, 36.68], turgutreis: [27.26, 37.0], yalikavak: [27.29, 37.1], gokova: [28.3, 37.05],
  akyaka: [28.32, 37.05], kekova: [29.87, 36.2], dalaman: [28.8, 36.72], didim: [27.27, 37.37], kusadasi: [27.26, 37.85],
  orhaniye: [28.18, 36.72], hisaronu: [28.12, 36.65], sarigerme: [28.7, 36.7], ekincik: [28.55, 36.83],
};
const norm = (s: string) => s.toLocaleLowerCase("tr").replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c").replace(/[^a-z]/g, "");

type Route = { pts: Pt[]; dur: number; begin: number; kind: number };
type Layout = { w: number; h: number; x: (lon: number) => number; y: (la: number) => number; trees: number; boat: number; font: number; routes: Route[] };

// Tekne rotaları yalnızca denizde kalır (boylam, enlem). Tekneler rota başında ve sonunda silinip belirir.
const ROUTE_A: Pt[] = [[26.2, 36.25], [26.8, 36.2], [27.3, 36.0], [27.6, 35.75], [28.0, 35.65], [28.6, 35.65], [29.2, 35.75], [29.8, 35.8]];
const ROUTE_B: Pt[] = [[28.4, 36.55], [28.7, 36.5], [29.0, 36.45], [29.2, 36.2], [29.45, 36.0], [29.9, 35.98], [30.3, 36.0], [30.6, 36.1], [30.85, 36.3], [30.95, 36.65]];
const ROUTE_C: Pt[] = [[27.45, 36.92], [27.8, 36.93], [28.1, 36.98], [28.2, 37.0]];

const DESKTOP: Layout = { w: 1200, h: 700, x: (lo) => (lo - 24.2) * 175, y: (la) => (37.9 - la) * 219 + 200, trees: 90, boat: 0.5, font: 14,
  routes: [{ pts: ROUTE_A, dur: 70, begin: -12, kind: 1 }, { pts: ROUTE_B, dur: 85, begin: -50, kind: 0 }, { pts: ROUTE_C, dur: 30, begin: -9, kind: 2 }] };
const MOBILE: Layout = { w: 400, h: 340, x: (lo) => (lo - 26.3) * 80, y: (la) => (37.55 - la) * 109 + 120, trees: 40, boat: 0.3, font: 11,
  routes: [{ pts: ROUTE_A, dur: 70, begin: -12, kind: 1 }, { pts: ROUTE_B, dur: 85, begin: -50, kind: 0 }, { pts: ROUTE_C, dur: 30, begin: -9, kind: 2 }] };

function curve(pts: Pt[], closed: boolean): string {
  const n = pts.length;
  const at = (i: number) => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  const segs = closed ? n : n - 1;
  let d = "";
  for (let i = 0; i < segs; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}
function inside(p: Pt, poly: Pt[]) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

const BOATS = [
  // gulet
  <g key="g"><path d="M62 50 V102 M100 60 V102" stroke="#e8f4fb" strokeWidth="2" /><path d="M60 52 V98 H36 Z" fill="#fff" /><path d="M98 62 V98 H76 Z" fill="#e6f3fb" /><path d="M54 92 H108 L112 100 H52 Z" fill="#e6f3fb" /><path d="M30 100 H128 Q124 118 106 118 H56 Q38 116 30 100 Z" fill="#12395f" /></g>,
  // motor yat
  <g key="y"><path d="M52 100 L66 86 H100 L108 100 Z" fill="#e6f3fb" /><path d="M70 90 H98 L103 98 H66 Z" fill="#2a74ae" /><path d="M34 100 H124 L130 106 L118 118 H46 Q38 116 34 100 Z" fill="#fff" /><path d="M40 106 H124" stroke="#2bb7c4" strokeWidth="2" /></g>,
  // yelkenli
  <g key="s"><path d="M80 44 V104" stroke="#e8f4fb" strokeWidth="2" /><path d="M78 46 V102 H46 Z" fill="#fff" /><path d="M83 56 V102 H112 Z" fill="#cde8f6" /><path d="M38 104 H122 L112 114 Q108 118 100 118 H60 Q52 118 48 114 Z" fill="#fff" /><path d="M44 108.5 H116" stroke="#2bb7c4" strokeWidth="2" /></g>,
];

function MapSvg({ L, destinations, lang, className }: { L: Layout; destinations: Destination[]; lang: Lang; className: string }) {
  const px = (p: Pt): Pt => [L.x(p[0]), L.y(p[1])];
  const coast = COAST.map(px);
  const top = -400;
  const land = `M${coast[0][0].toFixed(1)} ${top} L${coast[0][0].toFixed(1)} ${coast[0][1].toFixed(1)} ${curve(coast, false)} L${coast[coast.length - 1][0].toFixed(1)} ${top} Z`;
  const shore = `M${coast[0][0].toFixed(1)} ${coast[0][1].toFixed(1)} ${curve(coast, false)}`;
  const isl = ISLANDS.map((pts) => { const q = pts.map(px); return `M${q[0][0].toFixed(1)} ${q[0][1].toFixed(1)} ${curve(q, true)} Z`; });

  const r = rng(L.w);
  const poly: Pt[] = [[coast[0][0], top], ...coast, [coast[coast.length - 1][0], top]];
  const trees: { x: number; y: number; r: number }[] = [];
  for (let k = 0; k < L.trees * 12 && trees.length < L.trees; k++) {
    const p: Pt = [r() * L.w, Math.min(...coast.map((c) => c[1])) * 0 + r() * L.h];
    if (!inside(p, poly)) continue;
    const dist = Math.min(...coast.map((c) => Math.hypot(c[0] - p[0], c[1] - p[1])));
    if (dist < 20 || dist > 200) continue;
    trees.push({ x: p[0], y: p[1], r: (L.w > 600 ? 3 : 2) + r() * (L.w > 600 ? 3.5 : 2.2) });
  }
  const patches: { x: number; y: number; rx: number; ry: number; rot: number }[] = [];
  for (let k = 0; k < 400 && patches.length < (L.w > 600 ? 14 : 6); k++) {
    const p: Pt = [r() * L.w, r() * L.h];
    if (inside(p, poly)) patches.push({ x: p[0], y: p[1], rx: (L.w > 600 ? 70 : 30) + r() * 90, ry: (L.w > 600 ? 30 : 14) + r() * 50, rot: r() * 180 });
  }
  const waves: Pt[] = Array.from({ length: L.w > 600 ? 40 : 14 }, () => [r() * L.w, r() * L.h]);

  const pins = destinations
    .map((d) => {
      const key = [norm(d.slug), norm(d.name)].find((k) => PLACES[k]);
      return key ? { d, pos: px(PLACES[key]) } : null;
    })
    .filter((v): v is { d: Destination; pos: Pt } => v !== null)
    .sort((a, b) => a.pos[0] - b.pos[0]);

  const en = lang === "en";
  let prevLift = false; // önceki tabela aşağıya alındı mı
  let prevX = -999;
  const s = L.w > 600 ? 1 : 0.8;
  return (
    <svg viewBox={`0 0 ${L.w} ${L.h}`} preserveAspectRatio="xMidYMax slice" className={className} role="img" aria-label={en ? "Map of the Bodrum – Antalya coast" : "Bodrum – Antalya kıyısı haritası"}>
      {waves.map((w, i) => <path key={i} d={`M${w[0].toFixed(0)} ${w[1].toFixed(0)} q6 -5 12 0 q6 5 12 0`} stroke="#fff" strokeOpacity="0.22" strokeWidth="1.6" fill="none" strokeLinecap="round" />)}
      {/* Kıyıdan açılan sığ su */}
      <path d={shore} fill="none" stroke="#7fdcea" strokeOpacity="0.28" strokeWidth={L.w > 600 ? 46 : 22} strokeLinejoin="round" strokeLinecap="round" />
      <path d={shore} fill="none" stroke="#9fe7f0" strokeOpacity="0.35" strokeWidth={L.w > 600 ? 24 : 12} strokeLinejoin="round" strokeLinecap="round" />
      {isl.map((d, i) => <path key={"h" + i} d={d} fill="none" stroke="#7fdcea" strokeOpacity="0.35" strokeWidth={L.w > 600 ? 26 : 12} strokeLinejoin="round" />)}

      {/* Süzülen tekneler: yalnızca denizdeki rotalarda gider */}
      {L.routes.map((rt, i) => {
        const q = rt.pts.map(px);
        const path = `M${q[0][0].toFixed(1)} ${q[0][1].toFixed(1)} ${curve(q, false)}`;
        return (
          <g key={i} opacity="0">
            <animateMotion dur={`${rt.dur}s`} begin={`${rt.begin}s`} repeatCount="indefinite" path={path} />
            <animate attributeName="opacity" dur={`${rt.dur}s`} begin={`${rt.begin}s`} repeatCount="indefinite" values="0;0.95;0.95;0" keyTimes="0;0.06;0.94;1" />
            <ellipse cx="0" cy="2" rx={60 * L.boat} ry={3 * L.boat} fill="#fff" fillOpacity="0.35" />
            <g transform={`scale(${L.boat}) translate(-80 -120)`}><g className="pk-sway">{BOATS[rt.kind]}</g></g>
          </g>
        );
      })}

      {/* Kara */}
      <path d={land} fill="#5c9a69" stroke="#efdca3" strokeWidth={L.w > 600 ? 7 : 4} strokeLinejoin="round" />
      {isl.map((d, i) => <path key={"i" + i} d={d} fill="#5c9a69" stroke="#efdca3" strokeWidth={L.w > 600 ? 6 : 3.5} strokeLinejoin="round" />)}
      {patches.map((q, i) => <ellipse key={"p" + i} cx={q.x} cy={q.y} rx={q.rx} ry={q.ry} fill={i % 2 ? "#4f8e5f" : "#78b583"} fillOpacity="0.28" transform={`rotate(${q.rot} ${q.x} ${q.y})`} />)}
      {trees.map((t, i) => (
        <g key={i}><circle cx={t.x} cy={t.y} r={t.r} fill="#3f7c52" /><circle cx={t.x - t.r * 0.25} cy={t.y - t.r * 0.3} r={t.r * 0.55} fill="#68ab76" /></g>
      ))}

      {/* Deniz ve ada adları */}
      {L.w > 600 && <text x={L.x(29.3)} y={L.y(35.95)} fill="#fff" fillOpacity="0.5" fontSize={L.font} fontStyle="italic" letterSpacing="3">{en ? "MEDITERRANEAN" : "AKDENİZ"}</text>}
      <text x={L.x(27.95)} y={L.y(36.15)} textAnchor="middle" fill="#fff" fillOpacity="0.75" fontSize={L.font - 2} fontStyle="italic" letterSpacing="2">{en ? "RHODES" : "RODOS"}</text>
      <text x={L.x(27.1)} y={L.y(36.7)} textAnchor="middle" fill="#fff" fillOpacity="0.7" fontSize={L.font - 3} fontStyle="italic" letterSpacing="2">KOS</text>

      {/* Destinasyon tabelaları: dokununca o bölgenin tekneleri açılır */}
      {pins.map(({ d, pos }, i) => {
        const w = d.name.length * (L.font * 0.62) + 30 * s;
        const close = L.w > 600 && pos[0] - prevX < 130 && !prevLift;
        const below = L.w < 600 ? i % 2 === 1 : close;
        prevLift = close; prevX = pos[0];
        const dy = below ? 34 * s : -34 * s;
        return (
          <Link key={d.slug} href={`${href(lang, "/tekneler")}?destinasyon=${d.slug}`} aria-label={`${d.name} ${en ? "boats" : "tekneleri"}`} style={{ pointerEvents: "auto" }}>
            <g className="pk-link" transform={`translate(${pos[0].toFixed(1)} ${pos[1].toFixed(1)})`}>
              <g className="pk-pin" style={{ animationDelay: `${i * 0.6}s` }}>
                <circle r={9 * s} fill="#fff" fillOpacity="0.45" />
                <circle r={5.5 * s} fill="#1bb4c4" stroke="#fff" strokeWidth={2 * s} />
                <path d={below ? `M0 ${6 * s} V${dy - 8 * s}` : `M0 ${-6 * s} V${dy + 12 * s}`} stroke="#fff" strokeWidth={1.6 * s} strokeOpacity="0.8" />
                <rect className="pk-pill" x={-w / 2} y={dy - 13 * s} width={w} height={26 * s} rx={13 * s} fill="#fff" stroke="#0b3a6a" strokeOpacity="0.15" />
                <text className="pk-name" x="0" y={dy + L.font * 0.36} textAnchor="middle" fontSize={L.font} fontWeight="700" fill="#0b3a6a">{d.name}</text>
              </g>
            </g>
          </Link>
        );
      })}
    </svg>
  );
}

export function HeroMap({ destinations, lang = "tr" }: { destinations: Destination[]; lang?: Lang }) {
  return (
    <div className="absolute inset-0 -z-10">
      {/* Başlık okunsun diye ortayı hafifçe koyulaştırır; tabelalara dokunmayı engellemez */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(5,34,74,0.6),rgba(5,34,74,0.08)_72%)] lg:bg-[linear-gradient(90deg,rgba(5,34,74,0.45),rgba(5,34,74,0.1)_34%,rgba(5,34,74,0)_46%)]" />
      {/* Telefon: haritanın yalnızca alt kısmı görünür, üstü denize karışır */}
      <MapSvg L={MOBILE} destinations={destinations} lang={lang} className="absolute inset-x-0 bottom-0 h-[22rem] w-full lg:hidden [mask-image:linear-gradient(to_bottom,transparent,black_28%)]" />
      <MapSvg L={DESKTOP} destinations={destinations} lang={lang} className="absolute inset-0 hidden h-full w-full lg:block" />
    </div>
  );
}
