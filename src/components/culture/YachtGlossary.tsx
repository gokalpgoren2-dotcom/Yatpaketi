"use client";

import { useState } from "react";

type Part = "bow" | "stern" | "port" | "starboard" | "deck" | null;
// Sözlükteki kelimeyi yatın bir bölümüyle eşleştirir (Türkçe ve İngilizce).
function partOf(word: string): Part {
  const w = word.toLocaleLowerCase("tr");
  if (/pruva|baş|bow/.test(w)) return "bow";
  if (/pupa|kıç|stern/.test(w)) return "stern";
  if (/sancak|starboard/.test(w)) return "starboard";
  if (/iskele|port\b|^port/.test(w)) return "port";
  if (/güverte|deck/.test(w)) return "deck";
  return null;
}

const HULL = "M150 16 C226 110 246 230 246 360 L244 500 Q242 536 206 538 L94 538 Q58 536 56 500 L54 360 C54 230 74 110 150 16Z";
const DECK = "M150 46 C210 128 228 238 228 360 L226 490 Q224 518 198 520 L102 520 Q76 518 74 490 L72 360 C72 238 90 128 150 46Z";
const BOW = "M150 16 C188 63 214 110 229 156 L71 156 C86 110 112 63 150 16Z";
const STERN = "M55 468 L245 468 L244 500 Q242 536 206 538 L94 538 Q58 536 56 500Z";

// Etkileşimli sözlük: bir kelimeye dokununca yatın ilgili bölümü yanar.
export function YachtGlossary({ items, hint }: { items: string[][]; hint: string }) {
  const [sel, setSel] = useState(0);
  const cur = items[sel] ?? items[0];
  const part = cur ? partOf(cur[0]) : null;
  const labelOf = (p: Part) => items.find(([w]) => partOf(w) === p)?.[0];
  const on = (p: Part) => (part === p ? 1 : 0);
  const tag = (p: Part, x: number, y: number, anchor: "start" | "middle" | "end", rot = 0, dark = false) => {
    const l = labelOf(p);
    if (!l) return null;
    const idx = items.findIndex(([w]) => partOf(w) === p);
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot})`} className="cursor-pointer" onClick={() => setSel(idx)}>
        <text textAnchor={anchor} fontWeight="700" letterSpacing="2" fontSize={dark ? 13 : 15} fill={part === p ? (dark ? "#06264b" : "#1bb4c4") : dark ? "#06264b" : "#ffffff"} fillOpacity={part === p ? 1 : 0.55} style={{ transition: "all .4s" }}>{l.toLocaleUpperCase("tr")}</text>
      </g>
    );
  };
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-10">
      <div className="relative overflow-hidden rounded-[2rem] p-4 lg:p-6" style={{ background: "radial-gradient(120% 80% at 50% 30%, #0d6a86 0%, #06264b 70%)" }}>
        <svg viewBox="-60 -30 420 620" className="mx-auto block h-[26rem] w-auto lg:h-[34rem]" role="img" aria-label={cur ? `${cur[0]}: ${cur[1]}` : hint}>
          <defs>
            <clipPath id="yg-hull"><path d={HULL} /></clipPath>
            <pattern id="yg-plank" width="300" height="12" patternUnits="userSpaceOnUse"><path d="M0 11.5 H300" stroke="#8a5a34" strokeOpacity="0.35" /></pattern>
          </defs>
          {/* su halkaları */}
          {[0, 1, 2].map((k) => <ellipse key={k} cx="150" cy="280" rx={130 + k * 40} ry={300 + k * 30} fill="none" stroke="#7fdce6" strokeOpacity={0.12 - k * 0.03} strokeDasharray="3 10" />)}
          {/* gövde */}
          <path d={HULL} fill="#f7f9fa" />
          <g clipPath="url(#yg-hull)">
            <rect x="0" y="0" width="150" height="560" fill="#1bb4c4" opacity={on("port") * 0.55} style={{ transition: "opacity .4s" }} />
            <rect x="150" y="0" width="150" height="560" fill="#1bb4c4" opacity={on("starboard") * 0.55} style={{ transition: "opacity .4s" }} />
          </g>
          <path d={DECK} fill="#d9b48a" />
          <path d={DECK} fill="url(#yg-plank)" />
          <path d={DECK} fill="#1bb4c4" opacity={on("deck") * 0.7} style={{ transition: "opacity .4s" }} />
          <path d={BOW} fill="#1bb4c4" opacity={on("bow") * 0.85} style={{ transition: "opacity .4s" }} />
          <path d={STERN} fill="#1bb4c4" opacity={on("stern") * 0.85} style={{ transition: "opacity .4s" }} />
          {/* üst yapı */}
          <rect x="104" y="196" width="92" height="176" rx="22" fill="#ffffff" stroke="#06264b" strokeOpacity="0.2" />
          <rect x="116" y="214" width="68" height="40" rx="10" fill="#06264b" fillOpacity="0.85" />
          <circle cx="150" cy="184" r="9" fill="#06264b" />
          <path d="M150 184 L150 60" stroke="#06264b" strokeWidth="2" strokeDasharray="4 4" strokeOpacity="0.5" />
          <rect x="112" y="400" width="76" height="52" rx="14" fill="#ffffff" fillOpacity="0.85" stroke="#06264b" strokeOpacity="0.2" />
          <path d={HULL} fill="none" stroke="#06264b" strokeWidth="3" />
          {/* yön okları */}
          <path d="M150 -14 l-8 12 h16z" fill="#1bb4c4" opacity={0.5 + on("bow") * 0.5} />
          {tag("bow", 150, -18, "middle")}
          {tag("stern", 150, 572, "middle")}
          {tag("port", 22, 300, "middle", -90)}
          {tag("starboard", 282, 300, "middle", 90)}
          {tag("deck", 150, 466, "middle", 0, true)}
        </svg>
        <p className="mt-2 text-center text-xs text-white/50">{hint}</p>
      </div>

      <div>
        <ul className="flex flex-wrap gap-2" role="tablist">
          {items.map(([w], i) => (
            <li key={w}>
              <button type="button" role="tab" aria-selected={sel === i} onClick={() => setSel(i)}
                className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${sel === i ? "bg-navy text-white shadow-lg shadow-navy/20" : "bg-white text-navy ring-1 ring-navy/10 hover:ring-turquoise"}`}>
                {partOf(w) && <span className={`h-2 w-2 rounded-full ${sel === i ? "bg-turquoise" : "bg-turquoise/50"}`} aria-hidden />}
                {w}
              </button>
            </li>
          ))}
        </ul>
        {cur && (
          <div key={sel} className="fade-up mt-6 rounded-[2rem] bg-white p-7 shadow-xl shadow-navy/5 ring-1 ring-navy/5 lg:p-10" role="tabpanel">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-turquoise-dark">{String(sel + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</p>
            <p className="font-display mt-3 text-4xl font-semibold text-navy lg:text-6xl">{cur[0]}</p>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-navy/70">{cur[1]}</p>
            <div className="mt-8 flex gap-2">
              <button type="button" onClick={() => setSel((sel - 1 + items.length) % items.length)} aria-label="←" className="flex h-11 w-11 items-center justify-center rounded-full bg-mist text-navy transition hover:bg-turquoise hover:text-white">←</button>
              <button type="button" onClick={() => setSel((sel + 1) % items.length)} aria-label="→" className="flex h-11 w-11 items-center justify-center rounded-full bg-navy text-white transition hover:bg-turquoise">→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
