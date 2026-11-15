import type { Metadata } from "next";
import { getContact } from "@/lib/content";
import { teamEnter } from "./actions";

export const metadata: Metadata = { title: "Çok yakında", robots: { index: false, follow: false } };

// Kapalı modda ziyaretçilerin gördüğü tek sayfa.
export default async function Soon({ searchParams }: { searchParams: Promise<{ hata?: string }> }) {
  const { hata } = await searchParams;
  const c = await getContact();
  const wa = c.whatsapp ? `https://wa.me/${c.whatsapp.replace(/\D+/g, "").replace(/^0/, "90")}?text=${encodeURIComponent("Merhaba, yat kiralama hakkında bilgi almak istiyorum.")}` : "";
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-navy via-navy-soft to-[#0f6f8c] px-6 py-16 text-center text-white">
      <svg aria-hidden viewBox="0 0 1440 320" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-40 w-full text-white/10 sm:h-56">
        <path fill="currentColor" d="M0 192l60-16c60-16 180-48 300-42.7S600 181 720 197.3 960 203 1080 176s240-80 300-106.7l60-26.6V320H0z" />
      </svg>
      <div className="relative w-full max-w-md">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-beyaz.png" alt="yatpaketi" className="mx-auto h-14 w-auto sm:h-16" />
        <p className="mt-10 text-xs font-semibold uppercase tracking-[0.3em] text-turquoise">Çok yakında</p>
        <h1 className="font-display mt-3 text-3xl font-semibold leading-tight sm:text-4xl">Yeni sitemiz için son hazırlıkları yapıyoruz.</h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-white/75">Güvenle seçin, rahatça tatil yapın. Yat kiralama talepleriniz için bize şimdiden yazabilirsiniz.</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {wa && (
            <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#25d366] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-105">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.1-5.4A8.5 8.5 0 1 1 21 11.5z" /></svg>
              WhatsApp&apos;tan yazın
            </a>
          )}
          {c.instagram && (
            <a href={c.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white ring-1 ring-white/40 transition hover:bg-white/10">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></svg>
              Instagram
            </a>
          )}
        </div>

        <details className="mt-14 text-left" open={!!hata}>
          <summary className="mx-auto w-fit cursor-pointer list-none rounded-full px-3 py-1 text-xs text-white/45 transition hover:text-white/80">Ekip girişi</summary>
          <form action={teamEnter} className="mt-3 flex gap-2">
            <input name="sifre" type="password" required autoComplete="current-password" placeholder="Ekip şifresi" aria-label="Ekip şifresi" className="min-w-0 flex-1 rounded-full bg-white/10 px-4 py-2.5 text-sm text-white outline-none ring-1 ring-white/25 placeholder:text-white/40 focus:ring-turquoise" />
            <button type="submit" className="rounded-full bg-turquoise px-5 py-2.5 text-sm font-bold text-white transition hover:bg-turquoise-dark">Gir</button>
          </form>
          {hata && <p role="alert" className="mt-2 text-center text-xs text-red-200">Şifre yanlış.</p>}
        </details>
      </div>
    </main>
  );
}
