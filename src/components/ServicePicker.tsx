"use client";

import { useState } from "react";

// Hizmet seçici: ziyaretçi ihtiyaç duyduğu hizmetleri işaretler, tarih ve kişi sayısını yazar; WhatsApp'a hazır mesajla gider.
export function ServicePicker({ items, icons, whatsapp, contactHref, lang }: { items: string[]; icons: string[]; whatsapp: string; contactHref: string; lang: "tr" | "en" | "ru" }) {
  const en = lang !== "tr";
  const ru = lang === "ru";
  const [sel, setSel] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [people, setPeople] = useState("");
  const toggle = (s: string) => setSel((v) => (v.includes(s) ? v.filter((x) => x !== s) : [...v, s]));
  const msg = ru
    ? `Здравствуйте, меня интересует: ${sel.join(", ") || "ваши услуги"}.${date ? ` Даты: ${date}.` : ""}${people ? ` Гостей: ${people}.` : ""}`
    : en
    ? `Hello, I'm interested in: ${sel.join(", ") || "your services"}.${date ? ` Dates: ${date}.` : ""}${people ? ` Guests: ${people}.` : ""}`
    : `Merhaba, şu hizmetlerle ilgileniyorum: ${sel.join(", ") || "hizmetleriniz"}.${date ? ` Tarih: ${date}.` : ""}${people ? ` Kişi sayısı: ${people}.` : ""}`;
  const link = whatsapp ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}` : contactHref;
  const input = "w-full rounded-2xl bg-white/10 px-4 py-3.5 text-white ring-1 ring-white/15 outline-none transition placeholder:text-white/40 focus:bg-white/15 focus:ring-turquoise";
  return (
    <div>
      <p className="text-sm font-semibold text-white/70">{ru ? "1. Выберите нужные услуги" : en ? "1. Pick the services you need" : "1. İhtiyacınız olan hizmetleri seçin"}</p>
      <div className="mt-3 flex flex-wrap gap-2.5">
        {items.map((s, i) => {
          const on = sel.includes(s);
          return (
            <button key={s} type="button" aria-pressed={on} onClick={() => toggle(s)}
              className={`flex items-center gap-2.5 rounded-full py-2 pl-2 pr-4 text-sm font-semibold transition ${on ? "bg-turquoise text-navy shadow-lg shadow-turquoise/25" : "bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/15"}`}>
              <span className={`flex h-8 w-8 items-center justify-center rounded-full transition ${on ? "bg-navy text-turquoise" : "bg-white/10 text-turquoise"}`}>
                {on ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12l5 5 9-10" /></svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={icons[i % icons.length]} /></svg>
                )}
              </span>
              {s}
            </button>
          );
        })}
      </div>
      <p className="mt-7 text-sm font-semibold text-white/70">{ru ? "2. Даты и количество гостей (необязательно)" : en ? "2. Your dates and group size (optional)" : "2. Tarih ve kişi sayısı (isteğe bağlı)"}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="block"><span className="sr-only">{ru ? "Даты" : en ? "Dates" : "Tarih"}</span>
          <input value={date} onChange={(e) => setDate(e.target.value)} placeholder={ru ? "напр. 12–19 июля" : en ? "e.g. 12–19 July" : "Örn. 12–19 Temmuz"} className={input} />
        </label>
        <label className="block"><span className="sr-only">{ru ? "Гости" : en ? "Guests" : "Kişi sayısı"}</span>
          <input value={people} onChange={(e) => setPeople(e.target.value)} inputMode="numeric" placeholder={ru ? "напр. 8 человек" : en ? "e.g. 8 people" : "Örn. 8 kişi"} className={input} />
        </label>
      </div>
      <a href={link} target={whatsapp ? "_blank" : undefined} rel="noopener noreferrer"
        className="mt-7 flex w-full items-center justify-center gap-2.5 rounded-full bg-turquoise px-7 py-4 text-sm font-semibold text-navy shadow-lg shadow-turquoise/30 transition hover:brightness-110 sm:w-auto sm:inline-flex">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20Z" /></svg>
        {sel.length ? (en ? `Send ${sel.length} services on WhatsApp` : `${sel.length} hizmeti WhatsApp'tan gönder`) : ru ? "Написать в WhatsApp" : en ? "Write on WhatsApp" : "WhatsApp'tan yazın"}
      </a>
    </div>
  );
}
