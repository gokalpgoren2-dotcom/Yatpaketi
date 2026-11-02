// Coğrafi rota haritası: gerçek kıyı şekline sadık (elle çizilmiş, sadeleştirilmiş) Bodrum – Kekova kıyısı üzerinde,
// rotanın denizden giden güzergâhı, durakları ve güzergâh boyunca ilerleyen gulet. Her rota kendi bölgesine yakınlaşır.
import { ISLANDS, MAINLAND, ROUTE_WAYS, placeOf, type LL } from "@/lib/geo";

type P = [number, number];
const W = 600, H = 340;

export const hasGeo = (slug: string) => !!ROUTE_WAYS[slug];

function smooth(pts: P[], closed: boolean, tension = 1): string {
  if (pts.length < 2) return "";
  const n = pts.length;
  const at = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  const segs = closed ? n : n - 1;
  const t = 6 / tension;
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < segs; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    d += ` C${(p1[0] + (p2[0] - p0[0]) / t).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / t).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / t).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / t).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return closed ? d + "Z" : d;
}

const GULET = (
  <g>
    <path d="M62 50 V102 M100 60 V102" stroke="#e8f4fb" strokeWidth="2" />
    <path d="M60 52 V98 H36 Z" fill="#fff" />
    <path d="M98 62 V98 H76 Z" fill="#e6f3fb" />
    <path d="M30 100 H128 Q124 118 106 118 H56 Q38 116 30 100 Z" fill="#0b3a6a" />
  </g>
);

type Box = { x: number; y: number; w: number; h: number };
const hit = (a: Box, b: Box) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

export function GeoChart({ id, slug, stops, loop, compact = false, label }: { id: string; slug: string; stops: string[]; loop: boolean; compact?: boolean; label: string }) {
  const way = ROUTE_WAYS[slug];
  const wayLL: LL[] = way.map((w) => (typeof w === "string" ? placeOf(w)! : w)).filter(Boolean);

  // görünüm: güzergâhı çerçeveleyen kutu, kenar payı ve 600x340 oranına uydurma
  const lat0 = wayLL.reduce((s, p) => s + p[1], 0) / wayLL.length;
  const cos = Math.cos((lat0 * Math.PI) / 180);
  const xs = wayLL.map((p) => p[0] * cos), ys = wayLL.map((p) => p[1]);
  let x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const minSpan = 0.09;
  let sx = Math.max(x1 - x0, minSpan), sy = Math.max(y1 - y0, minSpan * 0.6);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  sx *= 1.32; sy *= 1.42;
  if (sx / sy > W / H) sy = (sx * H) / W; else sx = (sy * W) / H;
  x0 = cx - sx / 2; y1 = cy + sy / 2;
  const k = W / sx;
  const pr = (p: LL): P => [(p[0] * cos - x0) * k, (y1 - p[1]) * k];
  const zoom = k / 1000; // 1° ≈ k px; ayrıntı ölçeği için

  const coast = MAINLAND.map(pr);
  const land = `${smooth(coast, false, 0.6)} L${(W + 2000).toFixed(0)} ${coast[coast.length - 1][1].toFixed(0)} L${(W + 2000).toFixed(0)} -3000 L-3000 -3000 L-3000 ${coast[0][1].toFixed(0)} Z`;
  const coastLine = smooth(coast, false, 0.6);
  const isles = ISLANDS.map((isl) => smooth(isl.map(pr), true, 0.6));
  const route = way.map((w) => pr(typeof w === "string" ? placeOf(w)! : w));
  const d = smooth(route, false, 1);
  const g = `gc-${id}`;
  const fs = compact ? 17 : 12.5;
  const dur = `${Math.max(16, stops.length * 3.2)}s`;

  // duraklar (aynı yer iki kez geçerse tek işaret)
  const seen = new Set<string>();
  const marks = stops.map((name, i) => ({ name, i, p: placeOf(name) })).filter((m) => m.p && !seen.has(m.name) && seen.add(m.name)).map((m) => ({ ...m, xy: pr(m.p!) }));
  const startName = stops[0], endName = stops[stops.length - 1];
  const isEnd = (n: string) => n === startName || (!loop && n === endName);

  // etiket yerleşimi: her durak için üst/alt/sağ/sol adaylarından en az çakışanı
  const placed: Box[] = [];
  const dots: Box[] = marks.map(({ xy }) => ({ x: xy[0] - 6, y: xy[1] - 6, w: 12, h: 12 }));
  const labels = marks.map((m) => {
    const end = isEnd(m.name);
    const show = !compact || end;
    const text = end ? m.name.toLocaleUpperCase("tr") : m.name;
    const f = end ? fs * 0.82 : fs;
    const w = end ? text.length * f * 0.72 + f * 3.2 : text.length * f * 0.56 + 6;
    const h = end ? f * 2.2 : f * 1.3;
    const [x, y] = m.xy;
    const gap = compact ? 14 : 11;
    const cands: [number, number][] = [[x - w / 2, y - gap - h], [x - w / 2, y + gap], [x + gap, y - h / 2], [x - gap - w, y - h / 2], [x + gap * 0.6, y - gap - h], [x - w - gap * 0.6, y + gap * 0.6]];
    let best = cands[0], score = Infinity;
    for (const [bx, by] of cands) {
      const b = { x: bx, y: by, w, h };
      let sc = 0;
      for (const o of placed) if (hit(b, o)) sc += 10;
      for (const o of dots) if (hit(b, o)) sc += 4;
      if (bx < 4 || by < 4 || bx + w > W - 4 || by + h > H - 4) sc += 20;
      if (sc < score) { score = sc; best = [bx, by]; }
    }
    const box = { x: Math.max(4, Math.min(W - w - 4, best[0])), y: Math.max(4, Math.min(H - h - 4, best[1])), w, h };
    if (show) placed.push(box);
    return { ...m, end, show, text, f, box };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${label}: ${stops.join(" → ")}`} className="block h-full w-full">
      <defs>
        <linearGradient id={`${g}-sea`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor="#1d9fba" />
          <stop offset="0.5" stopColor="#127fa6" />
          <stop offset="1" stopColor="#0b5683" />
        </linearGradient>
        <linearGradient id={`${g}-land`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7aa982" />
          <stop offset="1" stopColor="#4f8360" />
        </linearGradient>
        <radialGradient id={`${g}-vig`} cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.6" stopColor="#05223f" stopOpacity="0" />
          <stop offset="1" stopColor="#05223f" stopOpacity="0.32" />
        </radialGradient>
        <filter id={`${g}-soft`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6" /></filter>
        <filter id={`${g}-sh`} x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="2.5" stdDeviation="2.5" floodColor="#05223f" floodOpacity="0.35" /></filter>
      </defs>

      <rect width={W} height={H} fill={`url(#${g}-sea)`} />

      {/* derinlik kuşakları: kıyıdan açığa doğru koyulaşan su */}
      {[56, 30].map((sw) => (
        <g key={sw}>
          <path d={coastLine} fill="none" stroke="#5fd0e0" strokeOpacity="0.12" strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" />
          {isles.map((p, j) => <path key={j} d={p} fill="none" stroke="#5fd0e0" strokeOpacity="0.12" strokeWidth={sw * 0.6} strokeLinejoin="round" />)}
        </g>
      ))}
      {/* kıyı dibinde sığ su */}
      <g filter={`url(#${g}-soft)`}>
        <path d={coastLine} fill="none" stroke="#7fe0ea" strokeOpacity="0.6" strokeWidth={Math.min(22, 8 + zoom * 3)} strokeLinejoin="round" />
        {isles.map((p, j) => <path key={j} d={p} fill="none" stroke="#7fe0ea" strokeOpacity="0.6" strokeWidth={Math.min(16, 6 + zoom * 2)} strokeLinejoin="round" />)}
      </g>

      {/* kara */}
      <g filter={`url(#${g}-sh)`}>
        <path d={land} fill={`url(#${g}-land)`} stroke="#eadcb4" strokeWidth="2" strokeLinejoin="round" />
        {isles.map((p, j) => <path key={j} d={p} fill={`url(#${g}-land)`} stroke="#eadcb4" strokeWidth="1.6" strokeLinejoin="round" />)}
      </g>

      {/* rota */}
      <path d={d} fill="none" stroke="#fff" strokeOpacity="0.16" strokeWidth={compact ? 8 : 6} strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} fill="none" stroke="#fff" strokeOpacity="0.95" strokeWidth={compact ? 2.4 : 1.8} strokeDasharray={compact ? "9 9" : "7 7"} strokeLinecap="round" className="route-dash" />

      {/* gulet */}
      <g>
        <animateMotion dur={dur} repeatCount="indefinite" path={d} />
        <ellipse cx="0" cy="3" rx={compact ? 24 : 18} ry="2" fill="#fff" fillOpacity="0.4" />
        <g transform={`scale(${compact ? 0.3 : 0.24}) translate(-80 -118)`} filter={`url(#${g}-sh)`}><g className="pk-sway">{GULET}</g></g>
      </g>

      {/* duraklar ve adları */}
      {labels.map(({ name, i, xy, end, show, text, f, box }) => (
        <g key={name}>
          <circle cx={xy[0]} cy={xy[1]} r={end ? (compact ? 8 : 6.5) : compact ? 5 : 4} fill="#fff" fillOpacity={end ? 0.3 : 0.9} />
          <circle cx={xy[0]} cy={xy[1]} r={end ? (compact ? 4.6 : 3.8) : compact ? 2.2 : 1.8} fill={end ? "#0b3a6a" : "#127fa6"} stroke={end ? "#fff" : "none"} strokeWidth="1.6" />
          {show && end && (
            <g filter={`url(#${g}-sh)`}>
              <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={box.h / 2} fill="#0b3a6a" />
              <circle cx={box.x + f * 1.15} cy={box.y + box.h / 2} r={f * 0.28} fill={name === startName ? "#1bb4c4" : "#fff"} />
              <text x={box.x + box.w / 2 + f * 0.55} y={box.y + box.h / 2 + f * 0.36} textAnchor="middle" fontSize={f} fontWeight="700" letterSpacing={f * 0.12} fill="#fff">{text}</text>
            </g>
          )}
          {show && !end && (
            <text x={box.x + box.w / 2} y={box.y + box.h * 0.78} textAnchor="middle" fontSize={f} fontWeight="600" fill="#fff" stroke="#05223f" strokeOpacity="0.5" strokeWidth="3" paintOrder="stroke">{text}</text>
          )}
          <title>{`${i + 1}. ${name}`}</title>
        </g>
      ))}

      <rect width={W} height={H} fill={`url(#${g}-vig)`} pointerEvents="none" />
    </svg>
  );
}
