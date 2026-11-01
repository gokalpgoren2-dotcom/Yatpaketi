import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { getAbout } from "@/lib/site-texts";
import { href, type Lang } from "@/lib/i18n";

const eyebrow = "text-xs font-semibold uppercase tracking-[0.25em] text-turquoise-dark";
const h2 = "font-display text-3xl font-medium leading-tight text-navy lg:text-5xl";
const wrap = "mx-auto max-w-7xl px-5 lg:px-8";

export async function AboutView({ lang }: { lang: Lang }) {
  const A = (await getAbout())[lang];
  const [t1, ...t2] = A.title.split(/(?<=\.)\s+/);
  return (
    <>
      <Header lang={lang} />
      <main>
        <section className="bg-gradient-to-r from-navy to-[#0b4a66] pb-12 pt-28 text-white lg:pb-16 lg:pt-36">
          <div className={`${wrap} flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between`}>
            <h1 className="font-display text-4xl font-medium leading-tight lg:text-6xl">{t1}{t2.length > 0 && <><br /><span className="text-turquoise">{t2.join(" ")}</span></>}</h1>
            <p className="max-w-md border-white/25 text-white/80 lg:border-l lg:pl-6 lg:text-lg">{A.sub}</p>
          </div>
        </section>

        <section className="py-14 lg:py-20">
          <div className={`${wrap} grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:gap-16`}>
            <div>
              <p className={`mb-3 ${eyebrow}`}>{A.storyEyebrow}</p>
              <h2 className={h2}>{A.storyTitle}</h2>
              <p className="mt-6 text-lg leading-relaxed text-navy/70">{A.storyLead}</p>
            </div>
            <div className="space-y-5 leading-relaxed text-navy/75">
              {A.story.map((t, i) => <p key={i} className={i === 0 ? "text-lg text-navy/85" : ""}>{t}</p>)}
            </div>
          </div>
        </section>

        <section className="bg-mist/60 py-14 lg:py-20">
          <div className={wrap}>
            <p className={`mb-3 ${eyebrow}`}>{A.expEyebrow}</p>
            <h2 className={h2}>{A.expTitle}</h2>
            <p className="mt-5 max-w-2xl text-navy/70">{A.expLead}</p>
            <div className="mt-10 grid gap-6 lg:grid-cols-2">
              {A.exp.map(([title, ...paras], i) => (
                <article key={title} className="rounded-3xl bg-white p-7 ring-1 ring-navy/10 lg:p-9">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-turquoise/15 text-sm font-bold text-turquoise-dark">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-display mt-5 text-2xl font-medium text-navy">{title}</h3>
                  {paras.map((p, k) => <p key={k} className="mt-4 leading-relaxed text-navy/70">{p}</p>)}
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 lg:py-20">
          <div className={`${wrap} grid gap-10 lg:grid-cols-2 lg:gap-16`}>
            <div>
              <p className={`mb-3 ${eyebrow}`}>{A.wayEyebrow}</p>
              <h2 className={h2}>{A.wayTitle}</h2>
              <div className="mt-6 space-y-4 leading-relaxed text-navy/70">{A.wayText.map((t, i) => <p key={i}>{t}</p>)}</div>
            </div>
            <ol className="divide-y divide-navy/10">
              {A.steps.map(([title, text], i) => (
                <li key={title} className="flex gap-5 py-6 first:pt-0">
                  <span className="mt-1 text-sm font-bold text-turquoise-dark">{String(i + 1).padStart(2, "0")}</span>
                  <div><h3 className="text-lg font-semibold text-navy">{title}</h3><p className="mt-1.5 leading-relaxed text-navy/65">{text}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={`${wrap} pb-14 lg:pb-20`}>
          <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-navy via-[#0a3d63] to-[#0b6a86] p-8 text-white lg:p-14">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-turquoise">{A.respEyebrow}</p>
            <h2 className="font-display text-3xl font-medium leading-tight lg:text-5xl">{A.respTitle}</h2>
            <p className="mt-5 max-w-2xl text-white/80">{A.respLead}</p>
            <div className="mt-10 grid gap-8 lg:grid-cols-3">
              {A.resp.map(([title, text]) => (
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
            <p className={`mb-3 ${eyebrow}`}>{A.ctaEyebrow}</p>
            <h2 className={h2}>{A.ctaTitle}</h2>
            <p className="mt-5 leading-relaxed text-navy/70">{A.ctaText}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href={href(lang, "/iletisim")} className="rounded-full bg-turquoise px-7 py-3.5 font-semibold text-navy transition hover:brightness-110">{A.ctaBtn1}</Link>
              <Link href={href(lang, "/destinasyonlar")} className="rounded-full px-7 py-3.5 font-semibold text-navy ring-1 ring-navy/15 transition hover:ring-turquoise">{A.ctaBtn2} →</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  );
}
