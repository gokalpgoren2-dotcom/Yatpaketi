// Menü için küçük çizgi ikonlar. Tek renk (currentColor), aynı çizgi kalınlığı.
const hull = "M3 16.5h18l-3 3.5H6z";

const ICONS: Record<string, React.ReactNode> = {
  all: <><path d="M2 8.5c2.5-2.2 4.5-2.2 7 0s4.5 2.2 7 0 4-2 6-.4" /><path d="M2 14c2.5-2.2 4.5-2.2 7 0s4.5 2.2 7 0 4-2 6-.4" /><path d="M2 19.5c2.5-2.2 4.5-2.2 7 0s4.5 2.2 7 0 4-2 6-.4" /></>,
  gulet: <><path d={hull} /><path d="M9 16.5V4M15.5 16.5V6.5" /><path d="M9 5.5L4.5 14.5H9M15.5 8L11.5 14.5h4" /></>,
  motoryat: <><path d={hull} /><path d="M7 16.5l2-4.5h6.5l2.5 4.5" /><path d="M11 14h3" /><path d="M12 12V9.5" /></>,
  katamaran: <><path d="M3 13.5h18" /><path d="M4.5 13.5v3.5l1.5 2.5h3l1-2.5v-3.5M14 13.5v3.5l1 2.5h3l1.5-2.5v-3.5" /><path d="M12 13.5V4" /><path d="M12 5l5.5 8H12" /></>,
  yelkenli: <><path d={hull} /><path d="M12 16.5V3" /><path d="M12 4.5l6 11h-6M11 7L5.5 15.5H11" /></>,
  gunluk: <><circle cx="17.5" cy="7" r="2.8" /><path d={hull} /><path d="M10.5 16.5v-8l-4.5 8z" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></>,
  pin: <><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0113 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.3" /></>,
  route: <><circle cx="5.5" cy="18" r="2" /><circle cx="18.5" cy="6" r="2" /><path d="M7.5 18h6a3.5 3.5 0 000-7h-3a3.5 3.5 0 010-7h6" /></>,
  package: <><path d="M3.5 8l8.5-4.5L20.5 8v8.5L12 21l-8.5-4.5z" /><path d="M3.5 8L12 12.5 20.5 8M12 12.5V21" /></>,
  process: <><path d="M9 6h11M9 12h11M9 18h11" /><path d="M3.5 6l1.2 1.2L6.8 5M3.5 12l1.2 1.2L6.8 11M3.5 18l1.2 1.2L6.8 17" /></>,
  book: <><path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V19c-2.500-1-5.500-1-8 .5-2.500-1.500-5.500-1.500-8-.5z" /><path d="M12 6v13.5" /></>,
  about: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5" /><circle cx="12" cy="7.8" r="0.6" /></>,
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
