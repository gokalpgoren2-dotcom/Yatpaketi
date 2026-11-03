// İstanbul sayfasının arka planında soluk çizgi çizim: Boğaz köprüsü, Kız Kulesi, cami siluetleri ve dalgalar.
// Renk currentColor; görünürlüğü kullanıldığı yerdeki opaklık belirler.
export function IstanbulSkyline({ className = "" }: { className?: string }) {
  const wave = (y: number, x0: number, n: number, s = 26) =>
    `M${x0} ${y}` + Array.from({ length: n }, () => ` q${s / 2} -${s / 4} ${s} 0`).join("");
  return (
    <svg viewBox="0 0 1200 360" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      {/* tepeler ve evler (arka) */}
      <path d="M0 250 C120 225 200 232 300 214 S440 200 520 214" />
      {[[40, 236], [80, 230], [130, 226], [400, 210], [450, 210]].map(([x, y], i) => (
        <path key={i} d={`M${x} ${y} v-14 l9 -8 l9 8 v14`} strokeWidth="1.4" />
      ))}

      {/* cami: kubbe ve iki minare */}
      <path d="M190 232 v-22 a34 30 0 0 1 68 0 v22" />
      <path d="M206 210 a18 16 0 0 1 36 0" />
      <path d="M224 180 v-8" />
      <path d="M168 232 V150 l4 -14 l4 14 V232" /><path d="M164 176 h16" />
      <path d="M280 232 V150 l4 -14 l4 14 V232" /><path d="M276 176 h16" />

      {/* asma köprü */}
      <path d="M500 268 H1170" />
      <path d="M640 268 V120 M652 268 V120 M640 130 H652 M640 170 H652" />
      <path d="M1000 268 V120 M1012 268 V120 M1000 130 H1012 M1000 170 H1012" />
      <path d="M500 250 Q575 150 640 122" />
      <path d="M652 122 Q826 250 1000 122" />
      <path d="M1012 122 Q1090 160 1170 250" />
      {Array.from({ length: 23 }).map((_, i) => {
        const x = 664 + i * 14.5;
        const t = (x - 652) / 348;
        const y = 122 + 4 * (1 - t) * t * (186 - 122);
        return <path key={i} d={`M${x} ${y.toFixed(1)} V268`} strokeWidth="1" />;
      })}
      {Array.from({ length: 8 }).map((_, i) => {
        const x = 1150 - i * 15;
        return <path key={"r" + i} d={`M${x} ${(250 - (1170 - x) * 0.9).toFixed(1)} V268`} strokeWidth="1" />;
      })}
      {Array.from({ length: 8 }).map((_, i) => {
        const x = 520 + i * 15;
        return <path key={"l" + i} d={`M${x} ${(250 - (x - 500) * 0.9).toFixed(1)} V268`} strokeWidth="1" />;
      })}

      {/* Kız Kulesi (önde, adacık üzerinde) */}
      <path d="M300 318 H420" />
      <path d="M318 318 V282 H404 V318" />
      <path d="M330 282 v-6 h8 v6 M350 282 v-6 h8 v6 M370 282 v-6 h8 v6 M390 282 v-6 h8 v6" strokeWidth="1.4" />
      <path d="M346 282 V222 H378 V282" />
      <path d="M342 222 H382" />
      <path d="M350 222 V206 H374 V222" />
      <path d="M352 206 a10 12 0 0 1 20 0" />
      <path d="M362 194 V160" /><path d="M362 166 l14 5 l-14 5" strokeWidth="1.4" />
      <path d="M356 240 h12 M356 256 h12" strokeWidth="1.4" />

      {/* vapur */}
      <path d="M820 300 h110 l-12 16 h-88 z" />
      <path d="M840 300 v-12 h60 v12 M860 288 v-10 h18 v10" strokeWidth="1.6" />

      {/* martılar */}
      <path d="M520 70 q8 -8 16 0 q8 -8 16 0" strokeWidth="1.6" />
      <path d="M580 96 q6 -6 12 0 q6 -6 12 0" strokeWidth="1.4" />
      <path d="M1080 60 q7 -7 14 0 q7 -7 14 0" strokeWidth="1.4" />

      {/* dalgalar */}
      <path d={wave(296, 20, 10)} strokeWidth="1.4" />
      <path d={wave(330, 460, 12)} strokeWidth="1.4" />
      <path d={wave(346, 40, 9)} strokeWidth="1.4" />
      <path d={wave(318, 960, 9)} strokeWidth="1.4" />
    </svg>
  );
}
