"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AISLES, DESKS, ENTRANCE, GRID, LINK_CORRIDOR_X, MASTER_CORRIDOR_X, STATUS_COLOR, STATUS_LABEL, snapToWalkable, visitPoint, walkPath, type DeskLook, type Pt } from "@/shared/office";
import type { AgentId, DeskStatus } from "@/shared/types";

// Görsel katman: izometrik ofis. Durum bilgisini dışarıdan alır, kendi başına iş durumu üretmez.

const HW = 32; // yarım karo genişliği
const HH = 16; // yarım karo yüksekliği
const WALL = 118;

const iso = (x: number, y: number, z = 0): [number, number] => [(x - y) * HW, (x + y) * HH - z];
const pts = (...p: [number, number][]) => p.map(([a, b]) => `${a.toFixed(1)},${b.toFixed(1)}`).join(" ");

function Box({ x, y, w, d, h, z = 0, top, left, right }: { x: number; y: number; w: number; d: number; h: number; z?: number; top: string; left: string; right: string }) {
  return (
    <>
      <polygon points={pts(iso(x, y + d, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x, y + d, z + h))} fill={left} />
      <polygon points={pts(iso(x + w, y, z), iso(x + w, y + d, z), iso(x + w, y + d, z + h), iso(x + w, y, z + h))} fill={right} />
      <polygon points={pts(iso(x, y, z + h), iso(x + w, y, z + h), iso(x + w, y + d, z + h), iso(x, y + d, z + h))} fill={top} />
    </>
  );
}

function Hair({ d }: { d: DeskLook }) {
  const c = d.hair;
  switch (d.hairStyle) {
    case "long":
      return (
        <>
          <path d="M-11,-44 Q-13,-58 0,-57 Q13,-58 11,-44 L12,-28 Q8,-26 7,-34 L7,-46 Q0,-52 -7,-46 L-7,-34 Q-8,-26 -12,-28 Z" fill={c} />
        </>
      );
    case "bun":
      return (
        <>
          <circle cx="0" cy="-58" r="5" fill={c} />
          <path d="M-10.5,-44 Q-12,-56 0,-55.5 Q12,-56 10.5,-44 Q6,-51 0,-50 Q-6,-51 -10.5,-44 Z" fill={c} />
        </>
      );
    case "curly":
      return (
        <g fill={c}>
          {[[-8, -50], [-3, -54], [3, -54], [8, -50], [-10, -45], [10, -45], [0, -52]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="4.6" />
          ))}
        </g>
      );
    case "bald":
      return <path d="M-10,-43 Q-11,-47 -9,-49 M10,-43 Q11,-47 9,-49" stroke={c} strokeWidth="2.4" fill="none" strokeLinecap="round" />;
    case "cap":
      return (
        <>
          <path d="M-10.5,-47 Q-11,-58 0,-58 Q11,-58 10.5,-47 Z" fill="#f5f1e6" />
          <path d="M-12.5,-47 L12.5,-47 L11,-44 L-11,-44 Z" fill="#06264b" />
          <circle cx="0" cy="-52" r="2.2" fill="#f4c95d" />
        </>
      );
    default:
      return <path d="M-10.5,-44 Q-12,-56 0,-55.5 Q12,-56 10.5,-44 Q5,-50 0,-49.5 Q-5,-50 -10.5,-44 Z" fill={c} />;
  }
}

function Extra({ d }: { d: DeskLook }) {
  switch (d.extra) {
    case "glasses":
      return (
        <g fill="rgba(255,255,255,0.25)" stroke="#1c2433" strokeWidth="1">
          <circle cx="-3.8" cy="-43.5" r="3" />
          <circle cx="3.8" cy="-43.5" r="3" />
          <path d="M-0.8,-43.5 L0.8,-43.5" />
        </g>
      );
    case "headset":
      return (
        <g fill="none" stroke="#10151f" strokeWidth="1.8" strokeLinecap="round">
          <path d="M-10.5,-44 Q-11,-57 0,-57 Q11,-57 10.5,-44" />
          <rect x="-12.5" y="-46" width="3.6" height="6.5" rx="1.6" fill="#10151f" stroke="none" />
          <path d="M-10.7,-40 Q-9,-36 -4,-37" strokeWidth="1.2" />
        </g>
      );
    case "tie":
      return <path d="M0,-33 L2.2,-29 L0,-20 L-2.2,-29 Z" fill="#06264b" />;
    case "scarf":
      return <path d="M-8,-35 Q0,-30 8,-35 L8,-31.5 Q0,-26.5 -8,-31.5 Z" fill="#f4c95d" />;
    default:
      return null;
  }
}

/** Oturan ajan: gövdesi masanın arkasında kalır. Yalnızca gerçek "working" durumunda yazar. */
function Avatar({ d, working }: { d: DeskLook; working: boolean }) {
  return (
    <g>
      {d.hairStyle === "long" && <path d="M-11.5,-46 L-12.5,-27 L12.5,-27 L11.5,-46 Z" fill={d.hair} />}
      <path d="M-12,-12 L-12,-28 Q-12,-35 -5,-35 L5,-35 Q12,-35 12,-28 L12,-12 Z" fill={d.shirt} />
      <path d="M-12,-12 L-12,-28 Q-12,-35 -5,-35 L-3,-35 L-6,-12 Z" fill="rgba(0,0,0,0.12)" />
      <rect x="-2.6" y="-37.5" width="5.2" height="4.5" fill={d.skin} />
      <Extra d={d.extra === "tie" || d.extra === "scarf" ? d : { ...d, extra: undefined }} />
      <g className={working ? "ao-typing-l" : undefined}>
        <rect x="-15.5" y="-30" width="5.5" height="13" rx="2.7" fill={d.shirt} />
        <circle cx="-12.8" cy="-16.5" r="2.7" fill={d.skin} />
      </g>
      <g className={working ? "ao-typing-r" : undefined}>
        <rect x="10" y="-30" width="5.5" height="13" rx="2.7" fill={d.shirt} />
        <circle cx="12.8" cy="-16.5" r="2.7" fill={d.skin} />
      </g>
      <circle cx="0" cy="-44" r="10" fill={d.skin} />
      <Hair d={d} />
      <circle cx="-3.8" cy="-43.5" r="1.15" fill="#1c2433" />
      <circle cx="3.8" cy="-43.5" r="1.15" fill="#1c2433" />
      <path d="M-2.8,-39.3 Q0,-37.4 2.8,-39.3" stroke="#8a4b3a" strokeWidth="1" fill="none" strokeLinecap="round" />
      <Extra d={d.extra === "glasses" || d.extra === "headset" ? d : { ...d, extra: undefined }} />
    </g>
  );
}

function Badge({ status }: { status: DeskStatus }) {
  const c = STATUS_COLOR[status];
  if (status === "idle" || status === "cancelled") return null;
  return (
    <g className={status === "approval_required" ? "ao-pulse" : undefined}>
      <circle r="9" fill={c} stroke="#041a35" strokeWidth="1.5" />
      {status === "working" && (
        <g fill="#041a35">
          <circle className="ao-dot ao-dot1" cx="-4" cy="0" r="1.5" />
          <circle className="ao-dot ao-dot2" cx="0" cy="0" r="1.5" />
          <circle className="ao-dot ao-dot3" cx="4" cy="0" r="1.5" />
        </g>
      )}
      {status === "queued" && <path d="M0,-4.5 L0,0 L3,2" stroke="#041a35" strokeWidth="1.7" fill="none" strokeLinecap="round" />}
      {status === "approval_required" && <path d="M0,-5 L0,1 M0,4 L0,4.4" stroke="#041a35" strokeWidth="2.2" strokeLinecap="round" />}
      {status === "completed" && <path d="M-4,0 L-1,3.2 L4.5,-3.2" stroke="#041a35" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      {status === "failed" && <path d="M-3.4,-3.4 L3.4,3.4 M3.4,-3.4 L-3.4,3.4" stroke="#041a35" strokeWidth="2" strokeLinecap="round" />}
    </g>
  );
}

const Desk = memo(function Desk({ d, status, selected, onSelect }: { d: DeskLook; status: DeskStatus; selected: boolean; onSelect: (id: AgentId) => void }) {
  const color = STATUS_COLOR[status];
  const working = status === "working";
  const [cx, cy] = iso(d.gx + 0.8, d.gy + 0.75);
  const [ax, ay] = iso(d.gx + 1.02, d.gy + 0.22);
  const dy = d.gy + 0.55;
  const mx = d.gx + 0.3;
  const screen = pts(iso(mx, dy + 0.12, 27), iso(mx, dy + 0.6, 27), iso(mx, dy + 0.6, 52), iso(mx, dy + 0.12, 52));
  const [nx, ny] = iso(d.gx + 0.16, dy + 0.7, 15.5);
  const label = d.role;
  // Yönetici masasının etiketi, önündeki sıranın arkasında kalmasın diye sağ öne alınır.
  const [lx, ly] = d.id === "master-agent" ? iso(d.gx + 2.45, dy + 0.75) : iso(d.gx + 0.62, dy + 1.28);
  const lw = Math.max(54, label.length * 5.6 + 20);
  const active = status !== "idle" && status !== "cancelled";
  return (
    <g
      className="ao-desk"
      role="button"
      tabIndex={0}
      aria-label={`${d.name}, ${d.role}. Durum: ${STATUS_LABEL[status]}. Masayı aç.`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(d.id);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(d.id);
        }
      }}
    >
      <ellipse cx={cx} cy={cy} rx="60" ry="30" fill="rgba(4,26,53,0.09)" />
      {(active || selected) && (
        <ellipse className={working || status === "approval_required" ? "ao-ring ao-ring-live" : "ao-ring"} cx={cx} cy={cy} rx="64" ry="32" fill="none" stroke={selected && !active ? "#f4efe6" : color} strokeWidth={selected ? 3 : 2.2} />
      )}
      {/* sandalye arkalığı */}
      <Box x={d.gx + 0.74} y={d.gy - 0.02} w={0.56} d={0.12} h={38} top="#12406f" left="#0b3566" right="#082a52" />
      <g transform={`translate(${ax},${ay})`}>
        <Avatar d={d} working={working} />
      </g>
      {/* masa */}
      <Box x={d.gx} y={dy} w={1.6} d={0.7} h={3} z={19} top="#fbf8f1" left="#e3ddcf" right="#cfc8b8" />
      <Box x={d.gx + 0.06} y={dy + 0.06} w={1.48} d={0.58} h={19} top="#e3ddcf" left="#0b3566" right="#082a52" />
      <polygon points={pts(iso(d.gx, dy + 0.7, 19), iso(d.gx + 1.6, dy + 0.7, 19), iso(d.gx + 1.6, dy + 0.7, 17.6), iso(d.gx, dy + 0.7, 17.6))} fill={d.accent} />
      {/* isimlik */}
      <g transform={`matrix(1,0.5,0,1,${nx},${ny})`}>
        <rect x="0" y="0" width="46" height="11" rx="2" fill="#f4efe6" />
        <text x="23" y="8.2" textAnchor="middle" fontSize="7.4" fontWeight="700" fill="#06264b">
          {d.name}
        </text>
      </g>
      {/* monitör */}
      <polygon points={pts(iso(mx + 0.02, dy + 0.33, 22), iso(mx + 0.02, dy + 0.4, 22), iso(mx + 0.02, dy + 0.4, 29), iso(mx + 0.02, dy + 0.33, 29))} fill="#1c2433" />
      <polygon points={pts(iso(mx - 0.03, dy + 0.08, 25), iso(mx - 0.03, dy + 0.64, 25), iso(mx - 0.03, dy + 0.64, 54), iso(mx - 0.03, dy + 0.08, 54))} fill="#10151f" />
      <polygon points={screen} fill={working ? "#0d4f66" : status === "approval_required" ? "#5a3a12" : "#0a1626"} />
      {!working && status !== "approval_required" && <circle cx={iso(mx, dy + 0.56, 30)[0]} cy={iso(mx, dy + 0.56, 30)[1]} r="1" fill="#5b6b85" />}
      {working && (
        <g className="ao-code" stroke={color} strokeWidth="1.5" strokeLinecap="round">
          {[0, 1, 2, 3].map((i) => {
            const a = iso(mx, dy + 0.18, 47 - i * 5);
            const b = iso(mx, dy + 0.18 + 0.14 + ((i * 7) % 3) * 0.1, 47 - i * 5);
            return <line key={i} className={`ao-code-l ao-code-l${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} />;
          })}
        </g>
      )}
      {status === "approval_required" && (
        <text x={iso(mx, dy + 0.36, 34)[0]} y={iso(mx, dy + 0.36, 34)[1]} textAnchor="middle" fontSize="13" fontWeight="800" fill={color}>
          !
        </text>
      )}
      {/* klavye ve kupa */}
      <polygon points={pts(iso(d.gx + 0.7, dy + 0.3, 22.3), iso(d.gx + 1.2, dy + 0.3, 22.3), iso(d.gx + 1.2, dy + 0.48, 22.3), iso(d.gx + 0.7, dy + 0.48, 22.3))} fill="#c9c2b2" />
      <Box x={d.gx + 1.34} y={dy + 0.14} w={0.12} d={0.12} h={6} z={22} top={d.accent} left={d.accent} right={d.accent} />
      {/* etiket */}
      <g transform={`translate(${lx},${ly})`}>
        <rect x={-lw / 2} y="-9" width={lw} height="18" rx="9" fill="rgba(4,26,53,0.88)" stroke={active ? color : "rgba(244,239,230,0.25)"} strokeWidth="1" />
        <circle cx={-lw / 2 + 9} cy="0" r="3" fill={color} />
        <text x={-lw / 2 + 16} y="3.2" fontSize="9" fontWeight="600" fill="#f4efe6">
          {label}
        </text>
        <g transform={`translate(${lw / 2 + 8},-2)`}>
          <Badge status={status} />
        </g>
      </g>
    </g>
  );
});

function Visitor({ pos, moving }: { pos: Pt; moving: boolean }) {
  const [x, y] = iso(pos.x, pos.y);
  return (
    <g transform={`translate(${x},${y})`} pointerEvents="none">
      <ellipse cx="0" cy="0" rx="15" ry="7.5" fill="rgba(27,180,196,0.22)" stroke="#1bb4c4" strokeWidth="1.5" />
      <g className={moving ? "ao-walk" : undefined}>
        <rect x="-6" y="-16" width="5" height="15" rx="2.4" fill="#06264b" />
        <rect x="1" y="-16" width="5" height="15" rx="2.4" fill="#06264b" />
        <path d="M-10,-14 L-10,-30 Q-10,-37 -4,-37 L4,-37 Q10,-37 10,-30 L10,-14 Z" fill="#f4efe6" />
        <path d="M-10,-24 L10,-24 L10,-20 L-10,-20 Z" fill="#1bb4c4" />
        <rect x="-2.4" y="-39.5" width="4.8" height="4" fill="#e2ad84" />
        <circle cx="0" cy="-46" r="9.4" fill="#e2ad84" />
        <path d="M-9.8,-46 Q-11,-57.5 0,-57 Q11,-57.5 9.8,-46 Q5,-52 0,-51.5 Q-5,-52 -9.8,-46 Z" fill="#3b2a20" />
        <circle cx="-3.5" cy="-45.5" r="1.1" fill="#1c2433" />
        <circle cx="3.5" cy="-45.5" r="1.1" fill="#1c2433" />
      </g>
      <g transform="translate(0,-68)">
        <rect x="-14" y="-8" width="28" height="15" rx="7.5" fill="#1bb4c4" />
        <text x="0" y="3" textAnchor="middle" fontSize="8.6" fontWeight="700" fill="#041a35">
          Siz
        </text>
      </g>
    </g>
  );
}

function Plant({ x, y }: { x: number; y: number }) {
  const [px, py] = iso(x + 0.2, y + 0.2, 16);
  return (
    <g pointerEvents="none">
      <Box x={x} y={y} w={0.4} d={0.4} h={16} top="#f4efe6" left="#d8d2c4" right="#c4bdae" />
      <g fill="#2f9e6e">
        <ellipse cx={px} cy={py - 14} rx="7" ry="15" />
        <ellipse cx={px - 9} cy={py - 8} rx="6" ry="12" transform={`rotate(-28 ${px - 9} ${py - 8})`} />
        <ellipse cx={px + 9} cy={py - 8} rx="6" ry="12" transform={`rotate(28 ${px + 9} ${py - 8})`} fill="#3bb37f" />
      </g>
    </g>
  );
}

const Room = memo(function Room() {
  const { cols, rows } = GRID;
  const winX: [number, number][] = [[1, 4.2], [5.4, 9.2], [10.4, 13.2]];
  const winY: [number, number][] = [[5.6, 9.2]];
  return (
    <g pointerEvents="none">
      {/* duvarlar */}
      <polygon points={pts(iso(0, 0), iso(cols, 0), iso(cols, 0, WALL), iso(0, 0, WALL))} fill="url(#ao-wall-r)" />
      <polygon points={pts(iso(0, 0), iso(0, rows), iso(0, rows, WALL), iso(0, 0, WALL))} fill="url(#ao-wall-l)" />
      {winX.map(([a, b], i) => (
        <g key={`wx${i}`}>
          <polygon points={pts(iso(a, 0, 34), iso(b, 0, 34), iso(b, 0, 98), iso(a, 0, 98))} fill="url(#ao-sea)" stroke="#f4efe6" strokeWidth="2.5" />
          <polygon points={pts(iso(a, 0, 34), iso(b, 0, 34), iso(b, 0, 56), iso(a, 0, 56))} fill="rgba(15,149,164,0.75)" />
          <line x1={iso((a + b) / 2, 0, 34)[0]} y1={iso((a + b) / 2, 0, 34)[1]} x2={iso((a + b) / 2, 0, 98)[0]} y2={iso((a + b) / 2, 0, 98)[1]} stroke="#f4efe6" strokeWidth="1.6" />
        </g>
      ))}
      {winY.map(([a, b], i) => (
        <g key={`wy${i}`}>
          <polygon points={pts(iso(0, a, 34), iso(0, b, 34), iso(0, b, 98), iso(0, a, 98))} fill="url(#ao-sea)" stroke="#f4efe6" strokeWidth="2.5" />
          <polygon points={pts(iso(0, a, 34), iso(0, b, 34), iso(0, b, 56), iso(0, a, 56))} fill="rgba(15,149,164,0.75)" />
        </g>
      ))}
      {/* duvar yazısı */}
      <g transform={`matrix(1,-0.5,0,1,${iso(0, 4.6, 88)[0]},${iso(0, 4.6, 88)[1]})`}>
        <text x="0" y="0" fontSize="21" fontWeight="800" fill="#f4efe6" letterSpacing="0.5">
          yatpaketi
        </text>
        <text x="1" y="17" fontSize="10.5" fontWeight="700" fill="#1bb4c4" letterSpacing="3.2">
          AI OFFICE
        </text>
      </g>
      {/* can simidi */}
      <g transform={`translate(${iso(9.8, 0, 70)[0]},${iso(9.8, 0, 70)[1]})`}>
        <ellipse rx="11" ry="12.5" fill="none" stroke="#f4efe6" strokeWidth="5.5" />
        <ellipse rx="11" ry="12.5" fill="none" stroke="#ff7a59" strokeWidth="5.5" strokeDasharray="9.3 9.3" />
      </g>
      {/* zemin */}
      <polygon points={pts(iso(0, 0), iso(cols, 0), iso(cols, rows), iso(0, rows))} fill="url(#ao-floor)" />
      <g stroke="rgba(6,38,75,0.07)" strokeWidth="1">
        {Array.from({ length: cols + 1 }, (_, i) => (
          <line key={`c${i}`} x1={iso(i, 0)[0]} y1={iso(i, 0)[1]} x2={iso(i, rows)[0]} y2={iso(i, rows)[1]} />
        ))}
        {Array.from({ length: rows + 1 }, (_, j) => (
          <line key={`r${j}`} x1={iso(0, j)[0]} y1={iso(0, j)[1]} x2={iso(cols, j)[0]} y2={iso(cols, j)[1]} />
        ))}
      </g>
      {/* zemin kenarı */}
      <polygon points={pts(iso(0, rows), iso(cols, rows), iso(cols, rows, -10), iso(0, rows, -10))} fill="#0b3566" />
      <polygon points={pts(iso(cols, 0), iso(cols, rows), iso(cols, rows, -10), iso(cols, 0, -10))} fill="#082a52" />
      {/* koridor halıları */}
      {AISLES.map((y) => (
        <polygon key={y} points={pts(iso(0.5, y - 0.45), iso(cols - 0.5, y - 0.45), iso(cols - 0.5, y + 0.45), iso(0.5, y + 0.45))} fill="rgba(27,180,196,0.2)" stroke="rgba(27,180,196,0.5)" strokeWidth="1" />
      ))}
      <polygon points={pts(iso(MASTER_CORRIDOR_X - 0.45, 2), iso(MASTER_CORRIDOR_X + 0.45, 2), iso(MASTER_CORRIDOR_X + 0.45, AISLES[0] - 0.45), iso(MASTER_CORRIDOR_X - 0.45, AISLES[0] - 0.45))} fill="rgba(27,180,196,0.12)" />
      <polygon points={pts(iso(LINK_CORRIDOR_X - 0.45, AISLES[0] + 0.45), iso(LINK_CORRIDOR_X + 0.45, AISLES[0] + 0.45), iso(LINK_CORRIDOR_X + 0.45, AISLES[1] - 0.45), iso(LINK_CORRIDOR_X - 0.45, AISLES[1] - 0.45))} fill="rgba(27,180,196,0.12)" />
    </g>
  );
});

const BOUNDS = (() => {
  const xs = [iso(0, GRID.rows)[0], iso(GRID.cols, 0)[0]];
  const top = iso(0, 0, WALL)[1] - 10;
  const bottom = iso(GRID.cols, GRID.rows)[1] + 24;
  return { x: xs[0] - 20, y: top, w: xs[1] - xs[0] + 40, h: bottom - top };
})();

interface View {
  x: number;
  y: number;
  k: number;
}

const clampK = (k: number) => Math.min(3.2, Math.max(0.35, k));
const SPEED = 4.2; // karo/saniye

export function OfficeScene({
  statuses,
  selected,
  onSelect,
  insets,
}: {
  statuses: Record<AgentId, DeskStatus>;
  selected: AgentId | null;
  onSelect: (id: AgentId) => void;
  /** Panellerin kapladığı alan: sahne kalan boşluğa sığdırılır */
  insets: { right: number; bottom: number };
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({ x: 0, y: 0, k: 1 });
  const [ready, setReady] = useState(false);
  const touched = useRef(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ moved: number; pinch?: number }>({ moved: 0 });

  const fit = useCallback(() => {
    const el = wrap.current;
    if (!el) return;
    const w = Math.max(160, el.clientWidth - insets.right);
    const h = Math.max(160, el.clientHeight - insets.bottom - 64);
    const k = clampK(Math.min(w / BOUNDS.w, h / BOUNDS.h) * 0.96);
    setView({ k, x: (w - BOUNDS.w * k) / 2 - BOUNDS.x * k, y: 64 + (h - BOUNDS.h * k) / 2 - BOUNDS.y * k });
    setReady(true);
  }, [insets.right, insets.bottom]);

  useEffect(() => {
    if (!touched.current) fit();
    const el = wrap.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (!touched.current) fit();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fit]);

  const zoomAt = useCallback((px: number, py: number, factor: number) => {
    touched.current = true;
    setView((v) => {
      const k = clampK(v.k * factor);
      const f = k / v.k;
      return { k, x: px - (px - v.x) * f, y: py - (py - v.y) * f };
    });
  }, []);

  // Tekerlek olayı sayfa kaydırmasını engelleyebilsin diye pasif olmayan dinleyici.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * 0.0016));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  // ---- ziyaretçi avatarı ----
  const [pos, setPos] = useState<Pt>(ENTRANCE);
  const [moving, setMoving] = useState(false);
  const posRef = useRef<Pt>(ENTRANCE);
  const route = useRef<Pt[]>([]);
  const raf = useRef(0);

  const walkTo = useCallback((target: Pt) => {
    route.current = walkPath(posRef.current, target);
    if (!route.current.length) return;
    cancelAnimationFrame(raf.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      posRef.current = target;
      setPos(target);
      route.current = [];
      return;
    }
    setMoving(true);
    let last = performance.now();
    const step = (now: number) => {
      let budget = (Math.min(64, now - last) / 1000) * SPEED;
      last = now;
      let p = posRef.current;
      while (budget > 0 && route.current.length) {
        const next = route.current[0];
        const dx = next.x - p.x;
        const dy = next.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist <= budget) {
          p = next;
          budget -= dist;
          route.current.shift();
        } else {
          p = { x: p.x + (dx / dist) * budget, y: p.y + (dy / dist) * budget };
          budget = 0;
        }
      }
      posRef.current = p;
      setPos(p);
      if (route.current.length) raf.current = requestAnimationFrame(step);
      else setMoving(false);
    };
    raf.current = requestAnimationFrame(step);
  }, []);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  // Seçilen masaya yürü (pano üzerinden seçimde de çalışır).
  useEffect(() => {
    if (selected) walkTo(visitPoint(DESKS.find((d) => d.id === selected)!));
  }, [selected, walkTo]);

  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 1) gesture.current = { moved: 0 };
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current.pinch = Math.hypot(a.x - b.x, a.y - b.y);
      gesture.current.moved = 99;
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const cur = { x: e.clientX, y: e.clientY };
    pointers.current.set(e.pointerId, cur);
    if (pointers.current.size === 2 && gesture.current.pinch) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const r = wrap.current!.getBoundingClientRect();
      zoomAt((a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top, d / gesture.current.pinch);
      gesture.current.pinch = d;
      return;
    }
    const dx = cur.x - prev.x;
    const dy = cur.y - prev.y;
    gesture.current.moved += Math.abs(dx) + Math.abs(dy);
    if (gesture.current.moved > 6) {
      touched.current = true;
      if (!wrap.current!.hasPointerCapture(e.pointerId)) wrap.current!.setPointerCapture(e.pointerId);
      setView((v) => ({ ...v, x: v.x + dx, y: v.y + dy }));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) gesture.current.pinch = undefined;
  };

  // Zemine tıklama: ziyaretçiyi en yakın koridor noktasına yürütür.
  const onClick = (e: React.MouseEvent) => {
    if (gesture.current.moved > 6) return;
    const r = wrap.current!.getBoundingClientRect();
    const wx = (e.clientX - r.left - view.x) / view.k;
    const wy = (e.clientY - r.top - view.y) / view.k;
    const gx = (wx / HW + wy / HH) / 2;
    const gy = (wy / HH - wx / HW) / 2;
    if (gx < 0 || gy < 0 || gx > GRID.cols || gy > GRID.rows) return;
    walkTo(snapToWalkable({ x: gx, y: gy }));
  };

  const handleSelect = useCallback(
    (id: AgentId) => {
      if (gesture.current.moved > 6) return;
      onSelect(id);
    },
    [onSelect],
  );

  // Derinlik sıralaması: kameraya uzak olan önce çizilir.
  const entities = useMemo(() => {
    const list: { depth: number; node: React.ReactNode }[] = DESKS.map((d) => ({
      depth: d.gx + d.gy + 1.3,
      node: <Desk key={d.id} d={d} status={statuses[d.id]} selected={selected === d.id} onSelect={handleSelect} />,
    }));
    list.push({ depth: pos.x + pos.y, node: <Visitor key="visitor" pos={pos} moving={moving} /> });
    for (const [x, y] of [[0.3, 0.3], [GRID.cols - 0.7, 0.3], [0.3, GRID.rows - 0.7], [GRID.cols - 0.7, GRID.rows - 0.7], [8.2, 0.9]]) list.push({ depth: x + y + 0.4, node: <Plant key={`p${x}-${y}`} x={x} y={y} /> });
    return list.sort((a, b) => a.depth - b.depth).map((e) => e.node);
  }, [statuses, selected, handleSelect, pos, moving]);

  return (
    <div
      ref={wrap}
      className="ao-scene"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={onClick}
    >
      <svg width="100%" height="100%" role="img" aria-label="Yatpaketi AI Office: sekiz ajan masası olan izometrik ofis" style={{ opacity: ready ? 1 : 0 }}>
        <defs>
          <linearGradient id="ao-floor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f6f2e9" />
            <stop offset="1" stopColor="#e6dfd0" />
          </linearGradient>
          <linearGradient id="ao-wall-r" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0d3a6e" />
            <stop offset="1" stopColor="#0a2f5c" />
          </linearGradient>
          <linearGradient id="ao-wall-l" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#082a52" />
            <stop offset="1" stopColor="#0b3566" />
          </linearGradient>
          <linearGradient id="ao-sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#bfeaf0" />
            <stop offset="0.62" stopColor="#7fd6e0" />
            <stop offset="1" stopColor="#1bb4c4" />
          </linearGradient>
        </defs>
        <g transform={`translate(${view.x},${view.y}) scale(${view.k})`}>
          <Room />
          {entities}
        </g>
      </svg>
      <div className="ao-zoom" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
        <button type="button" aria-label="Yakınlaştır" onClick={() => zoomAt((wrap.current!.clientWidth - insets.right) / 2, wrap.current!.clientHeight / 2, 1.25)}>
          +
        </button>
        <button type="button" aria-label="Uzaklaştır" onClick={() => zoomAt((wrap.current!.clientWidth - insets.right) / 2, wrap.current!.clientHeight / 2, 0.8)}>
          −
        </button>
        <button
          type="button"
          aria-label="Görünümü sığdır"
          onClick={() => {
            touched.current = false;
            fit();
          }}
        >
          ⤢
        </button>
      </div>
    </div>
  );
}
