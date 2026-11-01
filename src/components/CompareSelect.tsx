"use client";

import { useRouter } from "next/navigation";
import { href, type Lang } from "@/lib/i18n";

export function CompareSelect({ boats, a, b, lang }: { boats: { slug: string; name: string }[]; a: string; b: string; lang: Lang }) {
  const router = useRouter();
  const en = lang === "en";
  const go = (x: string, y: string) => router.push(`${href(lang, "/tekne-karsilastir")}?a=${encodeURIComponent(x)}&b=${encodeURIComponent(y)}`, { scroll: false });
  const sel = "w-full rounded-xl border border-navy/15 bg-white px-4 py-3.5 text-base font-semibold text-navy outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30";
  return (
    <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
      <label className="block">
        <span className="sr-only">{en ? "First yacht" : "Birinci tekne"}</span>
        <select value={a} onChange={(e) => go(e.target.value, b)} className={sel}>
          <option value="">{en ? "Choose first yacht" : "Birinci tekneyi seçin"}</option>
          {boats.filter((x) => x.slug !== b).map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}
        </select>
      </label>
      <span className="text-center text-sm font-bold uppercase tracking-widest text-turquoise-dark">{en ? "vs" : "karşı"}</span>
      <label className="block">
        <span className="sr-only">{en ? "Second yacht" : "İkinci tekne"}</span>
        <select value={b} onChange={(e) => go(a, e.target.value)} className={sel}>
          <option value="">{en ? "Choose second yacht" : "İkinci tekneyi seçin"}</option>
          {boats.filter((x) => x.slug !== a).map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}
        </select>
      </label>
    </div>
  );
}
