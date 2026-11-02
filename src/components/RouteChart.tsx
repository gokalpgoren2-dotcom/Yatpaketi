import { GeoChart, hasGeo } from "./GeoChart";

// Yedek şema (coğrafi güzergâhı tanımlı olmayan rotalar için): sade bir deniz haritası. Girintili kıyılar ve karada yükselti çizgileri, denizde derinlik çizgileri,
// kıyı dibinde sığ su, ince pusula; durak adları beyaz yazıyla, kalkış ve varış limanları lacivert etiketle. Rota boyunca gulet ilerler.
// Gerçek harita değildir, rotanın akışını gösterir. Dönüş rotaları bir adanın çevresinde, tek yön rotalar iki kıyı arasında çizilir.
type P = [number, number];
const W = 600, H = 340;

function rng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; };
}

function points(n: number, loop: boolean): P[] {
  if (n <= 1) return [[W / 2, H / 2]];
  if (loop) {
    return Array.from({ length: n }, (_, i) => {
      const a = Math.PI + (i / n) * Math.PI * 2;
      const wob = 1 + 0.06 * Math.sin(i * 2.3);
      return [W / 2 + Math.cos(a) * 185 * wob, H / 2 + 6 + Math.sin(a) * 96 * wob] as P;
    });
  }
  return Array.from({ length: n }, (_, i) => [70 + (i * (W - 140)) / (n - 1), H / 2 + 8 + 62 * Math.sin(i * 1.9 + 0.7)] as P);
}

function smooth(pts: P[], closed: boolean): string {
  if (pts.length < 2) return "";
  const at = (i: number) => (closed ? pts[(i + pts.length) % pts.length] : pts[Math.max(0, Math.min(pts.length - 1, i))]);
  const segs = closed ? pts.length : pts.length - 1;
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < segs; i++) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1: P = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: P = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return closed ? d + "Z" : d;
}

// Doğal görünen kıyı: farklı dalga boylarındaki girinti çıkıntıların toplamı.
function noise(r: () => number) {
  const w = [0, 1, 2].map(() => ({ f: 0.01 + r() * 0.03, p: r() * 6.3 }));
  return (x: number, amp: number) => amp * (0.55 * Math.sin(x * w[0].f + w[0].p) + 0.3 * Math.sin(x * w[1].f * 2.3 + w[1].p) + 0.15 * Math.sin(x * w[2].f * 5.1 + w[2].p));
}

// Kenardan giren kıyı (üst ya da alt). Kıyı çizgisi, karanın alanı ve iç/dış eş yükselti çizgileri döner.
function coast(r: () => number, base: number, top: boolean) {
  const n = noise(r);
  const line = (off: number) => {
    const pts: P[] = [];
    for (let x = -30; x <= W + 30; x += 22) pts.push([x, base + n(x, 20) + off]);
    return smooth(pts, false);
  };
  const s = top ? -1 : 1; // karaya doğru yön
  const edge = top ? -30 : H + 30;
  return {
    line: line(0),
    area: `${line(0)} L${W + 30} ${edge} L-30 ${edge}Z`,
    hills: [10, 20, 30].map((k) => line(s * k)),
    depth: [16, 34, 58].map((k) => line(-s * k)),
  };
}

// Kapalı ada; yükselti çizgileri için içe doğru küçültülmüş kopyaları da döner.
function island(r: () => number, cx: number, cy: number, rx: number, ry: number) {
  const n = 14;
  const k = Array.from({ length: n }, () => 0.8 + r() * 0.32);
  const ring = (sc: number) => smooth(k.map((kk, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + Math.cos(a) * rx * kk * sc, cy + Math.sin(a) * ry * kk * sc] as P;
  }), true);
  return { d: ring(1), hills: [0.72, 0.45].map(ring), depth: [1.22, 1.5].map(ring) };
}

const GULET = (
  <g>
    <path d="M62 50 V102 M100 60 V102" stroke="#e8f4fb" strokeWidth="2" />
    <path d="M60 52 V98 H36 Z" fill="#fff" />
    <path d="M98 62 V98 H76 Z" fill="#e6f3fb" />
    <path d="M30 100 H128 Q124 118 106 118 H56 Q38 116 30 100 Z" fill="#0b3a6a" />
  </g>
);

function SchematicChart({ id, stops, loop, compact = false, label }: { id: string; stops: string[]; loop: boolean; compact?: boolean; label: string }) {
  const closed = loop && stops.length > 2;
  const pts = points(stops.length, closed);
  const d = smooth(pts, closed);
  const r = rng(id.replace(/^(c-|home-|hero-)/, ""));
  const g = `rc-${id}`;
  const fs = compact ? 17 : 12.5;

  const shores = closed ? [] : [coast(r, 30, true), coast(r, H - 26, false)];
  const mid = pts[Math.floor(pts.length / 2)];
  const isles = closed
    ? [island(r, W / 2, H / 2 + 6, 108, 46), island(r, 26, 22, 74, 46), island(r, W - 22, H - 18, 80, 48)]
    : [island(r, mid[0] + 44, mid[1] < H / 2 ? 236 : 116, 22, 11)];

  // tabela yönü: tepedeki durak üstte, çukurdaki altta; uçtaki tabela komşusuna çok yakınsa ters yöne geçer
  const sides = pts.map(([, y], i) => {
    if (closed) return y < H / 2 + 6;
    const prev = pts[i - 1]?.[1] ?? y, next = pts[i + 1]?.[1] ?? y;
    return i === 0 || i === pts.length - 1 ? y < H / 2 + 8 : y <= (prev + next) / 2;
  });
  if (!closed && pts.length > 2) {
    const L = pts.length - 1;
    if (sides[L] === sides[L - 1] && pts[L][0] - pts[L - 1][0] < 120) sides[L] = !sides[L];
    if (sides[0] === sides[1] && pts[1][0] - pts[0][0] < 120) sides[0] = !sides[0];
  }

  const lands = [...shores.map((s) => ({ d: s.area, line: s.line, hills: s.hills, depth: s.depth })), ...isles.map((s) => ({ d: s.d, line: s.d, hills: s.hills, depth: s.depth }))];

  // yat: güzergâhın başında, 2. ile 3. nokta arasında sabit durur (animasyon yok, telefonu yormaz)
  const boat: [number, number] = pts.length > 2 ? [(pts[1][0] + pts[2][0]) / 2, (pts[1][1] + pts[2][1]) / 2] : pts.length > 1 ? [(pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2] : pts[0];
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
          <stop offset="1" stopColor="#05223f" stopOpacity="0.35" />
        </radialGradient>
      </defs>

      <rect width={W} height={H} fill={`url(#${g}-sea)`} />

      {/* derinlik çizgileri */}
      {lands.flatMap((l, i) => l.depth.map((dd, k) => (
        <path key={`dp${i}-${k}`} d={dd} fill="none" stroke="#fff" strokeOpacity={0.14 - k * 0.035} strokeWidth="1" strokeDasharray={k ? "2 5" : undefined} />
      )))}
      {/* kıyı dibinde sığ su */}
      <g>
        {lands.map((l, i) => <path key={"sh" + i} d={l.line} fill="none" stroke="#7fe0ea" strokeOpacity="0.55" strokeWidth="20" strokeLinejoin="round" />)}
      </g>

      {/* kara: kumsal kenarı, eğimli yeşil, yükselti çizgileri */}
      {lands.map((l, i) => (
        <g key={"ld" + i}>
          <path d={l.d} fill={`url(#${g}-land)`} stroke="#eadcb4" strokeWidth="2.4" strokeLinejoin="round" />
        </g>
      ))}
      {lands.flatMap((l, i) => l.hills.map((hd, k) => (
        <path key={`hl${i}-${k}`} d={hd} fill="none" stroke="#2f5e3f" strokeOpacity={0.22 + k * 0.05} strokeWidth="0.9" />
      )))}

      {/* pusula (dönüş rotalarında sağ üstte, açık denizde) */}
      {closed && !compact && (
        <g transform="translate(548 56)" opacity="0.75">
          <circle r="20" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="0.8" />
          <circle r="14" fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="0.6" />
          <path d="M0 -24 L3 0 L0 24 L-3 0Z M-24 0 L0 3 L24 0 L0 -3Z" fill="#fff" fillOpacity="0.35" />
          <path d="M0 -24 L3 0 L-3 0Z" fill="#fff" />
          <text y="-28" textAnchor="middle" fontSize="8" fontWeight="700" fill="#fff" letterSpacing="1">N</text>
        </g>
      )}

      {/* rota: yatın bıraktığı iz */}
      <path d={d} fill="none" stroke="#fff" strokeOpacity="0.16" strokeWidth={compact ? 9 : 7} strokeLinecap="round" />
      <path d={d} fill="none" stroke="#fff" strokeOpacity="0.92" strokeWidth={compact ? 2.6 : 1.8} strokeDasharray={compact ? "9 9" : "7 7"} strokeLinecap="round" />

      {/* gulet */}
      {stops.length > 1 && (
        <g transform={`translate(${boat[0].toFixed(1)} ${boat[1].toFixed(1)})`}>
          <ellipse cx="0" cy="3" rx={compact ? 26 : 19} ry="2" fill="#fff" fillOpacity="0.4" />
          <g transform={`scale(${compact ? 0.32 : 0.26}) translate(-80 -118)`}>{GULET}</g>
        </g>
      )}

      {/* duraklar */}
      {pts.map(([x, y], i) => {
        const end = i === 0 || (!closed && i === pts.length - 1);
        const show = !compact || end;
        const above = sides[i];
        const name = stops[i];
        const up = name.toLocaleUpperCase("tr");
        const dy = (above ? -1 : 1) * (compact ? 30 : 22);
        if (end) {
          const ef = fs * 0.82;
          const w = up.length * ef * 0.72 + ef * 3.2;
          const bx = Math.max(w / 2 + 4, Math.min(W - w / 2 - 4, x));
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={compact ? 9 : 7} fill="#fff" fillOpacity="0.25" />
              <circle cx={x} cy={y} r={compact ? 5 : 4} fill="#0b3a6a" stroke="#fff" strokeWidth="1.8" />
              {show && (
                <g>
                  <rect x={bx - w / 2} y={y + dy - ef * 1.1} width={w} height={ef * 2.2} rx={ef * 1.1} fill="#0b3a6a" />
                  <circle cx={bx - w / 2 + ef * 1.15} cy={y + dy} r={ef * 0.28} fill={i === 0 ? "#1bb4c4" : "#ffffff"} />
                  <text x={bx + ef * 0.55} y={y + dy + ef * 0.36} textAnchor="middle" fontSize={ef} fontWeight="700" letterSpacing={ef * 0.12} fill="#fff">{up}</text>
                </g>
              )}
            </g>
          );
        }
        const tx = Math.max(name.length * fs * 0.3 + 6, Math.min(W - name.length * fs * 0.3 - 6, x));
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={compact ? 4.5 : 3.6} fill="#fff" />
            <circle cx={x} cy={y} r={compact ? 2 : 1.6} fill="#127fa6" />
            {show && (
              <text x={tx} y={y + dy + (above ? 0 : fs * 0.4)} textAnchor="middle" fontSize={fs} fontWeight="600" fill="#fff" stroke="#05223f" strokeOpacity="0.45" strokeWidth="3" paintOrder="stroke" letterSpacing="0.2">{name}</text>
            )}
          </g>
        );
      })}

      <rect width={W} height={H} fill={`url(#${g}-vig)`} pointerEvents="none" />
    </svg>
  );
}

// Rota haritası: güzergâhı tanımlı rotalarda gerçek kıyıya sadık harita, diğerlerinde şema.
export function RouteChart(props: { id: string; stops: string[]; loop: boolean; compact?: boolean; label: string }) {
  const slug = props.id.replace(/^(c-|home-|hero-)/, "");
  return hasGeo(slug) ? <GeoChart {...props} slug={slug} /> : <SchematicChart {...props} />;
}
