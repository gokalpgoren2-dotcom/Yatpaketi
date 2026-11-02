// Rota şeması: ana sayfa haritasıyla aynı çizim dili. Turkuaz deniz ve dalgacıklar, kumsal kenarlı yeşil kara ve çamlar,
// beyaz tabelalı duraklar ve rota boyunca sallanarak ilerleyen bir gulet. Gerçek harita değildir, rotanın akışını gösterir.
// Dönüş rotaları bir adanın çevresinde halka, tek yön rotalar iki kıyı arasında soldan sağa çizilir.
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

// Kenardan giren kıyı şeridi (üst ya da alt). base: kıyının ortalama yüksekliği.
function coast(r: () => number, base: number, top: boolean) {
  const pts: P[] = [];
  for (let x = -30; x <= W + 30; x += 50) pts.push([x, base + (r() - 0.5) * 34]);
  const line = smooth(pts, false);
  const edge = top ? -20 : H + 20;
  const area = `${line} L${W + 30} ${edge} L-30 ${edge}Z`;
  const trees: P[] = [];
  for (const [x, y] of pts) for (let k = 0; k < 2; k++) {
    const tx = x + (r() - 0.5) * 44, ty = top ? y - 10 - r() * 26 : y + 12 + r() * 26;
    if (top ? ty > 4 : ty < H - 4) trees.push([tx, ty]);
  }
  return { line, area, trees };
}

// Kapalı ada şekli
function island(r: () => number, cx: number, cy: number, rx: number, ry: number) {
  const n = 9;
  const pts: P[] = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2, k = 0.82 + r() * 0.3;
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k] as P;
  });
  const trees: P[] = Array.from({ length: Math.round((rx * ry) / 260) }, () => {
    const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.6;
    return [cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d] as P;
  });
  return { d: smooth(pts, true), trees };
}

const GULET = (
  <g>
    <path d="M62 50 V102 M100 60 V102" stroke="#e8f4fb" strokeWidth="2" />
    <path d="M60 52 V98 H36 Z" fill="#fff" />
    <path d="M98 62 V98 H76 Z" fill="#e6f3fb" />
    <path d="M54 92 H108 L112 100 H52 Z" fill="#e6f3fb" />
    <path d="M30 100 H128 Q124 118 106 118 H56 Q38 116 30 100 Z" fill="#12395f" />
  </g>
);

function Tree({ p, s }: { p: P; s: number }) {
  return <g><circle cx={p[0]} cy={p[1]} r={4.2 * s} fill="#3f7c52" /><circle cx={p[0] - 1.1 * s} cy={p[1] - 1.3 * s} r={2.3 * s} fill="#68ab76" /></g>;
}

export function RouteChart({ id, stops, loop, compact = false, label }: { id: string; stops: string[]; loop: boolean; compact?: boolean; label: string }) {
  const closed = loop && stops.length > 2;
  const pts = points(stops.length, closed);
  const d = smooth(pts, closed);
  const r = rng(id.replace(/^(c-|home-|hero-)/, ""));
  const g = `rc-${id}`;
  const fs = compact ? 19 : 13;
  const ts = compact ? 1.2 : 1;

  // kara: tek yönde üstte ve altta kıyı, dönüşte ortada bir ada ve köşelerde kara
  const shores = closed ? [] : [coast(r, 34, true), coast(r, H - 30, false)];
  const isles = closed
    ? [island(r, W / 2, H / 2 + 6, 112, 48), island(r, 30, 24, 70, 44), island(r, W - 26, H - 20, 76, 46)]
    : [island(r, pts[Math.floor(pts.length / 2)][0] + 40, pts[Math.floor(pts.length / 2)][1] < H / 2 ? 238 : 112, 20, 11)];
  const waves: P[] = [];
  for (let k = 0; k < 60 && waves.length < (compact ? 8 : 16); k++) {
    const p: P = [20 + r() * (W - 40), 60 + r() * (H - 120)];
    if (pts.every(([x, y]) => Math.hypot(x - p[0], y - p[1]) > 40)) waves.push(p);
  }
  const dur = `${Math.max(14, stops.length * 3)}s`;
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

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${label}: ${stops.join(" → ")}`} className="block h-full w-full">
      <defs>
        <linearGradient id={`${g}-sea`} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#2bb7c4" />
          <stop offset="0.55" stopColor="#1a8fb2" />
          <stop offset="1" stopColor="#13679a" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${g}-sea)`} />
      {waves.map((w, i) => <path key={i} d={`M${w[0].toFixed(0)} ${w[1].toFixed(0)} q6 -5 12 0 q6 5 12 0`} stroke="#fff" strokeOpacity="0.28" strokeWidth="1.6" fill="none" strokeLinecap="round" />)}

      {/* sığ su halesi */}
      {shores.map((s, i) => <path key={"h" + i} d={s.line} fill="none" stroke="#9fe7f0" strokeOpacity="0.45" strokeWidth="22" strokeLinecap="round" />)}
      {isles.map((s, i) => <path key={"hi" + i} d={s.d} fill="none" stroke="#9fe7f0" strokeOpacity="0.45" strokeWidth="16" strokeLinejoin="round" />)}
      {/* kara */}
      {shores.map((s, i) => <path key={"l" + i} d={s.area} fill="#5c9a69" stroke="#efdca3" strokeWidth="4" strokeLinejoin="round" />)}
      {isles.map((s, i) => <path key={"li" + i} d={s.d} fill="#5c9a69" stroke="#efdca3" strokeWidth="3.5" strokeLinejoin="round" />)}
      {[...shores.flatMap((s) => s.trees), ...isles.flatMap((s) => s.trees)].map((p, i) => <Tree key={"t" + i} p={p} s={ts} />)}

      {/* rota: teknenin ardında kalan iz gibi beyaz kesikli çizgi */}
      <path d={d} fill="none" stroke="#fff" strokeOpacity="0.9" strokeWidth={compact ? 3.4 : 2.4} strokeDasharray={compact ? "9 9" : "7 7"} strokeLinecap="round" className="route-dash" />

      {/* gulet */}
      {stops.length > 1 && (
        <g>
          <animateMotion dur={dur} repeatCount="indefinite" path={d} />
          <ellipse cx="0" cy="3" rx={compact ? 30 : 22} ry="2.5" fill="#fff" fillOpacity="0.45" />
          <g transform={`scale(${compact ? 0.36 : 0.3}) translate(-80 -118)`}><g className="pk-sway">{GULET}</g></g>
        </g>
      )}

      {/* durak tabelaları */}
      {pts.map(([x, y], i) => {
        const end = i === 0 || (!closed && i === pts.length - 1);
        const show = !compact || end;
        const above = sides[i];
        const name = stops[i];
        const w = name.length * fs * 0.6 + (compact ? 26 : 20) + (end ? fs * 1.3 : 0);
        const dy = (above ? -1 : 1) * (compact ? 34 : 28);
        const bx = Math.max(w / 2 + 4, Math.min(W - w / 2 - 4, x));
        return (
          <g key={i}>
            {show && <path d={`M${x} ${y} L${bx} ${y + dy}`} stroke="#fff" strokeOpacity="0.85" strokeWidth="1.4" />}
            <circle cx={x} cy={y} r={end ? (compact ? 9 : 7) : compact ? 6 : 5} fill="#fff" fillOpacity="0.5" />
            <circle cx={x} cy={y} r={end ? (compact ? 6 : 4.5) : compact ? 3.8 : 3.2} fill={end ? "#12395f" : "#1bb4c4"} stroke="#fff" strokeWidth="1.6" />
            {show && (
              <g>
                <rect x={bx - w / 2} y={y + dy - fs * 0.95} width={w} height={fs * 1.9} rx={fs * 0.95} fill="#fff" stroke="#0b3a6a" strokeOpacity="0.15" />
                {end && <circle cx={bx - w / 2 + fs * 1.0} cy={y + dy} r={fs * 0.32} fill={i === 0 ? "#1bb4c4" : "#12395f"} />}
                <text x={bx + (end ? fs * 0.65 : 0)} y={y + dy + fs * 0.36} textAnchor="middle" fontSize={fs} fontWeight="700" fill="#0b3a6a">{name}</text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
