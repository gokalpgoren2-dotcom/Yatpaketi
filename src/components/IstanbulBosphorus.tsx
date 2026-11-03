import type { Lang } from "@/lib/i18n";

// İstanbul liman sayfası: Boğaz'ın çizim haritası (güneyden kuzeye, solda Marmara sağda Karadeniz),
// yaka yaka simge yapılar, köprüler, örnek tur güzergâhı ve tur seçenekleri.
const W = 1200, H = 420;
const X = (lat: number) => 150 + ((lat - 41.0) / 0.235) * (W - 300);
const Y = (lon: number) => 215 + (lon - 29.06) * 1500;
type P = [number, number];

// Boğaz'ın orta çizgisi (enlem, boylam) – sadeleştirilmiş
const CENTER: P[] = [
  [41.0, 29.0], [41.015, 29.003], [41.03, 29.008], [41.041, 29.025], [41.048, 29.04], [41.058, 29.047], [41.07, 29.047],
  [41.081, 29.058], [41.092, 29.064], [41.105, 29.064], [41.12, 29.066], [41.138, 29.065], [41.155, 29.068], [41.172, 29.083],
  [41.188, 29.098], [41.205, 29.11], [41.235, 29.12],
];
// Boğaz genişliği (px), yer yer daralır
const WIDTH = [120, 90, 74, 62, 56, 54, 56, 46, 44, 58, 66, 70, 64, 58, 70, 100, 150];

const smooth = (pts: [number, number][]) => {
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)} ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
};

const C = CENTER.map(([la, lo]) => [X(la), Y(lo)] as [number, number]);
// Kıyı çizgileri: orta çizgiden yukarı (Avrupa) ve aşağı (Anadolu) genişliğin yarısı kadar
const euro = C.map(([x, y], i) => [x, y - WIDTH[i] / 2] as [number, number]);
const asia = C.map(([x, y], i) => [x, y + WIDTH[i] / 2] as [number, number]);
const waterPath = `${smooth(euro)} L${asia[asia.length - 1][0]} ${asia[asia.length - 1][1]} ${smooth([...asia].reverse()).replace(/^M[^C]+/, "")} Z`;

// Simge yapılar: [ad TR, ad EN, enlem, boylam, yaka]
const PLACES: [string, string, number, number, "eu" | "as"][] = [
  ["Kız Kulesi", "Maiden's Tower", 41.021, 29.004, "as"],
  ["Dolmabahçe Sarayı", "Dolmabahçe Palace", 41.039, 29.0, "eu"],
  ["Ortaköy Camii", "Ortaköy Mosque", 41.047, 29.027, "eu"],
  ["Beylerbeyi Sarayı", "Beylerbeyi Palace", 41.043, 29.042, "as"],
  ["Çengelköy", "Çengelköy", 41.051, 29.052, "as"],
  ["Arnavutköy", "Arnavutköy", 41.067, 29.043, "eu"],
  ["Kuleli", "Kuleli", 41.06, 29.053, "as"],
  ["Bebek", "Bebek", 41.077, 29.044, "eu"],
  ["Rumeli Hisarı", "Rumeli Fortress", 41.085, 29.056, "eu"],
  ["Anadolu Hisarı", "Anadolu Fortress", 41.082, 29.066, "as"],
  ["Kanlıca", "Kanlıca", 41.099, 29.067, "as"],
  ["Emirgan", "Emirgan", 41.103, 29.055, "eu"],
  ["Yeniköy", "Yeniköy", 41.12, 29.07, "eu"],
  ["Tarabya", "Tarabya", 41.137, 29.06, "eu"],
  ["Sarıyer", "Sarıyer", 41.167, 29.057, "eu"],
  ["Anadolu Kavağı", "Anadolu Kavağı", 41.175, 29.09, "as"],
];
const BRIDGES: [string, string, number][] = [
  ["15 Temmuz Şehitler Köprüsü", "15 July Martyrs Bridge", 41.045],
  ["Fatih Sultan Mehmet Köprüsü", "Fatih Sultan Mehmet Bridge", 41.091],
  ["Yavuz Sultan Selim Köprüsü", "Yavuz Sultan Selim Bridge", 41.2],
];

// Merkez çizgide enleme göre y ve genişlik
function at(lat: number): { x: number; y: number; w: number } {
  const x = X(lat);
  for (let i = 0; i < C.length - 1; i++) {
    if (x >= C[i][0] && x <= C[i + 1][0]) {
      const t = (x - C[i][0]) / (C[i + 1][0] - C[i][0]);
      return { x, y: C[i][1] + t * (C[i + 1][1] - C[i][1]), w: WIDTH[i] + t * (WIDTH[i + 1] - WIDTH[i]) };
    }
  }
  return { x, y: C[C.length - 1][1], w: WIDTH[WIDTH.length - 1] };
}

const TOURS = (en: boolean) => [
  { t: en ? "Sunset cruise" : "Gün batımı turu", d: en ? "2–3 hours" : "2–3 saat", x: en ? "Golden hour along the palaces and bridges, with drinks on deck." : "Saraylar ve köprüler boyunca altın saat; güvertede içecek eşliğinde.", i: "M3 17h18M6 17a6 6 0 0112 0M12 4v3M4.9 8.9l2.1 2.1M19.1 8.9 17 11" },
  { t: en ? "Classic Bosphorus" : "Klasik Boğaz turu", d: en ? "3–4 hours" : "3–4 saat", x: en ? "From Kuruçeşme or Bebek up to Rumeli Fortress and back, with a swim stop in summer." : "Kuruçeşme ya da Bebek'ten Rumeli Hisarı'na ve dönüş; yazın yüzme molası.", i: "M4 19c3-2 5-2 8 0s5 2 8 0M7 15V5l5 3 5-3v10" },
  { t: en ? "Up to the Black Sea" : "Karadeniz ağzına", d: en ? "Full day" : "Tam gün", x: en ? "The whole strait to Anadolu Kavağı and the Black Sea entrance, lunch on board." : "Boğaz'ın tamamı, Anadolu Kavağı ve Karadeniz girişi; teknede öğle yemeği.", i: "M3 12h18M14 5l7 7-7 7" },
  { t: en ? "Princes' Islands" : "Adalar turu", d: en ? "Full day" : "Tam gün", x: en ? "Büyükada and Heybeliada coves in the Sea of Marmara." : "Marmara'da Büyükada ve Heybeliada koyları.", i: "M3 18c2-3 5-4 9-4s7 1 9 4M8 14c0-3 2-6 4-8 2 2 4 5 4 8" },
  { t: en ? "Special occasions" : "Özel günler", d: en ? "Tailored" : "Size özel", x: en ? "Birthdays, proposals, anniversaries and corporate events with decoration and catering." : "Doğum günü, evlilik teklifi, yıl dönümü ve kurumsal etkinlik; süsleme ve ikram dahil planlanır.", i: "M12 20s-8-4.5-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 9c0 6.5-8 11-8 11z" },
];

export function IstanbulBosphorus({ lang }: { lang: Lang }) {
  const en = lang === "en";
  // Numaralı işaretler: sıra güneyden kuzeye
  const ordered = [...PLACES].sort((a, b) => a[2] - b[2]);
  const num = (tr: string) => ordered.findIndex((q) => q[0] === tr) + 1;

  const route = [41.03, 41.04, 41.05, 41.06, 41.07, 41.08, 41.088].map((la) => at(la));
  const routeOut = route.map((p) => [p.x, p.y - p.w * 0.18] as [number, number]);
  const routeBack = [...route].reverse().map((p) => [p.x, p.y + p.w * 0.18] as [number, number]);
  return (
    <section className="mt-12">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-turquoise-dark">{en ? "The Bosphorus" : "İstanbul Boğazı"}</p>
      <h2 className="font-display mt-2 text-3xl font-semibold text-navy lg:text-4xl">{en ? "See the city from the water." : "Şehri denizden görün."}</h2>
      <p className="mt-3 max-w-2xl leading-relaxed text-navy/70">
        {en ? "Two continents, three bridges and centuries of palaces, waterside mansions and fortresses along 30 km of water. Here is what you'll pass on a typical Bosphorus cruise." : "İki kıta, üç köprü ve 30 kilometre boyunca saraylar, yalılar ve hisarlar. Tipik bir Boğaz turunda yanından geçeceğiniz yerler:"}
      </p>

      {/* Çizim harita */}
      <div className="no-scrollbar -mx-5 mt-6 overflow-x-auto px-5 lg:mx-0 lg:px-0">
        <div className="min-w-[860px] overflow-hidden rounded-3xl ring-1 ring-navy/10">
          <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={en ? "Illustrated map of the Bosphorus" : "İstanbul Boğazı çizim haritası"}>
            <defs>
              <linearGradient id="ib-land" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#dfe9d8" /><stop offset="1" stopColor="#cfe0c6" /></linearGradient>
              <linearGradient id="ib-sea" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#1d8fb0" /><stop offset="0.5" stopColor="#127fa6" /><stop offset="1" stopColor="#0b5683" /></linearGradient>
              <linearGradient id="ib-sky" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffe3c2" /><stop offset="1" stopColor="#e9f3f6" /></linearGradient>
            </defs>
            <rect width={W} height={H} fill="url(#ib-land)" />
            {/* Marmara ve Karadeniz */}
            <ellipse cx={X(40.99) - 40} cy={Y(29.0) + 30} rx="150" ry="190" fill="url(#ib-sea)" />
            <ellipse cx={X(41.245) + 40} cy={Y(29.12) - 30} rx="150" ry="200" fill="url(#ib-sea)" />
            {/* Boğaz */}
            <path d={waterPath} fill="url(#ib-sea)" />
            <path d={smooth(euro)} fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="2" />
            <path d={smooth(asia)} fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="2" />
            {/* dalgalar */}
            {Array.from({ length: 26 }).map((_, i) => {
              const p = at(41.012 + i * 0.0075);
              return <path key={i} d={`M${p.x - 8} ${p.y + ((i % 3) - 1) * p.w * 0.22} q4 -3 8 0 q4 3 8 0`} stroke="#fff" strokeOpacity="0.35" strokeWidth="1.4" fill="none" strokeLinecap="round" />;
            })}

            {/* yaka adları ve denizler */}
            <text x={X(41.12)} y="42" textAnchor="middle" fontSize="15" letterSpacing="5" fontWeight="700" fill="#06264b" fillOpacity="0.35">{en ? "EUROPEAN SIDE" : "AVRUPA YAKASI"}</text>
            <text x={X(41.12)} y={H - 26} textAnchor="middle" fontSize="15" letterSpacing="5" fontWeight="700" fill="#06264b" fillOpacity="0.35">{en ? "ASIAN SIDE" : "ANADOLU YAKASI"}</text>
            <text x={110} y={Y(29.0) + 120} textAnchor="middle" fontSize="13" letterSpacing="3" fontStyle="italic" fill="#fff" fillOpacity="0.85">{en ? "SEA OF MARMARA" : "MARMARA"}</text>
            <text x={W - 100} y={160} textAnchor="middle" fontSize="13" letterSpacing="3" fontStyle="italic" fill="#fff" fillOpacity="0.85">{en ? "BLACK SEA" : "KARADENİZ"}</text>

            {/* tur güzergâhı */}
            <path d={smooth([...routeOut, ...routeBack])} fill="none" stroke="#fff" strokeWidth="2.4" strokeDasharray="8 7" strokeLinecap="round" />

            {/* köprüler */}
            {BRIDGES.map(([tr, enName, la]) => {
              const p = at(la);
              const top = p.y - p.w / 2 - 16, bot = p.y + p.w / 2 + 16;
              return (
                <g key={tr}>
                  <line x1={p.x} y1={top} x2={p.x} y2={bot} stroke="#06264b" strokeWidth="5" strokeLinecap="round" />
                  <line x1={p.x - 4} y1={top} x2={p.x - 4} y2={top - 14} stroke="#06264b" strokeWidth="3" />
                  <line x1={p.x - 4} y1={bot} x2={p.x - 4} y2={bot + 14} stroke="#06264b" strokeWidth="3" />
                  <path d={`M${p.x - 4} ${top - 14} Q${p.x + 10} ${p.y} ${p.x - 4} ${bot + 14}`} fill="none" stroke="#06264b" strokeOpacity="0.5" strokeWidth="1.4" />
                  <line x1={p.x - 4} y1={top - 16} x2={p.x - 4} y2={84} stroke="#06264b" strokeOpacity="0.35" strokeDasharray="3 3" />
                  <text x={p.x - 4} y={78} textAnchor="middle" fontSize="11" fontWeight="700" fill="#06264b" fillOpacity="0.75">{en ? enName.replace(" Bridge", "") : tr.replace(" Köprüsü", "")}</text>
                </g>
              );
            })}

            {/* simge yapılar: numaralı işaretler (adları haritanın altında) */}
            {PLACES.map(([tr, , la, lo, side]) => {
              const p = at(la);
              const shoreY = side === "eu" ? p.y - p.w / 2 : p.y + p.w / 2;
              const px = X(la), py = la === 41.021 ? Y(lo) : shoreY + (side === "eu" ? -12 : 12);
              return (
                <g key={tr}>
                  <circle cx={px} cy={py} r="11" fill={side === "eu" ? "#06264b" : "#e8453c"} stroke="#fff" strokeWidth="2" />
                  <text x={px} y={py + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">{num(tr)}</text>
                </g>
              );
            })}

            {/* pusula */}
            <g transform={`translate(${W - 70} 60)`}>
              <circle r="22" fill="#fff" fillOpacity="0.85" />
              <path d="M22 0 L-8 -6 L-8 6 Z" fill="#e8453c" />
              <text x="30" y="5" fontSize="12" fontWeight="700" fill="#06264b">K</text>
            </g>
          </svg>
        </div>
      </div>
      <p className="mt-2 text-xs text-navy/45">{en ? "Illustration, not to scale. Dashed line: a typical 3–4 hour route. Lines across the water: the three bridges." : "Çizim, ölçekli değildir. Kesik çizgi: 3–4 saatlik örnek tur güzergâhı. Suyun üzerindeki çizgiler: üç köprü."}</p>

      {/* harita açıklaması */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {(["eu", "as"] as const).map((side) => (
          <div key={side} className="rounded-3xl bg-white p-5 ring-1 ring-navy/10">
            <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${side === "eu" ? "text-navy/60" : "text-[#c0332b]"}`}>{side === "eu" ? (en ? "European side" : "Avrupa yakası") : (en ? "Asian side" : "Anadolu yakası")}</p>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
              {ordered.filter((q) => q[4] === side).map(([tr, enName]) => (
                <li key={tr} className="flex items-center gap-2 text-sm text-navy">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${side === "eu" ? "bg-navy" : "bg-[#e8453c]"}`}>{num(tr)}</span>
                  {en ? enName : tr}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* tur seçenekleri */}
      <div className="no-scrollbar -mx-5 mt-8 flex snap-x gap-4 overflow-x-auto px-5 pb-2 lg:mx-0 lg:grid lg:grid-cols-5 lg:px-0">
        {TOURS(en).map((t) => (
          <article key={t.t} className="w-64 shrink-0 snap-start rounded-3xl bg-white p-5 ring-1 ring-navy/10 transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-navy/10 lg:w-auto">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-turquoise/12 text-turquoise-dark">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={t.i} /></svg>
            </span>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-turquoise-dark">{t.d}</p>
            <h3 className="font-display mt-1 text-lg font-semibold text-navy">{t.t}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-navy/65">{t.x}</p>
          </article>
        ))}
      </div>

      {/* kalkış noktaları */}
      <div className="mt-8 flex flex-wrap items-center gap-2 rounded-3xl bg-navy p-5 text-white lg:p-6">
        <span className="mr-2 text-sm font-semibold">{en ? "Departure points:" : "Kalkış noktaları:"}</span>
        {["Kuruçeşme", "Bebek", "Kabataş", "İstinye", "Ataköy Marina"].map((x) => <span key={x} className="rounded-full bg-white/10 px-3 py-1.5 text-sm ring-1 ring-white/15">{x}</span>)}
        <span className="w-full pt-2 text-xs text-white/60 lg:ml-auto lg:w-auto lg:pt-0">{en ? "Pick-up point depends on the yacht; we'll confirm it with your booking." : "Kalkış noktası yata göre değişir; rezervasyonda netleştiririz."}</span>
      </div>
    </section>
  );
}
