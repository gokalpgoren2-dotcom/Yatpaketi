// Üç paket sırayla açılır: biri yelkenli, biri yat, biri gulet çıkarır. Yalnızca çizim ve CSS animasyonu; JavaScript gerekmez.
type Kind = "sail" | "yacht" | "gulet";

function Sail() {
  return (
    <g>
      <path d="M80 44 V104" stroke="#cfe7f5" strokeWidth="1.6" />
      <path d="M78 46 V102 H46 Z" fill="#ffffff" />
      <path d="M83 56 V102 H112 Z" fill="#b9dcf0" />
      <path d="M38 104 H122 L112 114 Q108 118 100 118 H60 Q52 118 48 114 Z" fill="#ffffff" />
      <path d="M44 108.5 H116" stroke="#2bb7c4" strokeWidth="2" />
    </g>
  );
}

function Yacht() {
  return (
    <g>
      <path d="M52 100 L66 86 H100 L108 100 Z" fill="#e6f3fb" />
      <path d="M70 90 H98 L103 98 H66 Z" fill="#2a74ae" />
      <path d="M34 100 H124 L130 106 L118 118 H46 Q38 116 34 100 Z" fill="#ffffff" />
      <path d="M40 106 H124" stroke="#2bb7c4" strokeWidth="2" />
      <path d="M84 86 V74" stroke="#cfe7f5" strokeWidth="1.6" />
    </g>
  );
}

function Gulet() {
  return (
    <g>
      <path d="M62 50 V102 M100 60 V102" stroke="#cfe7f5" strokeWidth="1.6" />
      <path d="M60 52 V98 H36 Z" fill="#ffffff" />
      <path d="M98 62 V98 H76 Z" fill="#dff0fa" />
      <path d="M103 70 L120 98 H103 Z" fill="#b9dcf0" />
      <path d="M54 92 H108 L112 100 H52 Z" fill="#e6f3fb" />
      <path d="M58 94.5 H106" stroke="#2a74ae" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M30 100 H128 Q124 118 106 118 H56 Q38 116 30 100 Z" fill="#12395f" />
      <path d="M36 104.5 H124" stroke="#7fc6e8" strokeWidth="1.6" />
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
      <polygon points="20,70 140,70 134,60 26,60" fill="#0b2f55" />
      {/* Çıkan tekne: kutunun ön yüzünün arkasından yükselir */}
      <g clipPath={`url(#clip-${id})`}>
        <g className="pk-boat" style={d}>
          <g className="pk-sway" style={{ animationDelay: `${delay / 2}s` }}>
            {kind === "sail" ? <Sail /> : kind === "yacht" ? <Yacht /> : <Gulet />}
          </g>
        </g>
      </g>
      {/* Kutu gövdesi */}
      <rect x="20" y="70" width="120" height="60" rx="3" fill="#2a6ea8" />
      <rect x="20" y="70" width="120" height="8" fill="#235d90" />
      <rect x="72" y="70" width="16" height="60" fill="#9fd3ee" />
      <text x="46" y="106" textAnchor="middle" fontSize="10" fontWeight="700" fill="#dff0fa">yat</text>
      <text x="114" y="106" textAnchor="middle" fontSize="10" fontWeight="700" fill="#dff0fa">paketi</text>
      <path d="M26 122 H134" stroke="#1b4f7c" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* Kapaklar */}
      <g className="pk-flap-l" style={d}>
        <rect x="20" y="62" width="60" height="8" rx="1.5" fill="#3a82bd" />
        <rect x="72" y="62" width="8" height="8" fill="#9fd3ee" />
      </g>
      <g className="pk-flap-r" style={d}>
        <rect x="80" y="62" width="60" height="8" rx="1.5" fill="#3a82bd" />
        <rect x="80" y="62" width="8" height="8" fill="#9fd3ee" />
      </g>
    </svg>
  );
}

export function HeroBoats() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-1 -z-10 opacity-45 flex items-end justify-around px-3 sm:px-[8%]" aria-hidden>
      <Package kind="sail" delay={0} id="a" />
      <Package kind="yacht" delay={-5} id="b" />
      <Package kind="gulet" delay={-10} id="c" />
    </div>
  );
}
