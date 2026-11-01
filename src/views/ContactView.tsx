import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { ContactForm } from "@/components/ContactForm";
import { getContact } from "@/lib/content";
import { formatPhone } from "@/lib/phone";
import type { Lang } from "@/lib/i18n";

const wrap = "mx-auto max-w-7xl px-5 lg:px-8";
const eyebrow = "text-xs font-semibold uppercase tracking-[0.25em] text-turquoise-dark";

const T = {
  tr: {
    title: "Bizimle konuşalım.", accent: "Yolculuğu birlikte planlayalım.",
    sub: "Tarihlerinizi, kişi sayınızı ve hayalinizi yazın; size uygun tekne ve rotayı birlikte netleştirelim.",
    ways: "Bize ulaşın", wa: "WhatsApp", waSub: "En hızlı yol. Çoğu müşterimiz bizimle buradan yazışıyor.", waCta: "Mesaj yaz",
    phone: "Telefon", phoneSub: "Arayabilirsiniz.", mail: "E-posta", mailSub: "Ayrıntılı sorular için.",
    formEyebrow: "Mesaj bırakın", formTitle: "Size dönelim.",
    tourTitle: "Turunuz onaylandı mı?", tourText: "Sözleşme, hazırlık listesi ve tekne konumu Turum sayfanızda. Giriş kodunuz e-postanızda.", tourCta: "Turum’a git",
  },
  en: {
    title: "Let's talk.", accent: "Let's plan the voyage together.",
    sub: "Tell us your dates, group size and what you have in mind, and we'll shape the right yacht and route together.",
    ways: "Reach us", wa: "WhatsApp", waSub: "The fastest way. Most of our guests chat with us here.", waCta: "Write a message",
    phone: "Phone", phoneSub: "Feel free to call.", mail: "Email", mailSub: "For detailed questions.",
    formEyebrow: "Leave a message", formTitle: "We'll get back to you.",
    tourTitle: "Is your tour confirmed?", tourText: "Your contract, preparation list and yacht location are on your My Tour page. Your login code is in your email.", tourCta: "Go to My Tour",
  },
};

export async function ContactView({ lang }: { lang: Lang }) {
  const L = T[lang];
  const c = await getContact();
  const card = "block rounded-2xl bg-white p-6 ring-1 ring-navy/10 transition hover:ring-turquoise";
  return (
    <>
      <Header lang={lang} />
      <main>
        <section className="bg-gradient-to-r from-navy to-[#0b4a66] pb-12 pt-28 text-white lg:pb-16 lg:pt-36">
          <div className={`${wrap} flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between`}>
            <h1 className="font-display text-4xl font-medium leading-tight lg:text-6xl">{L.title}<br /><span className="text-turquoise">{L.accent}</span></h1>
            <p className="max-w-md border-white/25 text-white/80 lg:border-l lg:pl-6 lg:text-lg">{L.sub}</p>
          </div>
        </section>

        <section className="py-14 lg:py-20">
          <div className={`${wrap} grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16`}>
            <div>
              <p className={`mb-3 ${eyebrow}`}>{L.ways}</p>
              <div className="space-y-4">
                {c.whatsapp && (
                  <a href={`https://wa.me/${c.whatsapp}`} target="_blank" rel="noopener noreferrer" className={card}>
                    <p className="font-display text-xl font-bold text-navy">{L.wa}</p>
                    <p className="mt-1 text-sm text-navy/65">{L.waSub}</p>
                    <p className="mt-3 text-sm font-semibold text-turquoise-dark">{L.waCta} →</p>
                  </a>
                )}
                {c.phone && (
                  <a href={`tel:+${c.phone}`} className={card}>
                    <p className="font-display text-xl font-bold text-navy">{L.phone}</p>
                    <p className="mt-1 text-sm text-navy/65">{L.phoneSub}</p>
                    <p className="mt-3 text-sm font-semibold text-turquoise-dark">{formatPhone(c.phone)}</p>
                  </a>
                )}
                {c.email && (
                  <a href={`mailto:${c.email}`} className={card}>
                    <p className="font-display text-xl font-bold text-navy">{L.mail}</p>
                    <p className="mt-1 text-sm text-navy/65">{L.mailSub}</p>
                    <p className="mt-3 break-all text-sm font-semibold text-turquoise-dark">{c.email}</p>
                  </a>
                )}
              </div>
            </div>
            <div className="rounded-3xl bg-mist/60 p-6 ring-1 ring-navy/10 lg:p-9">
              <p className={`mb-3 ${eyebrow}`}>{L.formEyebrow}</p>
              <h2 className="font-display mb-6 text-3xl font-bold leading-tight text-navy">{L.formTitle}</h2>
              <ContactForm lang={lang} whatsapp={c.whatsapp} email={c.email} />
            </div>
          </div>
        </section>

        <section className="pb-14 lg:pb-20">
          <div className={wrap}>
            <div className="flex flex-col gap-4 rounded-3xl bg-navy p-7 text-white lg:flex-row lg:items-center lg:justify-between lg:p-9">
              <div>
                <h2 className="font-display text-2xl font-bold">{L.tourTitle}</h2>
                <p className="mt-2 max-w-xl text-white/75">{L.tourText}</p>
              </div>
              <a href="/musteri" className="inline-flex shrink-0 items-center justify-center rounded-full bg-turquoise px-6 py-3 text-sm font-semibold text-navy hover:brightness-105">{L.tourCta}</a>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  );
}
