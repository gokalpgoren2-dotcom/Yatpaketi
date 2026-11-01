// Logodaki açık kutu: içinden sırayla gulet, motor yat ve yelkenli çıkar. Yalnızca çizim ve CSS animasyonu.
const place = "translate(120 170) scale(1.2) translate(-80 -120)";

function Gulet() {
  return (
    <g transform={place}>
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

function Yacht() {
  return (
    <g transform={place}>
      <path d="M84 86 V72" stroke="#cfe7f5" strokeWidth="1.6" />
      <path d="M52 100 L66 86 H100 L108 100 Z" fill="#e6f3fb" />
      <path d="M70 90 H98 L103 98 H66 Z" fill="#2a74ae" />
      <path d="M34 100 H124 L130 106 L118 118 H46 Q38 116 34 100 Z" fill="#ffffff" />
      <path d="M40 106 H124" stroke="#2bb7c4" strokeWidth="2" />
    </g>
  );
}

function Sail() {
  return (
    <g transform={place}>
      <path d="M80 44 V104" stroke="#cfe7f5" strokeWidth="1.6" />
      <path d="M78 46 V102 H46 Z" fill="#ffffff" />
      <path d="M83 56 V102 H112 Z" fill="#b9dcf0" />
      <path d="M38 104 H122 L112 114 Q108 118 100 118 H60 Q52 118 48 114 Z" fill="#ffffff" />
      <path d="M44 108.5 H116" stroke="#2bb7c4" strokeWidth="2" />
    </g>
  );
}

function Boat({ children, delay, first }: { children: React.ReactNode; delay: number; first?: boolean }) {
  return (
    <g clipPath="url(#pk-clip)">
      <g className={`pk-boat${first ? " pk-first" : ""}`} style={{ animationDelay: `${delay}s` }}>
        <g className="pk-sway" style={{ animationDelay: `${delay / 4}s` }}>{children}</g>
      </g>
    </g>
  );
}

export function HeroBoats() {
  return (
    <div className="pointer-events-none absolute bottom-2 left-1/2 -z-10 w-48 -translate-x-1/2 opacity-70 sm:w-56 xl:left-auto xl:right-[5%] xl:w-64 xl:translate-x-0" aria-hidden>
      <svg viewBox="0 0 240 270" className="pk-box w-full overflow-visible">
        <defs>
          <clipPath id="pk-clip"><polygon points="-40,-60 280,-60 280,194 200,194 190,206 142,232 124,236 116,236 98,232 50,206 40,194 -40,194" /></clipPath>
        </defs>
        {/* Su yansıması */}
        <ellipse className="pk-ripple" cx="120" cy="248" rx="86" ry="9" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
        <ellipse cx="120" cy="248" rx="78" ry="7" fill="rgba(255,255,255,0.14)" />

        {/* Arka kapaklar: logodaki gibi dışa açık */}
        <path d="M30 110 L120 72 L112 56 Q74 62 38 86 Z" fill="#17a1b5" />
        <path d="M210 110 L120 72 L128 56 Q166 62 202 86 Z" fill="#128aa0" />
        {/* Kutunun içi */}
        <path d="M30 110 L120 72 L210 110 L120 150 Z" fill="#0b3a6a" />

        {/* Çıkan tekneler (kutunun ön yüzünün arkasından yükselir) */}
        <Boat delay={0} first><Gulet /></Boat>
        <Boat delay={-16}><Yacht /></Boat>
        <Boat delay={-8}><Sail /></Boat>

        <path d="M115 150 H125 V238 H115 Z" fill="#d6f1f5" />
        {/* Ön yüzler: logodaki gibi iki turkuaz panel, arada beyaz aralık */}
        <path d="M28 114 L116 154 V236 Q106 236 98 232 L50 206 Q42 202 40 194 Z" fill="#2cc3d1" />
        <path d="M212 114 L124 154 V236 Q134 236 142 232 L190 206 Q198 202 200 194 Z" fill="#1aa6b9" />
        {/* Ön kenar ışığı */}
        <path d="M34 118 L116 156" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" />
        <path d="M206 118 L124 156" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
