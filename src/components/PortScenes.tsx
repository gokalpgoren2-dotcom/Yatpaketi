import type { ReactNode } from "react";

// Limanlara özel çizimler (fotoğraflardan esinlenen sadeleştirilmiş sahneler). 800x400 kutusunda çizilir.
function rnd(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; };
}
function Dots({ k, n, x, y, w, h, r0, r1, colors, op = 1 }: { k: string; n: number; x: number; y: number; w: number; h: number; r0: number; r1: number; colors: string[]; op?: number }) {
  const r = rnd(k);
  return <>{Array.from({ length: n }, (_, i) => <circle key={i} cx={x + r() * w} cy={y + r() * h} r={r0 + r() * (r1 - r0)} fill={colors[Math.floor(r() * colors.length)]} opacity={op} />)}</>;
}
function Sailboat({ x, y, s = 1, hull = "#fff" }: { x: number; y: number; s?: number; hull?: string }) {
  return <g transform={`translate(${x} ${y}) scale(${s})`}><path d="M0 -34 V4 H-18Z" fill="#fff" /><path d="M3 -28 V4 H16Z" fill="#eef4f7" /><path d="M-20 5 H18 L13 11 H-15Z" fill={hull} stroke="#06264b" strokeOpacity=".25" /></g>;
}
function Gulet({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="12" rx="40" ry="3" fill="#06264b" opacity=".25" />
      <path d="M-38 0 H38 L28 12 H-30Z" fill="#8a5a33" /><path d="M-38 0 H38" stroke="#fff" strokeWidth="2" />
      <rect x="-18" y="-9" width="30" height="9" rx="2" fill="#fff" />
      <path d="M-26 0 V-40 H-14Z M10 0 V-36 L26 0Z" fill="#fff" opacity=".95" />
    </g>
  );
}

const Defs = ({ id, children }: { id: string; children: ReactNode }) => <defs>{children}</defs>;

function Gocek() {
  return (
    <g>
      <Defs id="g"><linearGradient id="gc-w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#58d4c2" /><stop offset="1" stopColor="#1b9aa8" /></linearGradient></Defs>
      <rect width="800" height="400" fill="#2d6a3d" />
      <Dots k="gc-t" n={150} x={0} y={0} w={800} h={200} r0={14} r1={34} colors={["#2a6a3a", "#3a7d44", "#23583a", "#4a8c4a"]} />
      <Dots k="gc-t2" n={40} x={0} y={40} w={800} h={130} r0={10} r1={22} colors={["#6aa84f", "#5b9a48"]} op={0.6} />
      <path d="M0 400V250Q30 214 100 222Q160 232 230 262L260 400Z" fill="#c8956b" /><path d="M0 330Q80 300 190 340L200 400H0Z" fill="#a8744b" />
      <rect y="205" width="800" height="195" fill="url(#gc-w)" />
      <path d="M0 232Q100 205 240 258L220 290H0Z" fill="#d6a273" />
      <g fill="#aeb0a8"><path d="M235 276V212Q260 196 290 205V232L330 238V196L360 206L388 200V246L420 236V198L452 212L484 214V282L452 290V250L428 258V300H396V262L360 268V292H322V250L290 256V290Z" /></g>
      <g fill="#7f8179"><path d="M290 232V290H322V250Z M396 246V300H428V258Z" opacity=".55" /><rect x="262" y="236" width="14" height="8" /></g>
      <path d="M235 290H484V312H235Z" fill="#fff" opacity=".18" />
      <path d="M560 264V232L580 226L602 236V268L588 280H560Z" fill="#b5b7ae" />
      <path d="M800 0L520 120M800 0L560 60M800 0L600 150M800 0L640 20M800 0L520 70M800 0L700 190" stroke="#3f8f45" strokeWidth="6" strokeLinecap="round" />
      <path d="M800 0L520 120M800 0L600 150M800 0L700 190" stroke="#7bc06b" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function Fethiye() {
  return (
    <g>
      <defs><linearGradient id="ft-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#bfe3f0" /><stop offset="1" stopColor="#e9f4ee" /></linearGradient><linearGradient id="ft-l" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#35c9cf" /><stop offset="1" stopColor="#0f8fb0" /></linearGradient></defs>
      <rect width="800" height="400" fill="url(#ft-s)" />
      <path d="M0 110L90 60L180 96L300 40L420 90L560 50L700 100L800 70V400H0Z" fill="#3f6f55" />
      <rect y="170" width="800" height="230" fill="#0a74b8" />
      <path d="M0 400V150Q120 130 290 168Q430 190 510 214Q560 190 620 174Q740 156 800 170V400Z" fill="#1c96c9" />
      <path d="M330 400Q240 250 90 215Q-10 190 0 260V400Z" fill="#0c78b9" opacity=".0" />
      <path d="M0 232Q70 120 240 130Q380 136 470 200Q500 215 560 214L520 190Q420 118 260 112Q60 106 0 200Z" fill="#3b7a3b" />
      <Dots k="ft-p" n={110} x={20} y={118} w={440} h={96} r0={6} r1={14} colors={["#2f6b34", "#3f8a3b", "#53993f"]} />
      <path d="M560 214Q640 168 800 176V300Q700 250 640 270Q590 285 560 214Z" fill="url(#ft-l)" />
      <path d="M470 205Q560 215 600 300Q640 380 520 400H430Q560 370 530 290Q510 240 470 205Z" fill="#f0d9a8" /><path d="M470 205Q560 215 600 300Q640 380 520 400" stroke="#fff" strokeWidth="4" fill="none" opacity=".5" />
      <path d="M0 400V330Q60 300 130 330Q200 360 250 400Z" fill="#35b6d5" opacity=".6" />
      <Dots k="ft-t" n={90} x={560} y={330} w={240} h={70} r0={4} r1={9} colors={["#c9532f", "#e0703b", "#e8a05a", "#d94b2b"]} />
      <path d="M640 180L800 80V250Q740 230 700 250Z" fill="#6b5a3b" opacity=".0" />
      <Sailboat x={560} y={290} s={0.9} /><Sailboat x={620} y={260} s={0.7} /><Sailboat x={300} y={330} s={0.8} />
    </g>
  );
}

function Bodrum() {
  return (
    <g>
      <defs><linearGradient id="bd-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0a2fa3" /><stop offset="1" stopColor="#2f78d3" /></linearGradient></defs>
      <rect width="800" height="400" fill="url(#bd-s)" />
      <path d="M180 190L300 168L420 184L520 170L620 192H180Z" fill="#6c8fb5" opacity=".7" /><path d="M420 196Q500 168 560 190Q600 196 640 198Z" fill="#d6a470" />
      <path d="M170 190H800V400H170Z" fill="#0b4a8c" /><path d="M300 250Q520 220 800 290V400H300Z" fill="#0f6aa0" /><path d="M440 400Q520 330 640 320L800 330V400Z" fill="#2aa7b3" opacity=".8" />
      <path d="M0 400V170L150 188Q240 200 280 250L340 320Q440 360 480 400Z" fill="#3a7a35" />
      <Dots k="bd-t" n={60} x={0} y={170} w={300} h={200} r0={10} r1={26} colors={["#2f7a3a", "#4a9a40", "#3c8a3a"]} />
      <g><rect x="0" y="130" width="210" height="46" fill="#f4f6f8" /><rect x="40" y="108" width="80" height="30" fill="#fff" /><rect x="130" y="118" width="70" height="20" fill="#e7edf3" /><rect x="0" y="176" width="120" height="14" fill="#c97a3b" /></g>
      <path d="M0 420V330L120 300Q300 270 470 340Q520 360 560 400Z" fill="#e8ebee" /><path d="M0 340Q40 310 120 320L260 330Q300 360 280 400H0Z" fill="#fff" />
      <g fill="#fff"><rect x="150" y="300" width="60" height="24" rx="12" /><rect x="300" y="326" width="60" height="22" rx="11" /><rect x="400" y="350" width="60" height="22" rx="11" /></g>
      <path d="M90 300H210L190 260H110Z" fill="#d8742c" /><path d="M270 400H430L400 345H300Z" fill="#d8742c" />
      <rect x="745" y="170" width="55" height="250" fill="#f6f8fa" /><rect x="745" y="270" width="55" height="8" fill="#2f6fc1" /><rect x="745" y="170" width="55" height="26" fill="#a6d4ec" />
      <Dots k="bd-b1" n={120} x={600} y={0} w={200} h={210} r0={10} r1={22} colors={["#e2189a", "#c9188b", "#f0449f"]} />
      <Dots k="bd-b2" n={110} x={0} y={310} w={230} h={90} r0={9} r1={20} colors={["#e2189a", "#c9188b", "#f0449f"]} />
      <path d="M800 0Q720 100 760 210" stroke="#3a7a35" strokeWidth="5" fill="none" /><Gulet x={560} y={288} s={0.5} />
    </g>
  );
}

function Datca() {
  return (
    <g>
      <defs><linearGradient id="dt-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#25c3e8" /><stop offset="1" stopColor="#8fe1f2" /></linearGradient></defs>
      <rect width="800" height="400" fill="url(#dt-s)" />
      <g fill="#fff" opacity=".95"><ellipse cx="90" cy="40" rx="70" ry="20" /><ellipse cx="320" cy="40" rx="120" ry="22" /><ellipse cx="500" cy="70" rx="80" ry="18" /><ellipse cx="690" cy="30" rx="90" ry="18" /><ellipse cx="200" cy="90" rx="90" ry="14" /><ellipse cx="760" cy="110" rx="50" ry="12" /></g>
      <path d="M220 190L330 120L380 98L470 118L620 170L800 180V200H220Z" fill="#6d6a63" /><path d="M300 150L380 98L470 118L560 150L470 200H300Z" fill="#8a7f74" /><path d="M380 98L420 140L330 190Z" fill="#4f5c58" opacity=".6" />
      <path d="M0 196L800 190V215H0Z" fill="#1d3a2f" /><rect y="210" width="800" height="190" fill="#0a63a8" /><path d="M0 400V300Q250 270 500 340L520 400Z" fill="#169bc4" />
      <path d="M410 250Q470 238 520 250L580 270L620 300L580 316L440 300Z" fill="#c9b79a" /><Dots k="dt-p" n={22} x={420} y={226} w={140} h={46} r0={6} r1={12} colors={["#2f7a3a", "#4a9a40"]} />
      <g><rect x="470" y="222" width="46" height="22" fill="#fff" /><rect x="560" y="236" width="30" height="20" fill="#fff" /><rect x="470" y="222" width="46" height="5" fill="#c8602a" /></g>
      <path d="M0 270H150L200 262L240 290L170 312H0Z" fill="#f2ede4" /><g fill="#fff"><rect x="6" y="240" width="40" height="30" /><rect x="52" y="248" width="36" height="22" /><rect x="96" y="236" width="40" height="30" /></g><g fill="#d16f35"><rect x="6" y="240" width="40" height="5" /><rect x="96" y="236" width="40" height="5" /></g>
      <path d="M150 310Q300 300 420 342L330 346Q220 330 140 330Z" fill="#fff" opacity=".12" /><Sailboat x={250} y={300} s={0.7} /><Sailboat x={300} y={306} s={0.7} /><Gulet x={340} y={330} s={0.7} />
      <path d="M0 400V350Q120 330 280 370L380 400Z" fill="#8f9e45" /><path d="M0 400V380Q160 350 300 400Z" fill="#c9a645" />
      <Dots k="dt-o" n={40} x={0} y={330} w={420} h={70} r0={10} r1={22} colors={["#4b7a3b", "#5d8c44", "#2f5f36"]} />
      <rect x="390" y="320" width="150" height="80" fill="#fff" /><rect x="390" y="320" width="150" height="12" fill="#d66b30" />
    </g>
  );
}

function Kas() {
  return (
    <g>
      <defs><linearGradient id="ks-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6c63b8" /><stop offset=".55" stopColor="#f08f7b" /><stop offset="1" stopColor="#ffb25b" /></linearGradient><linearGradient id="ks-w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f89a5a" /><stop offset="1" stopColor="#2b5a86" /></linearGradient></defs>
      <rect width="800" height="400" fill="url(#ks-s)" />
      <g fill="#fff" opacity=".35"><ellipse cx="560" cy="60" rx="160" ry="8" /><ellipse cx="650" cy="110" rx="120" ry="7" /><ellipse cx="420" cy="140" rx="100" ry="6" /></g>
      <circle cx="710" cy="225" r="26" fill="#ffd27a" /><circle cx="710" cy="225" r="70" fill="#ffd27a" opacity=".3" />
      <path d="M0 0H190L330 90L470 140L640 200L800 215V230H0Z" fill="#2c4a45" /><path d="M560 215L640 200L800 222V232H560Z" fill="#4a4a6a" />
      <rect y="228" width="800" height="172" fill="url(#ks-w)" />
      <path d="M708 238v150M698 262v120M718 262v120" stroke="#ffd27a" strokeWidth="4" opacity=".6" />
      <path d="M0 400V120L120 70L300 150L420 214L560 290L420 300L300 360Z" fill="#355a3f" />
      <g>{Array.from({ length: 22 }, (_, i) => { const r = rnd("ks" + i); const x = 20 + (i % 8) * 38 + r() * 12; const y = 110 + Math.floor(i / 8) * 34 + (i % 8) * 8 + r() * 8; return <g key={i}><rect x={x} y={y} width="30" height="20" fill="#f6efe6" /><rect x={x - 2} y={y - 7} width="34" height="8" fill="#b8442c" /></g>; })}</g>
      <path d="M0 400V300Q140 270 300 320L420 400Z" fill="#c89a6a" /><Dots k="ks-l" n={46} x={0} y={310} w={330} h={90} r0={2} r1={4} colors={["#ffd27a", "#ffe9a8", "#ffbd59"]} />
      <path d="M290 320L420 270L600 262L740 288L620 330L420 390Z" fill="#26527f" opacity=".0" />
      <Gulet x={440} y={320} s={1.1} /><Gulet x={560} y={286} s={0.8} /><Sailboat x={640} y={268} s={0.6} /><Sailboat x={680} y={262} s={0.5} />
    </g>
  );
}

function Selimiye() {
  return (
    <g>
      <defs><linearGradient id="sl-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1f7be0" /><stop offset="1" stopColor="#7fc3ee" /></linearGradient><linearGradient id="sl-w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1b8fd0" /><stop offset=".5" stopColor="#37cbc2" /><stop offset="1" stopColor="#42d2a8" /></linearGradient></defs>
      <rect width="800" height="400" fill="url(#sl-s)" />
      <path d="M0 150L120 110L260 124L380 100L520 130L640 118L800 140V200H0Z" fill="#8b9a5a" /><path d="M420 150L560 120L800 150V200H420Z" fill="#c8a977" /><path d="M0 170L200 140L380 170V200H0Z" fill="#5f8a45" />
      <Dots k="sl-b" n={40} x={0} y={140} w={420} h={60} r0={8} r1={16} colors={["#4a7a3a", "#5f8f40", "#386a3a"]} />
      <g><rect x="150" y="128" width="120" height="44" fill="#f4f1ea" /><rect x="150" y="124" width="120" height="8" fill="#c8602a" /><rect x="250" y="150" width="90" height="30" fill="#f4f1ea" /><rect x="250" y="146" width="90" height="7" fill="#c8602a" /></g>
      <rect y="195" width="800" height="205" fill="url(#sl-w)" />
      <path d="M0 220V190L420 196Q520 200 600 212L0 262Z" fill="#cfc5b3" /><path d="M0 250L430 204L560 214L0 300Z" fill="#a89c88" opacity=".7" />
      <path d="M0 300Q300 250 520 215L800 250V400H0Z" fill="#32c9b3" opacity=".6" />
      <Dots k="sl-p" n={380} x={0} y={260} w={640} h={140} r0={1.5} r1={4.5} colors={["#e9fff6", "#bff5e3", "#7fe0c8", "#c9eee0", "#ffffff"]} op={0.75} />
      <g transform="translate(610 300) rotate(8)"><path d="M-70 -30Q0 -50 80 -34L66 20Q0 36 -56 20Z" fill="#fff" /><path d="M-70 -30Q0 -50 80 -34L76 -22Q0 -38 -66 -20Z" fill="#2562c9" /><rect x="-34" y="-20" width="60" height="16" fill="#e8b35b" /><path d="M-56 20Q0 36 66 20L60 40Q0 54 -48 42Z" fill="#2fa8a0" opacity=".7" /></g>
      <path d="M690 345Q760 390 800 400" stroke="#d9b66a" strokeWidth="4" fill="none" />
      <rect x="300" y="196" width="210" height="10" fill="#fff" opacity=".12" /><Gulet x={430} y={186} s={0.45} />
    </g>
  );
}

function Marmaris() {
  return (
    <g>
      <defs><linearGradient id="mr-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1d86d8" /><stop offset="1" stopColor="#cfe9ee" /></linearGradient><radialGradient id="mr-g" cx="1" cy=".5" r="1"><stop offset="0" stopColor="#fff3b0" stopOpacity=".95" /><stop offset="1" stopColor="#fff3b0" stopOpacity="0" /></radialGradient></defs>
      <rect width="800" height="400" fill="url(#mr-s)" />
      <path d="M0 120L110 60L240 110L360 70L520 130L680 90L800 120V170H0Z" fill="#2f6f45" /><path d="M520 140L640 100L800 130V200H520Z" fill="#6f8a63" /><Dots k="mr-m" n={50} x={0} y={70} w={520} h={100} r0={10} r1={20} colors={["#2c6a3f", "#3f8248", "#245a3a"]} />
      <path d="M0 400V170L260 190L420 250L560 400Z" fill="#0b7f95" /><path d="M0 400V260Q160 250 300 330L360 400Z" fill="#0a5f86" opacity=".7" />
      <path d="M440 160H800V400H560L420 250Z" fill="#efe6d8" /><path d="M420 250L560 400H600L440 230Z" fill="#c9bfa8" />
      <g>{Array.from({ length: 60 }, (_, i) => { const r = rnd("mr" + i); const x = 470 + r() * 320; const y = 170 + r() * 220; if (x < 440 + (y - 160) * 0.7 - 20 && y < 260) return null; return <rect key={i} x={x} y={y} width={16 + r() * 14} height={12 + r() * 10} fill={r() > 0.35 ? "#d4552b" : "#fff"} opacity=".95" />; })}</g>
      <path d="M690 260L800 240V330H700Z" fill="#c9bfa8" opacity=".0" />
      <circle cx="800" cy="130" r="150" fill="url(#mr-g)" />
      <g>{[0, 1, 2, 3, 4].map((i) => <g key={i} transform={`translate(${60 + i * 62} ${196 + i * 24}) rotate(18)`}><rect x="-6" y="-100" width="3" height="100" fill="#f4f0e6" /><rect x="14" y="-84" width="3" height="84" fill="#f4f0e6" /><path d="M-30 0H34L28 14H-24Z" fill="#c95a2b" /><path d="M-24 -4H28V0H-24Z" fill="#f4f0e6" /></g>)}</g>
      <g transform="translate(450 330) rotate(-8)"><path d="M-60 0H70L54 24H-48Z" fill="#c95a2b" /><rect x="-30" y="-12" width="60" height="12" fill="#fff" /><rect x="-4" y="-120" width="3" height="120" fill="#e8e1d2" /></g>
      <g transform="translate(560 372) rotate(-8)"><path d="M-60 0H70L54 24H-48Z" fill="#fff" /><rect x="-30" y="-12" width="60" height="12" fill="#e8edf2" /><rect x="-4" y="-110" width="3" height="110" fill="#e8e1d2" /></g>
    </g>
  );
}

function Cove() {
  return (
    <g>
      <defs><linearGradient id="cv-w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#0b7fc5" /><stop offset="1" stopColor="#0a5fa8" /></linearGradient><radialGradient id="cv-c" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#5fe3d4" /><stop offset="1" stopColor="#2ab5cc" /></radialGradient></defs>
      <rect width="800" height="400" fill="url(#cv-w)" />
      <path d="M0 90Q200 50 420 40L520 0H0Z" fill="#cfe3ee" opacity=".35" />
      <path d="M420 0Q480 40 500 90Q420 110 400 150L330 168L300 100Q340 40 420 0Z" fill="#7a8f6a" opacity=".0" />
      <path d="M350 0H560Q520 40 470 50Q410 40 350 0Z" fill="#6c8a66" /><path d="M340 -10Q420 30 480 60L620 0H340Z" fill="#8aa47a" opacity=".0" />
      <path d="M800 0H440Q470 30 450 70Q420 100 380 130Q350 150 420 175Q500 190 520 240Q540 290 600 300Q680 320 760 330Q780 360 800 400Z" fill="#2f6b3b" />
      <Dots k="cv-t" n={170} x={430} y={20} w={370} h={380} r0={8} r1={18} colors={["#2f6b3b", "#3d7d44", "#27593a", "#4a8a47"]} op={0.95} />
      <path d="M400 150Q380 180 430 190Q500 200 530 250Q560 300 610 305" stroke="#e6d3ae" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M380 170Q470 175 520 240Q560 300 600 310Q640 330 700 330L800 400H520Q420 340 380 250Q340 190 380 170Z" fill="url(#cv-c)" />
      <path d="M520 400Q460 330 420 260Q400 200 380 170" stroke="#b8f2ea" strokeWidth="8" fill="none" opacity=".35" />
      <g fill="#0a5a9a" opacity=".35"><ellipse cx="300" cy="260" rx="60" ry="14" /><ellipse cx="240" cy="310" rx="46" ry="10" /><ellipse cx="360" cy="330" rx="50" ry="10" /></g>
      <Gulet x={440} y={300} s={1.1} /><Sailboat x={470} y={52} s={0.5} /><path d="M20 120Q120 100 220 130" stroke="#fff" strokeWidth="3" fill="none" opacity=".18" />
    </g>
  );
}

const MAP: [string[], () => ReactNode][] = [
  [["gocek"], Gocek], [["fethiye", "oludeniz"], Fethiye], [["bodrum", "gumusluk", "gokova"], Bodrum], [["datca", "knidos"], Datca],
  [["kas", "kekova"], Kas], [["selimiye"], Selimiye], [["marmaris", "icmeler", "turunc"], Marmaris], [["bozburun", "sogut", "ekincik", "dalyan"], Cove],
];
export function sceneFor(slug: string): ReactNode | null {
  const tokens = (slug || "").toLowerCase().split("-");
  for (const [keys, C] of MAP) if (keys.some((k) => tokens.includes(k))) return <C />;
  return null;
}
