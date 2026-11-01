import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { RichText } from "@/components/RichText";
import { getPosts } from "@/lib/posts";
import { href, type Lang } from "@/lib/i18n";
import { gt } from "@/lib/guide-text";

export async function ProcessView({ lang }: { lang: Lang }) {
  const T = gt(lang);
  const steps = await getPosts("process", undefined, lang);
  const P = lang === "en"
    ? {
        eyebrow: "Customer panel", title: "Follow your voyage from your own panel",
        text: "Once your booking is confirmed, you get access to a private customer panel. Everything about your trip is in one place, so you don't need to chase emails.",
        items: [
          ["Contract", "View, download and sign your charter contract online."],
          ["Preparation list", "See what is left to prepare before the trip and tick items off as they are done."],
          ["Boat location", "When it is opened for your trip, see where your boat is."],
          ["Questions", "Write to us directly from the panel whenever you need."],
        ],
        how: "Your login code is shared with you by our team after your booking is confirmed. Log in with your e-mail address and the code.",
        cta: "Customer login",
      }
    : {
        eyebrow: "Müşteri paneli", title: "Yolculuğunuzu kendi panelinizden takip edin",
        text: "Rezervasyonunuz onaylandıktan sonra size özel bir müşteri paneli açılır. Yolculuğunuzla ilgili her şey tek yerde durur, e-postalar arasında bilgi aramanız gerekmez.",
        items: [
          ["Sözleşme", "Kiralama sözleşmenizi çevrimiçi görüntüleyin, indirin ve imzalayın."],
          ["Hazırlık listesi", "Yolculuk öncesi nelerin kaldığını görün, tamamlananları işaretleyin."],
          ["Teknenin konumu", "Yolculuğunuz için açıldığında teknenizin nerede olduğunu görün."],
          ["Sorularınız", "İhtiyacınız olduğunda panelden bize doğrudan yazın."],
        ],
        how: "Giriş kodunuz, rezervasyonunuz onaylandıktan sonra ekibimiz tarafından sizinle paylaşılır. E-posta adresiniz ve bu kodla giriş yaparsınız.",
        cta: "Müşteri girişi",
      } as const;
  return (
    <>
      <Header lang={lang} />
      <main className="mx-auto max-w-3xl px-5 pb-20 pt-24 lg:pt-32">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-turquoise-dark">{T.guide}</p>
        <h1 className="font-display text-3xl font-medium text-navy lg:text-5xl">{T.processTitle}</h1>
        <p className="mt-4 max-w-2xl text-lg text-navy/70">{T.processIntro}</p>

        {steps.length === 0 ? (
          <p className="mt-10 rounded-3xl bg-mist p-8 text-center text-navy/70">{T.processEmpty}</p>
        ) : (
          <ol className="mt-12 space-y-10">
            {steps.map((s, i) => (
              <li key={s.slug} id={s.slug} className="relative scroll-mt-24 pl-14">
                {i < steps.length - 1 && <span className="absolute left-[1.15rem] top-12 h-[calc(100%+1.5rem)] w-0.5 bg-turquoise/25" aria-hidden />}
                <span className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-turquoise text-sm font-bold text-white shadow-lg shadow-turquoise/30">{i + 1}</span>
                <h2 className="font-display text-2xl text-navy">{s.title}</h2>
                {s.excerpt && <p className="mt-1 font-medium text-turquoise-dark">{s.excerpt}</p>}
                {s.content && <div className="mt-3"><RichText text={s.content} /></div>}
              </li>
            ))}
          </ol>
        )}

        <section className="mt-16 overflow-hidden rounded-[2rem] bg-gradient-to-br from-navy via-navy-soft to-[#0e6a96] p-7 text-white lg:p-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-turquoise">{P.eyebrow}</p>
          <h2 className="font-display text-3xl font-bold leading-tight lg:text-4xl">{P.title}</h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-white/80">{P.text}</p>
          <ul className="mt-7 grid gap-4 sm:grid-cols-2">
            {P.items.map(([t, d]) => (
              <li key={t} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/15">
                <p className="font-semibold">{t}</p>
                <p className="mt-1 text-sm leading-relaxed text-white/75">{d}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-white/70">{P.how}</p>
          <Link href="/musteri" className="mt-5 inline-block rounded-full bg-turquoise px-7 py-3 text-sm font-semibold text-navy transition hover:brightness-110">{P.cta} →</Link>
        </section>

        <div className="mt-14 rounded-3xl bg-mist p-6 text-center">
          <p className="font-display text-2xl text-navy">{T.questions}</p>
          <p className="mt-2 text-navy/70">{T.questionsText}</p>
          <Link href={href(lang, "/tekneler")} className="mt-4 inline-block rounded-full bg-turquoise px-7 py-3 text-sm font-semibold text-white transition hover:bg-turquoise-dark">{T.browse}</Link>
        </div>
      </main>
      <Footer lang={lang} />
    </>
  );
}
