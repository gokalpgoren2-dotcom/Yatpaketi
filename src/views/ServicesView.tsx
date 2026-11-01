import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { getServices } from "@/lib/site-texts";
import { href, type Lang } from "@/lib/i18n";

const eyebrow = "text-xs font-semibold uppercase tracking-[0.25em] text-turquoise-dark";
const h2 = "font-display text-3xl font-medium leading-tight text-navy lg:text-5xl";
const wrap = "mx-auto max-w-7xl px-5 lg:px-8";

export async function ServicesView({ lang }: { lang: Lang }) {
  const S = (await getServices())[lang];
  const [t1, ...t2] = S.title.split(/(?<=\.)\s+/);
  return (
    <>
      <Header lang={lang} />
      <main>
        <section className="bg-gradient-to-r from-navy to-[#0b4a66] pb-12 pt-28 text-white lg:pb-16 lg:pt-36">
          <div className={`${wrap} flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between`}>
            <h1 className="font-display text-4xl font-medium leading-tight lg:text-6xl">{t1}{t2.length > 0 && <><br /><span className="text-turquoise">{t2.join(" ")}</span></>}</h1>
            <p className="max-w-md border-white/25 text-white/80 lg:border-l lg:pl-6 lg:text-lg">{S.sub}</p>
          </div>
        </section>

        <section className="py-14 lg:py-20">
          <div className={wrap}>
            <p className={`mb-3 ${eyebrow}`}>{S.listEyebrow}</p>
            <h2 className={h2}>{S.listTitle}</h2>
            <p className="mt-5 max-w-2xl text-navy/70">{S.listLead}</p>
            <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {S.items.map(([title, text], i) => (
                <article key={title} className="rounded-3xl bg-white p-7 ring-1 ring-navy/10 lg:p-8">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-turquoise/15 text-sm font-bold text-turquoise-dark">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-display mt-5 text-2xl font-bold text-navy">{title}</h3>
                  <p className="mt-3 leading-relaxed text-navy/70">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={`${wrap} pb-14 lg:pb-20`}>
          <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-navy via-[#0a3d63] to-[#0b6a86] p-8 text-white lg:p-14">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-turquoise">{S.allEyebrow}</p>
            <h2 className="font-display text-3xl font-medium leading-tight lg:text-5xl">{S.allTitle}</h2>
            <p className="mt-5 max-w-2xl text-white/80">{S.allLead}</p>
            <div className="mt-10 grid gap-8 lg:grid-cols-3">
              {S.all.map(([title, text]) => (
                <div key={title} className="border-t border-white/20 pt-5">
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/75">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-20 text-center lg:pb-28">
          <div className="mx-auto max-w-3xl px-5">
            <p className={`mb-3 ${eyebrow}`}>{S.ctaEyebrow}</p>
            <h2 className={h2}>{S.ctaTitle}</h2>
            <p className="mt-5 leading-relaxed text-navy/70">{S.ctaText}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href={href(lang, "/iletisim")} className="rounded-full bg-turquoise px-7 py-3.5 font-semibold text-navy transition hover:brightness-110">{S.ctaBtn1}</Link>
              <Link href={href(lang, "/tekneler")} className="rounded-full px-7 py-3.5 font-semibold text-navy ring-1 ring-navy/15 transition hover:ring-turquoise">{S.ctaBtn2} →</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  );
}
