"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Sayfa değişince kısa bir dalga + tekne geçişi gösterir. Yalnızca adres (sayfa) değişince çalışır;
// filtre gibi aynı sayfadaki değişikliklerde, ilk açılışta ve yönetim panelinde çalışmaz.
export function RouteTransition() {
  const path = usePathname();
  const first = useRef(true);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (path.startsWith("/admin")) return;
    setRun((n) => n + 1);
    const t = setTimeout(() => setRun(0), 800);
    return () => clearTimeout(t);
  }, [path]);

  if (run === 0) return null;
  return (
    <div key={run} aria-hidden className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      <div className="route-wipe absolute inset-x-0 top-0 h-[115%]">
        <svg className="absolute -top-6 left-0 h-8 w-full" viewBox="0 0 1200 40" preserveAspectRatio="none">
          <path d="M0 40V20q50-24 100 0t100 0 100 0 100 0 100 0 100 0 100 0 100 0 100 0 100 0 100 0 100 0V40z" fill="#1bb4c4" />
        </svg>
        <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-turquoise via-[#0b6f95] to-navy" />
        <svg className="route-boat absolute -top-14 left-0 h-14 w-14" viewBox="0 0 64 64">
          <path d="M31 6v36H11z" fill="#fff" /><path d="M35 14v28h20z" fill="#fff" fillOpacity=".85" />
          <path d="M6 46h52l-8 10H14z" fill="#06264b" /><path d="M6 46h52" stroke="#fff" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}
