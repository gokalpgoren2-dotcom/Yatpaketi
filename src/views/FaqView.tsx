import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { FaqList } from "@/components/FaqList";
import { href, type Lang } from "@/lib/i18n";
import { gt } from "@/lib/guide-text";
import { getFaqItems } from "@/lib/site-texts";
import { getContact } from "@/lib/content";
import { FAQ_CATS } from "@/lib/faq";

const wrap = "mx-auto max-w-7xl px-5 lg:px-8";
const WAVE = (y: number) => `M0 ${y} q180 -60 360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 V400 H0 z`;

function Ic({ d, size = 18 }: { d: string; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={d} /></svg>;
}

export async function FaqView({ lang }: { lang: Lang }) {
  const [faq, contact] = await Promise.all([getFaqItems(), getContact()]);
  const en = lang === "en";
  const T = gt(lang);
  const total = faq.filter((f) => (en ? f.qEn : f.qTr).trim() !== "").length;
  const wa = contact.whatsapp ? `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(en ? "Hello, I have a question about chartering a boat." : "Merhaba, yat kiralamayla ilgili bir sorum var.")}` : href(lang, "/iletisim");
  const links: [string, string, string][] = [
    [href(lang, "/kiralama-sureci"), en ? "Charter process" : "Kiralama süreci", "M9 4h6v3H9zM6 5h3M15 5h3v16H6V5M9 11h6M9 15h4"],
    [href(lang, "/rotalar"), en ? "Classic routes" : "Klasik rotalar", "M4 19c3-6 6 0 9-6s5-4 7-8M4 19h.01M20 5h.01"],
    [href(lang, "/destinasyonlar"), en ? "Destinations" : "Destinasyonlar", "M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5"],
    [href(lang, "/tekneler"), en ? "Browse boats" : "Yatları inceleyin", "M12 3v13l7-1L12 3ZM11 6v9H6l5-9ZM3 19c2 1.5 4 1.5 6 0s4-1.5 6 0 4 1.5 6 0"],
  ];
  return (
    <>
      <Header lang={lang} />
      <main>
        {/* Başlık */}
        <section className="relative isolate overflow-hidden pb-28 pt-28 text-white lg:pb-36 lg:pt-36" style={{ background: "linear-gradient(160deg, #05204a 0%, #06264b 45%, #0b4a6e 80%, #0d6a86 100%)" }}>
          <div className="absolute inset-x-0 bottom-0 -z-10 h-28 overflow-hidden" aria-hidden>
            <svg className="wave-a absolute bottom-0 left-0 h-28 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={WAVE(150)} fill="rgba(255,255,255,0.08)" /></svg>
            <svg className="wave-b absolute bottom-0 left-0 h-20 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={WAVE(220)} fill="rgba(255,255,255,0.12)" /></svg>
          </div>
          <svg className="absolute -right-16 top-12 -z-10 h-[28rem] w-[28rem] text-white/[0.04]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.7" aria-hidden><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6M12 17h.01" /></svg>
          <div className={`${wrap} flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between`}>
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-turquoise">{T.guide}</p>
              <h1 className="font-display mt-3 text-4xl font-semibold leading-tight lg:text-6xl">{en ? "Frequently asked questions" : "Sıkça sorulan sorular"}</h1>
              <p className="mt-4 text-lg text-white/75">{en ? "Everything people most often ask about chartering a boat, in one place." : "Yat kiralamayla ilgili en çok merak edilenler tek yerde."}</p>
            </div>
            <ul className="flex shrink-0 gap-8 lg:pb-2">
              <li><span className="font-display block text-3xl font-semibold text-turquoise">{total}</span><span className="text-sm text-white/65">{en ? "questions" : "soru"}</span></li>
              <li><span className="font-display block text-3xl font-semibold text-turquoise">{FAQ_CATS.length}</span><span className="text-sm text-white/65">{en ? "topics" : "konu"}</span></li>
            </ul>
          </div>
        </section>

        <section className="pb-20">
          <div className={wrap}>
            <FaqList lang={lang} faq={faq}>
              <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
                <div className="relative isolate overflow-hidden rounded-[2rem] p-7 text-white" style={{ background: "linear-gradient(150deg, #06264b 0%, #0b4a6e 65%, #0d6a86 100%)" }}>
                  <svg className="absolute -bottom-8 -right-8 -z-10 h-40 w-40 text-white/[0.06]" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 3v13l7-1L12 3ZM11 6v9H6l5-9ZM4 17h16l-2 3H6l-2-3Z" /></svg>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-turquoise">{en ? "Still have a question?" : "Sorunuz mu kaldı?"}</p>
                  <h2 className="font-display mt-3 text-2xl font-semibold">{en ? "Let's settle it together" : "Birlikte netleştirelim"}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-white/75">{en ? "Every boat's and route's details differ. Share your dates and group size, and we'll assess the best option for your holiday." : "Her yatın ve rotanın ayrıntıları farklıdır. Tarihlerinizi ve kişi sayınızı paylaşın, tatilinize en uygun seçeneği birlikte değerlendirelim."}</p>
                  <a href={wa} target={contact.whatsapp ? "_blank" : undefined} rel="noopener noreferrer" className="mt-6 flex items-center justify-center gap-2 rounded-full bg-turquoise px-6 py-3.5 text-sm font-semibold text-navy transition hover:brightness-110">
                    <Ic d="M4 20l1.3-4A8 8 0 1 1 8 18.7L4 20Z" />{en ? "Ask on WhatsApp" : "WhatsApp'tan sorun"}
                  </a>
                  <Link href={href(lang, "/iletisim")} className="mt-2.5 block rounded-full px-6 py-3 text-center text-sm font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/10">{en ? "Contact us" : "İletişim sayfası"}</Link>
                </div>
                <nav className="rounded-[2rem] bg-white p-3 ring-1 ring-navy/10" aria-label={en ? "Guide pages" : "Rehber sayfaları"}>
                  {links.map(([to, label, d]) => (
                    <Link key={to} href={to} className="group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold text-navy transition hover:bg-mist">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-turquoise/15 text-turquoise-dark transition group-hover:bg-navy group-hover:text-turquoise"><Ic d={d} size={17} /></span>
                      <span className="flex-1">{label}</span>
                      <span className="text-navy/30 transition group-hover:translate-x-1 group-hover:text-turquoise-dark">→</span>
                    </Link>
                  ))}
                </nav>
              </aside>
            </FaqList>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  );
}
