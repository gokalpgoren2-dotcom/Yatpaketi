// Menü için küçük çizgi ikonlar. Tek renk (currentColor), aynı çizgi kalınlığı.
const hull = "M3 16.5h18l-3 3.5H6z";

const ICONS: Record<string, React.ReactNode> = {
  all: <><path d="M2 8.5c2.5-2.2 4.5-2.2 7 0s4.5 2.2 7 0 4-2 6-.4" /><path d="M2 14c2.5-2.2 4.5-2.2 7 0s4.5 2.2 7 0 4-2 6-.4" /><path d="M2 19.5c2.5-2.2 4.5-2.2 7 0s4.5 2.2 7 0 4-2 6-.4" /></>,
  gulet: <><path d={hull} /><path d="M9 16.5V4M15.5 16.5V6.5" /><path d="M9 5.5L4.5 14.5H9M15.5 8L11.5 14.5h4" /></>,
  motoryat: <><path d={hull} /><path d="M7 16.5l2-4.5h6.5l2.5 4.5" /><path d="M11 14h3" /><path d="M12 12V9.5" /></>,
  katamaran: <><path d="M3 13.5h18" /><path d="M4.5 13.5v3.5l1.5 2.5h3l1-2.5v-3.5M14 13.5v3.5l1 2.5h3l1.5-2.5v-3.5" /><path d="M12 13.5V4" /><path d="M12 5l5.5 8H12" /></>,
  yelkenli: <><path d={hull} /><path d="M12 16.5V3" /><path d="M12 4.5l6 11h-6M11 7L5.5 15.5H11" /></>,
  gunluk: <><circle cx="17.5" cy="7" r="2.8" /><path d={hull} /><path d="M10.5 16.5v-8l-4.5 8z" /></>,
  default: <><path d={hull} /><path d="M12 16.5V5" /><path d="M12 6.5l5 8h-5" /></>,
};
ICONS.trawler = ICONS.motoryat;
ICONS["luks-yat"] = ICONS.motoryat;

export function BoatIcon({ name, className = "" }: { name?: string; className?: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>
      {ICONS[name ?? "default"] ?? ICONS.default}
    </svg>
  );
}
