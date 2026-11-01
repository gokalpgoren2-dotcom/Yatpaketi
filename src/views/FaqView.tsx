import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { FaqList } from "@/components/FaqList";
import { href, type Lang } from "@/lib/i18n";
import { gt } from "@/lib/guide-text";
import { getFaqItems } from "@/lib/site-texts";

export async function FaqView({ lang }: { lang: Lang }) {
  const faq = await getFaqItems();
  const en = lang === "en";
  const T = gt(lang);
  return (
    <>
      <Header lang={lang} />
      <main className="mx-auto max-w-7xl px-5 pb-20 pt-24 lg:px-8 lg:pt-32">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-turquoise-dark">{T.guide}</p>
        <h1 className="font-display text-3xl font-medium text-navy lg:text-5xl">{en ? "Frequently asked questions" : "Sıkça sorulan sorular"}</h1>
        <p className="mt-4 max-w-2xl text-navy/70">{en ? "Everything people most often ask about chartering a boat, in one place." : "Tekne kiralamayla ilgili en çok merak edilenler tek yerde."}</p>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <FaqList lang={lang} faq={faq} />
          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-3xl bg-navy p-6 text-white">
              <span className="block h-1 w-10 rounded-full bg-turquoise" />
              <h2 className="font-display mt-4 text-2xl">{en ? "Let's settle it together" : "Birlikte netleştirelim"}</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/75">{en ? "Every boat's and route's details differ. Share your dates and group size, and we'll assess the best option for your holiday." : "Her teknenin ve rotanın ayrıntıları farklıdır. Tarihlerini ve kişi sayını paylaş, tatiline en uygun seçeneği birlikte değerlendirelim."}</p>
              <Link href={href(lang, "/#iletisim")} className="mt-5 inline-block rounded-full bg-turquoise px-6 py-3 text-sm font-semibold text-white transition hover:bg-turquoise-dark">{en ? "Contact us" : "Bizimle İletişime Geç"}</Link>
            </div>
            <Link href={href(lang, "/destinasyonlar")} className="block rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-navy ring-1 ring-navy/10 transition hover:ring-turquoise">{en ? "Explore destinations →" : "Destinasyonları Keşfet →"}</Link>
            <Link href={href(lang, "/tekneler")} className="block rounded-2xl bg-white px-5 py-4 text-sm font-semibold text-navy ring-1 ring-navy/10 transition hover:ring-turquoise">{en ? "Get a quote for your holiday →" : "Tatilin İçin Teklif Al →"}</Link>
          </aside>
        </div>
      </main>
      <Footer lang={lang} />
    </>
  );
}
