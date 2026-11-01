// Üç paket sırayla açılır: biri yelkenli, biri yat, biri gulet çıkarır. Yalnızca çizim ve CSS animasyonu; JavaScript gerekmez.
type Kind = "sail" | "yacht" | "gulet";

function Sail() {
  return (
    <g>
      <path d="M80 50 V106" stroke="#f3e6c8" strokeWidth="2" />
      <path d="M78 52 V104 H50 Z" fill="#ffffff" />
      <path d="M83 62 V104 H110 Z" fill="#ffd9a0" />
      <path d="M42 106 H118 L106 120 H54 Z" fill="#ffffff" />
      <path d="M44 110 H116" stroke="#1bb4c4" strokeWidth="3" />
    </g>
  );
}

function Yacht() {
  return (
    <g>
      <path d="M80 62 V80" stroke="#f3e6c8" strokeWidth="2" />
      <circle cx="80" cy="62" r="2.5" fill="#ffd9a0" />
      <rect x="66" y="78" width="30" height="12" rx="3" fill="#ffffff" />
      <rect x="70" y="81" width="22" height="5" rx="1.5" fill="#1bb4c4" />
      <rect x="52" y="90" width="56" height="16" rx="3" fill="#f4f7fb" />
      <rect x="57" y="94" width="10" height="6" rx="1.5" fill="#1bb4c4" />
      <rect x="71" y="94" width="10" height="6" rx="1.5" fill="#1bb4c4" />
      <rect x="85" y="94" width="10" height="6" rx="1.5" fill="#1bb4c4" />
      <path d="M32 106 H130 L118 120 H46 Z" fill="#ffffff" />
      <path d="M36 111 H126" stroke="#0b4a7d" strokeWidth="3" />
    </g>
  );
}

function Gulet() {
  return (
    <g>
      <path d="M62 54 V104 M100 64 V104" stroke="#8a5a2b" strokeWidth="2.4" />
      <path d="M60 58 V100 H32 Z" fill="#fff3dc" />
      <path d="M98 68 V100 H72 Z" fill="#fff3dc" />
      <path d="M102 76 L124 100 H102 Z" fill="#ffd9a0" />
      <rect x="56" y="94" width="48" height="12" rx="3" fill="#f7e2b8" />
      <rect x="62" y="97" width="8" height="5" rx="1.5" fill="#6b4a25" />
      <rect x="76" y="97" width="8" height="5" rx="1.5" fill="#6b4a25" />
      <rect x="90" y="97" width="8" height="5" rx="1.5" fill="#6b4a25" />
      <path d="M28 96 L132 104 Q124 120 106 120 H54 Q36 118 28 96 Z" fill="#8a5a2b" />
      <path d="M34 104 L128 109" stroke="#e7c27d" strokeWidth="2.5" />
    </g>
  );
}

function Package({ kind, delay, id }: { kind: Kind; delay: number; id: string }) {
  const d = { animationDelay: `${delay}s` };
  return (
    <svg viewBox="0 -24 160 164" className="pk-box w-[28vw] max-w-[9.5rem] overflow-visible sm:max-w-[10.5rem]" style={d} aria-hidden>
      <defs>
        <clipPath id={`clip-${id}`}><rect x="-40" y="-120" width="240" height="248" /></clipPath>
      </defs>
      <ellipse cx="80" cy="134" rx="70" ry="5" fill="rgba(255,255,255,0.22)" />
      {/* Kutunun içi */}
      <polygon points="20,70 140,70 134,60 26,60" fill="#5b3d1b" />
      {/* Çıkan tekne: kutunun ön yüzünün arkasından yükselir */}
      <g clipPath={`url(#clip-${id})`}>
        <g className="pk-boat" style={d}>
          <g className="pk-sway" style={{ animationDelay: `${delay / 2}s` }}>
            {kind === "sail" ? <Sail /> : kind === "yacht" ? <Yacht /> : <Gulet />}
          </g>
        </g>
      </g>
      {/* Kutu gövdesi */}
      <rect x="20" y="70" width="120" height="60" rx="3" fill="#c9a266" />
      <rect x="20" y="70" width="120" height="8" fill="#b88f55" />
      <rect x="72" y="70" width="16" height="60" fill="#ecd7a6" />
      <text x="46" y="106" textAnchor="middle" fontSize="10" fontWeight="700" fill="#5b3d1b">yat</text>
      <text x="114" y="106" textAnchor="middle" fontSize="10" fontWeight="700" fill="#5b3d1b">paketi</text>
      <path d="M26 122 H134" stroke="#a9834b" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* Kapaklar */}
      <g className="pk-flap-l" style={d}>
        <rect x="20" y="62" width="60" height="8" rx="1.5" fill="#d9b678" />
        <rect x="72" y="62" width="8" height="8" fill="#ecd7a6" />
      </g>
      <g className="pk-flap-r" style={d}>
        <rect x="80" y="62" width="60" height="8" rx="1.5" fill="#d9b678" />
        <rect x="80" y="62" width="8" height="8" fill="#ecd7a6" />
      </g>
    </svg>
  );
}

export function HeroBoats() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-1 -z-10 flex items-end justify-around px-3 sm:px-[8%]" aria-hidden>
      <Package kind="sail" delay={0} id="a" />
      <Package kind="yacht" delay={-5} id="b" />
      <Package kind="gulet" delay={-10} id="c" />
    </div>
  );
}
