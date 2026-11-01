"use client";

import { useMemo, useState } from "react";
import { RichText } from "./RichText";
import { FAQ, FAQ_CATS, type FaqCat } from "@/lib/faq";
import type { Lang } from "@/lib/i18n";

const norm = (s: string, lang: Lang) => s.toLocaleLowerCase(lang === "en" ? "en" : "tr");

export function FaqList({ lang }: { lang: Lang }) {
  const en = lang === "en";
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<FaqCat | "all">("all");
  const [open, setOpen] = useState<string | null>(null);

  const items = useMemo(() => {
    const term = norm(q.trim(), lang);
    return FAQ.map((f, i) => ({ id: `q${i}`, cat: f[0], q: en ? f[3] : f[1], a: en ? f[4] : f[2] })).filter(
      (f) => (cat === "all" || f.cat === cat) && (!term || norm(f.q + " " + f.a, lang).includes(term)),
    );
  }, [q, cat, en, lang]);

  const chip = "shrink-0 rounded-full px-5 py-2.5 text-sm font-semibold transition ring-1";
  return (
    <div>
      <label htmlFor="faq-search" className="mb-2 block text-sm font-semibold text-navy">{en ? "What are you looking for?" : "Hangi konuda bilgi arıyorsun?"}</label>
      <div className="relative">
        <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-navy/45" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        <input
          id="faq-search"
          type="search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(null); }}
          placeholder={en ? "For example: food, payment, route…" : "Örneğin: yemek, ödeme, rota…"}
          className="w-full rounded-2xl border border-navy/15 bg-white py-4 pl-12 pr-4 text-base text-navy outline-none transition focus:border-turquoise focus:ring-2 focus:ring-turquoise/30"
        />
      </div>

      <div className="no-scrollbar -mx-5 mt-4 flex gap-2.5 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0" role="tablist" aria-label={en ? "Categories" : "Kategoriler"}>
        <button type="button" onClick={() => setCat("all")} className={`${chip} ${cat === "all" ? "bg-navy text-white ring-navy" : "bg-white text-navy ring-navy/10 hover:ring-turquoise"}`}>{en ? "All Questions" : "Tüm Sorular"}</button>
        {FAQ_CATS.map((c) => (
          <button key={c.key} type="button" onClick={() => setCat(c.key)} className={`${chip} ${cat === c.key ? "bg-navy text-white ring-navy" : "bg-white text-navy ring-navy/10 hover:ring-turquoise"}`}>{en ? c.en : c.tr}</button>
        ))}
      </div>

      <p className="mt-4 text-sm text-navy/55" aria-live="polite">{en ? `Showing ${items.length} questions.` : `${items.length} soru gösteriliyor.`}</p>

      {items.length === 0 && (
        <p className="mt-6 rounded-3xl bg-mist p-8 text-center text-navy/70">{en ? "No question matches your search. Try a different word or write to us." : "Aramanıza uyan soru bulunamadı. Başka bir kelime deneyin ya da bize yazın."}</p>
      )}

      {FAQ_CATS.map((c) => {
        const list = items.filter((f) => f.cat === c.key);
        if (list.length === 0) return null;
        return (
          <section key={c.key} className="mt-9">
            <h2 className="font-display text-2xl text-navy lg:text-3xl">{en ? c.titleEn : c.titleTr}</h2>
            <ul className="mt-4 space-y-3">
              {list.map((f) => {
                const isOpen = open === f.id;
                return (
                  <li key={f.id} className="overflow-hidden rounded-2xl bg-white ring-1 ring-navy/10">
                    <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : f.id)} className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left">
                      <span className="font-semibold text-navy">{f.q}</span>
                      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-turquoise/10 text-xl leading-none text-turquoise-dark transition-transform ${isOpen ? "rotate-45" : ""}`} aria-hidden>+</span>
                    </button>
                    {isOpen && <div className="border-t border-navy/10 px-5 pb-5 pt-4 [&_*]:!text-base"><RichText text={f.a} /></div>}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
