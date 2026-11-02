// Kültür sayfası başlığındaki çizim: gün batımında koyda demirli bir gulet, dağlar ve hareketli dalgalar.
const WAVE = (y: number, a = 18) => `M0 ${y} q60 -${a} 120 0${" t120 0".repeat(11)} V400 H0z`; // 1440 genişlik: yarısı kadar kayınca dalga kesintisiz döner

export function GuletScene({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 600 400" role="img" aria-label={label} className="block h-full w-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="gs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b3566" />
          <stop offset="0.55" stopColor="#1d7fa3" />
          <stop offset="0.85" stopColor="#f3c58a" />
          <stop offset="1" stopColor="#f6a96b" />
        </linearGradient>
        <linearGradient id="gs-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1bb4c4" />
          <stop offset="1" stopColor="#06264b" />
        </linearGradient>
        <radialGradient id="gs-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff4d6" />
          <stop offset="0.6" stopColor="#ffd79a" />
          <stop offset="1" stopColor="#ffd79a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="gs-hull" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8a5a34" />
          <stop offset="1" stopColor="#5b3a21" />
        </linearGradient>
      </defs>
      <rect width="600" height="400" fill="url(#gs-sky)" />
      {/* güneş */}
      <circle cx="430" cy="232" r="70" fill="url(#gs-sun)" className="sun-pulse" />
      <circle cx="430" cy="232" r="30" fill="#fff1cf" />
      {/* martılar */}
      <g fill="none" stroke="#06264b" strokeOpacity="0.55" strokeWidth="2" strokeLinecap="round">
        <path d="M120 90 q8 -8 16 0 q8 -8 16 0" />
        <path d="M170 70 q6 -6 12 0 q6 -6 12 0" />
        <path d="M480 110 q6 -6 12 0 q6 -6 12 0" />
      </g>
      {/* dağlar */}
      <path d="M0 250 L70 190 L130 225 L200 160 L290 230 L340 205 L400 245 L600 235 V280 H0Z" fill="#0b4a6e" fillOpacity="0.85" />
      <path d="M0 262 L90 228 L170 252 L250 214 L330 258 L460 236 L540 250 L600 244 V290 H0Z" fill="#06264b" fillOpacity="0.9" />
      {/* çamlar */}
      <g fill="#06264b">
        {[40, 58, 74, 220, 236, 520, 540, 556].map((x, i) => <path key={x} d={`M${x} ${246 - (i % 3) * 4} l7 -22 l7 22z`} />)}
      </g>
      {/* deniz */}
      <rect y="262" width="600" height="138" fill="url(#gs-sea)" />
      <path d="M380 270 h100 M395 282 h70 M410 294 h40" stroke="#fff1cf" strokeOpacity="0.6" strokeWidth="3" strokeLinecap="round" />
      {/* gulet */}
      <g className="boat-bob" style={{ transformBox: "fill-box" }}>
        <g transform="translate(150 196)">
          {/* direkler ve yelkenler */}
          <path d="M120 -150 V70 M205 -110 V70" stroke="#06264b" strokeWidth="4" />
          <path d="M122 -142 L122 60 L196 60Z" fill="#ffffff" />
          <path d="M118 -130 L118 58 L60 58Z" fill="#e8f7f9" />
          <path d="M207 -100 L207 60 L252 60Z" fill="#ffffff" />
          <path d="M100 -150 L300 72" stroke="#06264b" strokeOpacity="0.5" strokeWidth="1.2" />
          {/* gövde */}
          <path d="M0 70 L330 70 Q322 104 290 112 L52 112 Q20 104 0 70Z" fill="url(#gs-hull)" />
          <path d="M6 78 L324 78" stroke="#f3c58a" strokeWidth="3" />
          <path d="M60 52 h150 v18 H60Z" fill="#f7f9fa" />
          <path d="M70 58 h12 M96 58 h12 M122 58 h12 M148 58 h12 M174 58 h12" stroke="#06264b" strokeWidth="5" strokeLinecap="round" />
          <path d="M-12 66 L0 70 M330 70 L352 58" stroke="#5b3a21" strokeWidth="4" strokeLinecap="round" />
          <path d="M338 64 l0 -18 l14 7z" fill="#1bb4c4" />
        </g>
      </g>
      {/* yansıma ve dalgalar */}
      <g className="wave-b" style={{ transformBox: "fill-box" }}><path d={WAVE(330, 10)} fill="#ffffff" fillOpacity="0.12" /></g>
      <g className="wave-a" style={{ transformBox: "fill-box" }}><path d={WAVE(355, 12)} fill="#06264b" fillOpacity="0.45" /></g>
    </svg>
  );
}
