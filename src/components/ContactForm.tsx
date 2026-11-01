"use client";

import { useState } from "react";
import type { Lang } from "@/lib/i18n";

const T = {
  tr: {
    name: "Adınız", topic: "Konu", msg: "Mesajınız", msgPh: "Tarihleriniz, kişi sayınız ve hayalinizdeki rota…",
    topics: ["Tekne kiralama", "Rota ve liman önerisi", "Mevcut turum hakkında", "Diğer"],
    wa: "WhatsApp ile gönder", mail: "E-posta ile gönder", note: "Mesajınız hazır olarak WhatsApp’ta açılır, göndermek için tek dokunuş yeter.",
    hi: "Merhaba, ben", subj: "İletişim formu",
  },
  en: {
    name: "Your name", topic: "Topic", msg: "Your message", msgPh: "Your dates, group size and the route you have in mind…",
    topics: ["Yacht charter", "Route and port advice", "About my current tour", "Other"],
    wa: "Send via WhatsApp", mail: "Send by email", note: "Your message opens ready-made in WhatsApp; one tap sends it.",
    hi: "Hello, I'm", subj: "Contact form",
  },
};

const field = "w-full rounded-xl border border-navy/15 bg-white px-4 py-3 text-navy outline-none transition focus:border-turquoise focus:ring-2 focus:ring-turquoise/25";

export function ContactForm({ lang, whatsapp, email }: { lang: Lang; whatsapp: string; email: string }) {
  const L = T[lang];
  const [name, setName] = useState("");
  const [topic, setTopic] = useState(L.topics[0]);
  const [msg, setMsg] = useState("");
  const body = `${L.hi} ${name || "…"}.\n${L.topic}: ${topic}\n\n${msg}`.trim();
  const ok = name.trim().length > 0 && msg.trim().length > 0;
  const cta = "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition";
  const off = ok ? "" : " pointer-events-none opacity-50";
  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-navy">{L.name}</span>
        <input className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-navy">{L.topic}</span>
        <select className={field} value={topic} onChange={(e) => setTopic(e.target.value)}>
          {L.topics.map((x) => <option key={x}>{x}</option>)}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-navy">{L.msg}</span>
        <textarea className={`${field} min-h-32`} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder={L.msgPh} />
      </label>
      <div className="flex flex-col gap-3 pt-1 sm:flex-row">
        {whatsapp && (
          <a href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(body)}`} target="_blank" rel="noopener noreferrer" aria-disabled={!ok} className={`${cta} bg-[#25D366] text-white hover:brightness-95${off}`}>{L.wa}</a>
        )}
        {email && (
          <a href={`mailto:${email}?subject=${encodeURIComponent(`${L.subj}: ${topic}`)}&body=${encodeURIComponent(body)}`} aria-disabled={!ok} className={`${cta} border border-navy/20 text-navy hover:border-turquoise${off}`}>{L.mail}</a>
        )}
      </div>
      {whatsapp && <p className="text-xs text-navy/55">{L.note}</p>}
    </form>
  );
}
