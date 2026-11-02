import Link from "next/link";
import { Header } from "./Header";
import { Footer } from "./Sections";
import { PostCard, PostThumb, kindLabel } from "./PostCard";
import { Scroller } from "./Scroller";
import { RichText, headingsOf } from "./RichText";
import { ReadProgress, Share, Toc } from "./ArticleTools";
import { getContact } from "@/lib/content";
import { href, type Lang } from "@/lib/i18n";
import type { Post } from "@/lib/posts";

const wrap = "mx-auto max-w-7xl px-5 lg:px-8";

// Rehber / blog yazısı sayfası: kapaklı başlık, okuma çubuğu, içindekiler, okunaklı metin, paylaş, teklif kutusu, diğer yazılar.
export async function GuideArticle({ p, more, back, lang }: { p: Post; more: Post[]; back?: { href: string; label: string }; lang: Lang }) {
  const en = lang === "en";
  const contact = await getContact();
  const toc = headingsOf(p.content);
  const words = `${p.excerpt} ${p.content}`.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  const date = p.publishedAt ? new Date(p.publishedAt).toLocaleDateString(en ? "en-GB" : "tr-TR", { day: "numeric", month: "long", year: "numeric" }) : null;
  const wa = contact.whatsapp ? `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(en ? `Hello, I read "${p.title}" and I'd like to plan a boat holiday.` : `Merhaba, "${p.title}" yazınızı okudum, tekne tatili planlamak istiyorum.`)}` : href(lang, "/iletisim");
  const isPage = p.kind === "page";
  const L = {
    toc: en ? "In this article" : "Bu yazıda",
    share: en ? "Share" : "Paylaş",
    copy: en ? "Copy link" : "Bağlantıyı kopyala",
    copied: en ? "Copied" : "Kopyalandı",
    min: en ? `${minutes} min read` : `${minutes} dk okuma`,
    parts: en ? `${toc.length} sections` : `${toc.length} bölüm`,
    ctaEyebrow: en ? "Plan your trip" : "Planınızı yapalım",
    ctaTitle: en ? "Ready to turn this into a holiday?" : "Okuduklarınızı tatile çevirelim mi?",
    ctaText: en ? "Tell us your dates and group size; we'll suggest the right boat and route." : "Tarihlerinizi ve kişi sayınızı yazın; size uygun tekneyi ve rotayı önerelim.",
    wa: en ? "Write on WhatsApp" : "WhatsApp'tan yazın",
    boats: en ? "Browse boats" : "Tekneleri inceleyin",
    more: en ? "Keep reading" : "Okumaya devam edin",
  };

  return (
    <>
      <Header lang={lang} />
      <ReadProgress />
      <main>
        {/* Başlık: beyaz zemin, ortada başlık, altında geniş kapak */}
        <section className="pt-28 lg:pt-36">
          <div className="mx-auto max-w-3xl px-5 text-center lg:px-8">
            <p className="flex flex-wrap items-center justify-center gap-2 text-sm text-navy/50">
              {back && <Link href={back.href} className="transition hover:text-turquoise-dark">← {back.label}</Link>}
              {back && !isPage && <span className="text-navy/25">/</span>}
              {!isPage && <span className="font-semibold uppercase tracking-[0.2em] text-turquoise-dark">{kindLabel(p.kind, lang)}</span>}
            </p>
            <h1 className="font-display mt-5 text-[2.4rem] leading-[1.08] text-navy lg:text-[3.6rem]">{p.title}</h1>
            {p.excerpt && <p className="mx-auto mt-5 max-w-2xl text-lg font-light leading-relaxed text-navy/60 lg:text-xl">{p.excerpt}</p>}
            <p className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-navy/45">
              <span>{L.min}</span>
              {toc.length > 1 && <><span aria-hidden>·</span><span>{L.parts}</span></>}
              {date && !isPage && <><span aria-hidden>·</span><span>{date}</span></>}
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-6xl px-5 lg:mt-14 lg:px-8">
            <div className="relative aspect-[16/9] overflow-hidden rounded-[2rem] bg-mist shadow-2xl shadow-navy/10 sm:aspect-[21/9]">
              <PostThumb p={p} sizes="(min-width:1152px) 1152px, 100vw" />
            </div>
          </div>
        </section>

        {/* Metin + yan sütun */}
        <section className="pb-16 pt-12 lg:pb-24 lg:pt-16">
          <div className={`${wrap} grid gap-12 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-16`}>
            <article id="yazi" className="mx-auto w-full max-w-[44rem] lg:mx-0 lg:ml-auto">
              {toc.length > 1 && (
                <details className="mb-8 rounded-3xl bg-mist p-5 lg:hidden">
                  <summary className="cursor-pointer text-sm font-semibold text-navy">{L.toc} ({toc.length})</summary>
                  <ol className="mt-3 space-y-2 text-sm">
                    {toc.map(({ t, id }, i) => <li key={id}><a href={`#${id}`} className="text-navy/70 hover:text-turquoise-dark"><span className="mr-2 text-navy/35">{String(i + 1).padStart(2, "0")}</span>{t}</a></li>)}
                  </ol>
                </details>
              )}
              <RichText text={p.content} article />
              <div className="mt-12 border-t border-navy/10 pt-6">
                <Share title={p.title} label={L.share} copyLabel={L.copy} copiedLabel={L.copied} />
              </div>
              {!isPage && (
                <div className="relative isolate mt-12 overflow-hidden rounded-[2rem] p-7 text-white lg:p-10" style={{ background: "linear-gradient(135deg, #06264b 0%, #0b4a6e 60%, #0d6a86 100%)" }}>
                  <svg className="absolute -bottom-8 -right-8 -z-10 h-48 w-48 text-white/[0.06]" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M12 3v13l7-1L12 3ZM11 6v9H6l5-9ZM4 17h16l-2 3H6l-2-3Z" /></svg>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-turquoise">{L.ctaEyebrow}</p>
                  <h2 className="font-display mt-3 text-2xl font-semibold lg:text-3xl">{L.ctaTitle}</h2>
                  <p className="mt-3 text-white/75">{L.ctaText}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a href={wa} target={contact.whatsapp ? "_blank" : undefined} rel="noopener noreferrer" className="rounded-full bg-turquoise px-6 py-3 text-sm font-semibold text-navy transition hover:brightness-110">{L.wa}</a>
                    <Link href={href(lang, "/tekneler")} className="rounded-full px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/10">{L.boats}</Link>
                  </div>
                </div>
              )}
            </article>
            <aside className="hidden lg:block">
              <div className="sticky top-28 space-y-6">
                {toc.length > 1 && <Toc items={toc} title={L.toc} />}
                {!isPage && (
                  <a href={wa} target={contact.whatsapp ? "_blank" : undefined} rel="noopener noreferrer" className="group block rounded-3xl bg-mist p-5 transition hover:bg-navy hover:text-white">
                    <p className="font-display text-lg font-semibold">{L.ctaTitle}</p>
                    <p className="mt-2 text-sm font-semibold text-turquoise-dark group-hover:text-turquoise">{L.wa} →</p>
                  </a>
                )}
              </div>
            </aside>
          </div>
        </section>

        {more.length > 0 && (
          <section className="bg-mist py-16 lg:py-20">
            <div className={wrap}>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="font-display text-3xl font-semibold text-navy lg:text-4xl">{L.more}</h2>
                {back && <Link href={back.href} className="text-sm font-semibold text-turquoise-dark">{back.label} →</Link>}
              </div>
              <div className="mt-8">
                <Scroller className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 lg:mx-0 lg:gap-6 lg:px-0">
                  {more.map((m, i) => <div key={m.slug} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[calc((100%-3rem)/3)]"><PostCard p={m} i={i} lang={lang} /></div>)}
                </Scroller>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer lang={lang} />
    </>
  );
}
