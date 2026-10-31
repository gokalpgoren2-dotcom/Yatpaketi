"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { categories, destinations } from "@/lib/data";

const field =
  "w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy outline-none transition focus:border-turquoise focus:ring-2 focus:ring-turquoise/30";
const label = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy/60";

export function SearchBar() {
  const router = useRouter();
  const [dest, setDest] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [guests, setGuests] = useState("2");
  const [type, setType] = useState("");
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (from && to && to < from) {
      setError("Çıkış tarihi giriş tarihinden önce olamaz.");
      return;
    }
    setError("");
    const q = new URLSearchParams();
    if (dest) q.set("destinasyon", dest);
    if (from) q.set("giris", from);
    if (to) q.set("cikis", to);
    if (guests) q.set("misafir", guests);
    if (type) q.set("tip", type);
    // Aşama 2'de /tekneler sayfası eklenecek; şimdilik tekne bölümüne kaydırır.
    router.push(`/?${q.toString()}#tekneler`);
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-4 rounded-3xl bg-white p-5 shadow-2xl shadow-navy/20 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_0.8fr_1fr_auto] lg:items-end lg:p-6"
      aria-label="Tekne arama"
    >
      <div>
        <label className={label} htmlFor="dest">Nereye gitmek istiyorsunuz?</label>
        <select id="dest" className={field} value={dest} onChange={(e) => setDest(e.target.value)}>
          <option value="">Tüm destinasyonlar</option>
          {destinations.map((d) => (
            <option key={d.slug} value={d.slug}>{d.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={label} htmlFor="from">Giriş tarihi</label>
        <input id="from" type="date" className={field} value={from} onChange={(e) => setFrom(e.target.value)} />
      </div>
      <div>
        <label className={label} htmlFor="to">Çıkış tarihi</label>
        <input id="to" type="date" className={field} min={from || undefined} value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      <div>
        <label className={label} htmlFor="guests">Misafir</label>
        <input id="guests" type="number" min={1} max={50} inputMode="numeric" className={field} value={guests} onChange={(e) => setGuests(e.target.value)} />
      </div>
      <div>
        <label className={label} htmlFor="type">Tekne tipi</label>
        <select id="type" className={field} value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Tümü</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="rounded-xl bg-turquoise px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-turquoise-dark sm:col-span-2 lg:col-span-1"
      >
        Tekneleri Keşfet
      </button>
      {error && <p role="alert" className="text-sm text-red-600 sm:col-span-2 lg:col-span-6">{error}</p>}
    </form>
  );
}
