// Rota şeması: duraklar arasından geçen kesikli rota çizgisi, numaralı duraklar ve rota üzerinde süzülen bir yelkenli.
// Gerçek harita değildir; rotanın akışını gösteren stilize bir çizimdir. Dönüş rotaları halka, tek yön rotalar soldan sağa çizilir.
type P = [number, number];
const W = 600, H = 340;

function points(n: number, loop: boolean): P[] {
  if (n <= 1) return [[W / 2, H / 2]];
  if (loop) {
    return Array.from({ length: n }, (_, i) => {
      const a = Math.PI + (i / n) * Math.PI * 2;
      const wob = 1 + 0.08 * Math.sin(i * 2.3);
      return [W / 2 + Math.cos(a) * 180 * wob, H / 2 + 10 + Math.sin(a) * 108 * wob] as P;
    });
  }
  return Array.from({ length: n }, (_, i) => [70 + (i * (W - 140)) / (n - 1), H / 2 + 12 + 72 * Math.sin(i * 1.9 + 0.7)] as P);
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

export function RouteChart({ id, stops, loop, compact = false, label }: { id: string; stops: string[]; loop: boolean; compact?: boolean; label: string }) {
  const pts = points(stops.length, loop && stops.length > 2);
  const closed = loop && stops.length > 2;
  const d = smooth(pts, closed);
  const g = `rc-${id}`;
  const fs = compact ? 19 : 14;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${label}: ${stops.join(" → ")}`} className="block h-full w-full">
      <defs>
        <linearGradient id={`${g}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#06264b" />
          <stop offset="0.6" stopColor="#0a3d63" />
          <stop offset="1" stopColor="#0d6a86" />
        </linearGradient>
        <radialGradient id={`${g}-glow`} cx="0.5" cy="0.55" r="0.6">
          <stop offset="0" stopColor="#1bb4c4" stopOpacity="0.28" />
          <stop offset="1" stopColor="#1bb4c4" stopOpacity="0" />
        </radialGradient>
        <pattern id={`${g}-grid`} width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill={`url(#${g}-bg)`} />
      <rect width={W} height={H} fill={`url(#${g}-grid)`} />
      <rect width={W} height={H} fill={`url(#${g}-glow)`} />
      {/* dalga çizgileri */}
      {[60, 290, 318].map((y, i) => (
        <path key={y} d={`M-20 ${y} q30 -10 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0`} fill="none" stroke="#7fdce6" strokeOpacity={0.12 - i * 0.02} strokeWidth="1.5" />
      ))}
      {/* pusula */}
      {!compact && (
        <g transform="translate(548 52)" opacity="0.55">
          <circle r="22" fill="none" stroke="#7fdce6" strokeOpacity="0.5" />
          <path d="M0 -18 L5 0 L0 18 L-5 0Z" fill="#7fdce6" fillOpacity="0.35" />
          <path d="M0 -18 L5 0 L-5 0Z" fill="#ffffff" />
          <text y="-27" textAnchor="middle" fontSize="10" fontWeight="700" fill="#ffffff">N</text>
        </g>
      )}
      {/* rota */}
      <path d={d} fill="none" stroke="#1bb4c4" strokeOpacity="0.25" strokeWidth={compact ? 10 : 8} strokeLinecap="round" />
      <path d={d} fill="none" stroke="#7fdce6" strokeWidth={compact ? 3.5 : 2.5} strokeDasharray="2 9" strokeLinecap="round" className="route-dash" />
      {/* duraklar */}
      {pts.map(([x, y], i) => {
        const end = i === 0 || (!closed && i === pts.length - 1);
        const showLabel = !compact || end;
        // tek yön: durak çizginin tepesindeyse yazı üstte, çukurundaysa altta
        const prev = pts[i - 1]?.[1] ?? y, next = pts[i + 1]?.[1] ?? y;
        const above = i === 0 || i === pts.length - 1 ? y < H / 2 + 12 : y <= (prev + next) / 2;
        let lx = x, ly = y + (above ? -18 : 30), anchor: "middle" | "start" | "end" = "middle";
        if (closed) {
          const dx = x - W / 2, dy = y - H / 2 - 10;
          const len = Math.hypot(dx, dy) || 1;
          lx = x + (dx / len) * 26; ly = y + (dy / len) * 24 + 5;
          anchor = Math.abs(dx) < 60 ? "middle" : dx > 0 ? "start" : "end";
        } else if (compact) {
          ly = y + (above ? -22 : 38);
        }
        lx = Math.max(anchor === "end" ? 60 : 8, Math.min(anchor === "start" ? W - 60 : W - 8, lx));
        return (
          <g key={i}>
            {end ? (
              <>
                <circle cx={x} cy={y} r={compact ? 15 : 12} fill="#1bb4c4" fillOpacity="0.25" className="route-pulse" style={{ transformOrigin: `${x}px ${y}px` }} />
                <circle cx={x} cy={y} r={compact ? 10 : 8} fill="#ffffff" />
                <circle cx={x} cy={y} r={compact ? 5 : 4} fill="#1bb4c4" />
              </>
            ) : (
              <>
                <circle cx={x} cy={y} r={compact ? 9 : 10} fill="#06264b" stroke="#ffffff" strokeWidth="2" />
                {!compact && <text x={x} y={y + 3.5} textAnchor="middle" fontSize="10" fontWeight="700" fill="#ffffff">{i + 1}</text>}
              </>
            )}
            {showLabel && (
              <text x={lx} y={ly} textAnchor={anchor} fontSize={fs} fontWeight="700" fill="#ffffff" stroke="#06264b" strokeWidth="4" strokeOpacity="0.55" paintOrder="stroke" style={{ letterSpacing: "0.01em" }}>
                {stops[i]}
              </text>
            )}
          </g>
        );
      })}
      {/* yelkenli */}
      {stops.length > 1 && (
        <g>
          <g transform={compact ? "scale(1.3)" : undefined}>
            <path d="M-11 4 L11 4 L7 10 L-7 10Z" fill="#ffffff" />
            <path d="M0 2 L0 -20 L10 1Z" fill="#ffffff" />
            <path d="M-1.5 1 L-1.5 -15 L-9 1Z" fill="#7fdce6" />
          </g>
          <animateMotion dur={`${Math.max(10, stops.length * 2.4)}s`} repeatCount="indefinite" path={d} />
        </g>
      )}
    </svg>
  );
}
