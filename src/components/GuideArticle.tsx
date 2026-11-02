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
const WAVE = (y: number) => `M0 ${y} q180 -60 360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 t360 0 V400 H0 z`;

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
        {/* Başlık: diğer sayfalarla aynı dalgalı lacivert alan; sağda kapak görseli */}
        <section className="relative isolate overflow-hidden pb-24 pt-28 text-white lg:pb-28 lg:pt-36" style={{ background: "linear-gradient(160deg, #05204a 0%, #06264b 45%, #0b4a6e 80%, #0d6a86 100%)" }}>
          <div className="absolute inset-x-0 bottom-0 -z-10 h-28 overflow-hidden" aria-hidden>
            <svg className="wave-a absolute bottom-0 left-0 h-28 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={WAVE(150)} fill="rgba(255,255,255,0.08)" /></svg>
            <svg className="wave-b absolute bottom-0 left-0 h-20 w-[200%]" viewBox="0 0 2880 400" preserveAspectRatio="none"><path d={WAVE(220)} fill="rgba(255,255,255,0.12)" /></svg>
            <svg className="absolute bottom-0 left-0 h-10 w-full" viewBox="0 0 1440 100" preserveAspectRatio="none"><path d="M0 60 q360 -50 720 0 t720 0 V100 H0z" fill="#ffffff" /></svg>
          </div>
          <div className={`${wrap} grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14`}>
            <div>
              <p className="flex flex-wrap items-center gap-2 text-sm text-white/60">
                {back && <Link href={back.href} className="transition hover:text-white">← {back.label}</Link>}
              </p>
              {!isPage && <p className="mt-5 text-xs font-semibold uppercase tracking-[0.3em] text-turquoise">{kindLabel(p.kind, lang)}</p>}
              <h1 className="font-display mt-3 text-[2rem] leading-[1.12] lg:text-[2.75rem]">{p.title}</h1>
              {p.excerpt && <p className="mt-4 max-w-xl text-base font-light leading-relaxed text-white/75 lg:text-[1.05rem]">{p.excerpt}</p>}
              <ul className="mt-6 flex flex-wrap gap-2 text-[13px]">
                <li className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 ring-1 ring-white/15 backdrop-blur">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7fdce6" strokeWidth="2" strokeLinecap="round" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>{L.min}
                </li>
                {toc.length > 1 && <li className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 ring-1 ring-white/15 backdrop-blur">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7fdce6" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M4 6h16M4 12h16M4 18h10" /></svg>{L.parts}
                </li>}
                {date && !isPage && <li className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 ring-1 ring-white/15 backdrop-blur">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7fdce6" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M4 6h16v14H4zM8 3v4M16 3v4M4 10h16" /></svg>{date}
                </li>}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-turquoise/20 blur-3xl" aria-hidden />
              <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-navy shadow-2xl shadow-black/40 ring-1 ring-white/15">
                <PostThumb p={p} sizes="(min-width:1024px) 45vw, 100vw" />
              </div>
            </div>
          </div>
        </section>

        {/* Metin + yan sütun */}
        <section className="pb-16 pt-6 lg:pb-24 lg:pt-10">
          <div className={`${wrap} grid gap-12 lg:grid-cols-[minmax(0,1fr)_17rem] lg:gap-16`}>
            <article id="yazi" className="mx-auto w-full max-w-[42rem] lg:mx-0 lg:ml-auto">
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
                  <h2 className="font-display mt-3 text-xl lg:text-2xl">{L.ctaTitle}</h2>
                  <p className="mt-2.5 text-[0.95rem] font-light text-white/75">{L.ctaText}</p>
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
