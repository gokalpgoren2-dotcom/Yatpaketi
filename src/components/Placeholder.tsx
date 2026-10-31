// Gerçek fotoğraflar admin panelinden yüklenene kadar renkli yer tutucu.
export function Placeholder({ hue, className = "", label = true }: { hue: number; className?: string; label?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${hue + 20} 80% 22%))` }}
      aria-hidden
    >
      {label && <span className="absolute bottom-2 right-3 text-[11px] uppercase tracking-wider text-white/55">Fotoğraf</span>}
    </div>
  );
}
