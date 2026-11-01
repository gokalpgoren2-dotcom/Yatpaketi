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
