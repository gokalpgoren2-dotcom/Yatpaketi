import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { Photo } from "@/components/Photo";
import { Placeholder } from "@/components/Placeholder";
import { getCulture } from "@/lib/site-texts";
import { getPost } from "@/lib/posts";
import { href, type Lang } from "@/lib/i18n";

const eyebrow = "text-xs font-semibold uppercase tracking-[0.25em] text-turquoise-dark";
const h2 = "font-display text-3xl font-medium leading-tight text-navy lg:text-5xl";
const wrap = "mx-auto max-w-7xl px-5 lg:px-8";

export async function CultureView({ lang }: { lang: Lang }) {
  const C = (await getCulture())[lang];
  // Kapak fotoğrafı: panel > Yazılar > "Yat ve Yatçılık Kültürü" sayfasına yüklenen fotoğraf (TR kaydında).
  const page = await getPost("page", "yat-ve-yatcilik-kulturu", "tr");
  const cover = page?.cover ?? null;
  return (
    <>
      <Header lang={lang} />
      <main>
        <section className="bg-gradient-to-r from-navy to-[#0b4a66] pb-10 pt-28 text-white lg:pb-14 lg:pt-36">
          <div className={`${wrap} flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between`}>
            <h1 className="font-display text-4xl font-medium lg:text-6xl">{C.title}</h1>
            <p className="max-w-md text-white/80 lg:text-lg">{C.sub}</p>
          </div>
        </section>

        <section id="mavi-yolculuk-giris" className="py-14 lg:py-20">
          <div className={`${wrap} grid items-center gap-10 lg:grid-cols-2 lg:gap-16`}>
            <div>
              <p className={`mb-3 ${eyebrow}`}>{C.heroEyebrow}</p>
              <h2 className={h2}>{C.heroTitle}</h2>
              <p className="mt-6 text-lg leading-relaxed text-navy/80">{C.heroLead}</p>
              {C.heroText.map((t) => <p key={t} className="mt-4 leading-relaxed text-navy/70">{t}</p>)}
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-mist shadow-xl shadow-navy/10">
              {cover ? <Photo src={cover} alt={C.title} priority sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" /> : <Placeholder hue={188} className="h-full w-full" label={false} />}
            </div>
          </div>
          <div className={`${wrap} mt-10 flex flex-wrap gap-3`}>
            {C.chips.map(([label, id]) => (
              <a key={id} href={`#${id}`} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-navy ring-1 ring-navy/10 transition hover:-translate-y-0.5 hover:ring-turquoise">{label}</a>
            ))}
          </div>
        </section>

        <section id="mavi-yolculuk" className="scroll-mt-24 bg-mist/60 py-14 lg:py-20">
          <div className={`${wrap} grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-16`}>
            <div>
              <p className={`mb-3 ${eyebrow}`}>{C.blueEyebrow}</p>
              <h2 className={h2}>{C.blueTitle}</h2>
              <p className="mt-5 text-navy/70">{C.blueLead}</p>
            </div>
            <div className="space-y-5 leading-relaxed text-navy/75">{C.blueText.map((t) => <p key={t}>{t}</p>)}</div>
          </div>
        </section>

        <section id="teknede-yasam" className="scroll-mt-24 py-14 lg:py-20">
          <div className={wrap}>
            <p className={`mb-3 ${eyebrow}`}>{C.lifeEyebrow}</p>
            <h2 className={`${h2} max-w-2xl`}>{C.lifeTitle}</h2>
            <p className="mt-5 max-w-2xl text-navy/70">{C.lifeLead}</p>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {C.life.map(([t, d], i) => (
                <article key={t} className="rounded-3xl bg-white p-6 ring-1 ring-navy/10">
                  <span className="text-xs font-bold tracking-widest text-turquoise-dark">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="font-display mt-3 text-xl text-navy">{t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy/70">{d}</p>
                </article>
              ))}
            </div>
            <blockquote className="mt-10 rounded-r-2xl border-l-4 border-turquoise bg-mist px-6 py-5 text-lg text-navy/80">{C.quote}</blockquote>
          </div>
        </section>

        <section id="denize-saygi" className={`${wrap} scroll-mt-24`}>
          <div className="rounded-[2rem] bg-gradient-to-br from-navy via-[#0a3f63] to-[#0a6a84] p-7 text-white lg:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-turquoise">{C.ecoEyebrow}</p>
            <h2 className="font-display mt-3 max-w-xl text-3xl font-medium leading-tight lg:text-5xl">{C.ecoTitle}</h2>
            <p className="mt-5 max-w-3xl text-white/80">{C.ecoLead}</p>
            <div className="mt-8 grid gap-8 border-t border-white/15 pt-8 md:grid-cols-3">
              {C.eco.map(([t, d]) => (
                <div key={t}><h3 className="text-lg font-semibold">{t}</h3><p className="mt-2 text-sm leading-relaxed text-white/80">{d}</p></div>
              ))}
            </div>
          </div>
        </section>

        <section id="denizcilik-sozlugu" className="scroll-mt-24 py-14 lg:py-20">
          <div className={wrap}>
            <p className={`mb-3 ${eyebrow}`}>{C.gloEyebrow}</p>
            <h2 className={h2}>{C.gloTitle}</h2>
            <p className="mt-5 max-w-2xl text-navy/70">{C.gloLead}</p>
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {C.glo.map(([w, d]) => (
                <div key={w} className="rounded-2xl bg-white p-5 ring-1 ring-navy/10">
                  <h3 className="text-lg font-semibold text-turquoise-dark">{w}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy/70">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="rehberler" className="scroll-mt-24 bg-mist/60 py-14 pb-20 lg:py-20">
          <div className={wrap}>
            <p className={`mb-3 ${eyebrow}`}>{C.guEyebrow}</p>
            <h2 className={h2}>{C.guTitle}</h2>
            <p className="mt-5 max-w-2xl text-navy/70">{C.guLead}</p>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {C.gu.map(([t, d, to]) => (
                <Link key={to} href={href(lang, to)} className="group rounded-2xl bg-white p-5 ring-1 ring-navy/10 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-navy/10">
                  <h3 className="font-semibold text-navy">{t}</h3>
                  <p className="mt-1 text-sm text-navy/65">{d}</p>
                  <span className="mt-3 block text-sm font-semibold text-turquoise-dark">{lang === "en" ? "Explore →" : "Göz at →"}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
    </>
  );
}
