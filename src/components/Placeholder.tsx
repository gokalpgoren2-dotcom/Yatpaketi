// Gerçek fotoğraflar admin panelinden yüklenene kadar kullanılan çizim: renkli deniz zemini, güneş ve dalga.
export function Placeholder({ hue, className = "", label = true }: { hue: number; className?: string; label?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(160deg, hsl(${hue} 75% 62%) 0%, hsl(${hue + 12} 80% 38%) 55%, hsl(${hue + 22} 85% 20%) 100%)` }}
      aria-hidden
    >
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/25 blur-xl" />
      <svg className="absolute inset-x-0 bottom-0 w-full" viewBox="0 0 400 80" preserveAspectRatio="none">
        <path d="M0 40c50-26 100-26 150 0s100 26 150 0 70-18 100-8v48H0z" fill="rgba(255,255,255,0.14)" />
        <path d="M0 58c60-20 110-20 170 0s110 20 230-6v28H0z" fill="rgba(6,38,75,0.28)" />
      </svg>
      {label && <span className="absolute bottom-2 right-3 text-[11px] uppercase tracking-wider text-white/60">Fotoğraf</span>}
    </div>
  );
}
