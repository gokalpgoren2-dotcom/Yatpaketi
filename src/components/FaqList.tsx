"use client";

import { useMemo, useState } from "react";
import { RichText } from "./RichText";
import { FAQ_CATS, type FaqCat, type FaqItem } from "@/lib/faq";
import type { Lang } from "@/lib/i18n";

const norm = (s: string, lang: Lang) => s.toLocaleLowerCase(lang !== "tr" ? "en" : "tr");

// Kategori ikonları
const CAT_IC: Record<FaqCat, string> = {
  choose: "M12 3v13l7-1L12 3ZM11 6v9H6l5-9ZM3 19c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0",
  booking: "M4 6h16v14H4zM8 3v4M16 3v4M4 10h16M9 15l2 2 4-4",
  route: "M4 19c3-6 6 0 9-6s5-4 7-8M4 19h.01M20 5h.01",
  life: "M4 15h16M6 15v4M18 15v4M4 15l2-6h12l2 6M9 9V6h6v3",
  special: "M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7L12 3Z",
};
const ALL_IC = "M4 6h16M4 12h16M4 18h10";

function Ic({ d, size = 18 }: { d: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>;
}

// SSS: arama paneli (başlığın üzerine taşar), kategori çipleri ve yumuşak açılan cevaplar. Yan kutu `children` olarak gelir.
export function FaqList({ lang, faq, children }: { lang: Lang; faq: FaqItem[]; children?: React.ReactNode }) {
  const en = lang !== "tr";
  const ru = lang === "ru";
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<FaqCat | "all">("all");
  const [open, setOpen] = useState<string | null>(null);

  const all = useMemo(() => faq.map((f, i) => ({ id: `q${i}`, cat: f.cat, q: en ? f.qEn : f.qTr, a: en ? f.aEn : f.aTr })).filter((f) => f.q.trim() !== ""), [faq, en]);
  const items = useMemo(() => {
    const term = norm(q.trim(), lang);
    return all.filter((f) => (cat === "all" || f.cat === cat) && (!term || norm(f.q + " " + f.a, lang).includes(term)));
  }, [q, cat, lang, all]);
  const count = (k: FaqCat | "all") => (k === "all" ? all.length : all.filter((f) => f.cat === k).length);

  const chip = (k: FaqCat | "all", label: string, d: string) => (
    <button key={k} type="button" role="tab" aria-selected={cat === k} onClick={() => { setCat(k); setOpen(null); }}
      className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${cat === k ? "bg-navy text-white shadow-lg shadow-navy/20" : "bg-mist text-navy hover:bg-turquoise/15"}`}>
      <span className={cat === k ? "text-turquoise" : "text-turquoise-dark"}><Ic d={d} size={16} /></span>
      {label}
      <span className={`text-xs ${cat === k ? "text-white/60" : "text-navy/40"}`}>{count(k)}</span>
    </button>
  );

  let n = 0;
  return (
    <>
      {/* Arama paneli */}
      <div className="relative z-10 -mt-16 rounded-[2rem] bg-white p-5 shadow-2xl shadow-navy/10 ring-1 ring-navy/5 lg:-mt-20 lg:p-7">
        <label htmlFor="faq-search" className="sr-only">{ru ? "Что вы ищете?" : en ? "What are you looking for?" : "Hangi konuda bilgi arıyorsunuz?"}</label>
        <div className="relative">
          <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-turquoise-dark"><Ic d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM20 20l-3.5-3.5" size={22} /></span>
          <input
            id="faq-search"
            type="search"
            value={q}
            onChange={(e) => { setQ(e.target.value); setOpen(null); }}
            placeholder={ru ? "Поиск по вопросам: питание, оплата, маршрут…" : en ? "Search questions: food, payment, route…" : "Sorularda arayın: yemek, ödeme, rota…"}
            className="w-full rounded-2xl bg-mist py-5 pl-14 pr-5 text-base text-navy outline-none ring-1 ring-transparent transition placeholder:text-navy/40 focus:bg-white focus:ring-2 focus:ring-turquoise/50 lg:text-lg"
          />
        </div>
        <div className="no-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:px-0" role="tablist" aria-label={ru ? "Категории" : en ? "Categories" : "Kategoriler"}>
          {chip("all", ru ? "Все" : en ? "All" : "Tümü", ALL_IC)}
          {FAQ_CATS.map((c) => chip(c.key, en ? c.en : c.tr, CAT_IC[c.key]))}
        </div>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-14">
        <div>
          <p className="text-sm text-navy/50" aria-live="polite">{en ? `${items.length} questions` : `${items.length} soru`}</p>

          {items.length === 0 && (
            <div className="mt-6 rounded-[2rem] bg-mist p-10 text-center">
              <p className="font-display text-xl font-semibold text-navy">{ru ? "Подходящий вопрос не найден" : en ? "No matching question" : "Uygun soru bulunamadı"}</p>
              <p className="mt-2 text-navy/65">{ru ? "Попробуйте другое слово или напишите нам." : en ? "Try a different word or write to us." : "Başka bir kelime deneyin ya da bize yazın."}</p>
            </div>
          )}

          {FAQ_CATS.map((c) => {
            const list = items.filter((f) => f.cat === c.key);
            if (list.length === 0) return null;
            return (
              <section key={c.key} className="mt-8 first-of-type:mt-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy text-turquoise"><Ic d={CAT_IC[c.key]} size={20} /></span>
                  <h2 className="font-display text-2xl font-semibold text-navy lg:text-3xl">{en ? c.titleEn : c.titleTr}</h2>
                </div>
                <ul className="mt-5 space-y-3">
                  {list.map((f) => {
                    const isOpen = open === f.id;
                    n++;
                    return (
                      <li key={f.id} className={`overflow-hidden rounded-2xl bg-white ring-1 transition duration-300 ${isOpen ? "shadow-xl shadow-navy/10 ring-turquoise/40" : "ring-navy/10 hover:ring-turquoise/30"}`}>
                        <button type="button" aria-expanded={isOpen} aria-controls={`${f.id}-a`} onClick={() => setOpen(isOpen ? null : f.id)} className="flex w-full items-center gap-4 px-5 py-5 text-left lg:px-6">
                          <span className={`w-7 shrink-0 font-display text-sm font-semibold ${isOpen ? "text-turquoise-dark" : "text-navy/30"}`}>{String(n).padStart(2, "0")}</span>
                          <span className="flex-1 font-semibold text-navy">{f.q}</span>
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition duration-300 ${isOpen ? "rotate-45 bg-turquoise text-white" : "bg-mist text-navy"}`} aria-hidden>
                            <Ic d="M12 5v14M5 12h14" size={16} />
                          </span>
                        </button>
                        <div id={`${f.id}-a`} className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                          <div className="overflow-hidden">
                            <div className="mx-5 border-t border-navy/10 pb-6 pl-11 pt-4 lg:mx-6 [&_*]:!text-base">
                              <RichText text={f.a} />
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
        {children}
      </div>
    </>
  );
}
