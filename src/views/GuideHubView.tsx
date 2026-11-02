import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { Photo } from "@/components/Photo";
import { Placeholder } from "@/components/Placeholder";
import { postHref } from "@/components/PostCard";
import { BoatIcon } from "@/components/BoatIcon";
import { getNavInfo, getPosts, type Post } from "@/lib/posts";
import { href, type Lang } from "@/lib/i18n";
import { gt } from "@/lib/guide-text";

// Kart üstündeki küçük etiketler (yazı adresine göre)
const TAG: Record<string, [string, string]> = {
  "gulet-kiralamadan-once": ["Gulet rehberi", "Gulet guide"],
  "motoryat-tatilinin-butcesi": ["Motoryat rehberi", "Motor yacht guide"],
  "hangi-tekne-nasil-bir-yolculuk": ["Yelkenli & Katamaran", "Sailing & catamaran"],
  "bavul-hazirligi": ["Bavul hazırlığı", "Packing"],
  "tatilin-temposu": ["Tatilin temposu", "Holiday pace"],
  "arkadas-grubuyla-tatil": ["Birlikte yolculuk", "Travelling together"],
  "teknede-yemek-plani": ["Lezzet ve hazırlık", "Food and prep"],
  "tekne-tatilinde-fotograflar": ["Fotoğraf ve anılar", "Photos and memories"],
  "gunubirlik-mi-konaklamali-mi": ["Yat seçimi", "Choosing a trip"],
  "teknede-muzik-yuzme-kurallar": ["Kurallar ve güvenlik", "Rules and safety"],
};
const FEATURED_SLUGS = ["gulet-kiralamadan-once", "motoryat-tatilinin-butcesi", "hangi-tekne-nasil-bir-yolculuk"];

export async function GuideHubView({ lang }: { lang: Lang }) {
  const T = gt(lang);
  const en = lang === "en";
  const [nav, posts] = await Promise.all([getNavInfo(lang), getPosts("guide", undefined, lang)]);
  const tag = (p: Post) => TAG[p.slug]?.[en ? 1 : 0];
  const bySlug = (s: string) => posts.find((p) => p.slug === s);

  type Feat = { tag: string; title: string; text: string; to: string; cover?: string | null };
  const feats: Feat[] = [
    ...FEATURED_SLUGS.map(bySlug).filter((p): p is Post => !!p).map((p) => ({ tag: tag(p) ?? "", title: p.title, text: p.excerpt ?? "", to: postHref(p, lang), cover: p.cover })),
    { tag: en ? "Life at sea" : "Denizde yaşam", title: en ? "Yachting culture: the finer points of a voyage" : "Yatçılık kültürü: yolculuğun incelikleri", text: en ? "Sharing shared spaces, respecting the coves and living by the rhythm of the sea: discover the habits that enrich a boat holiday." : "Ortak alanları paylaşmak, kıyılara özen göstermek ve denizin ritmine uyum sağlamak. Yat tatilini zenginleştiren alışkanlıkları keşfet.", to: href(lang, "/yat-ve-yatcilik-kulturu") },
    { tag: en ? "Route ideas" : "Rota fikirleri", title: en ? "Which coast is your next voyage?" : "Bir sonraki yolculuğun hangi kıyıda?", text: en ? "Discover regions from Göcek to Gökova, Hisarönü to Kekova, and shape your holiday around the places you want to see." : "Göcek'ten Gökova'ya, Hisarönü'nden Kekova'ya uzanan bölgeleri tanı. Görmek istediğin yerlerden yola çıkarak tatilini şekillendir.", to: href(lang, "/rotalar") },
    { tag: en ? "Holiday prep" : "Tatil hazırlığı", title: en ? "Settle your questions before you set off." : "Aklındaki soruları yola çıkmadan netleştir.", text: en ? "From meal planning to reservations and the equipment on board: find answers to what you are wondering about." : "Yemek düzeninden rezervasyona, yatta kullanılan ekipmanlardan ulaşım hazırlığına kadar merak edilen konuların cevaplarını bul.", to: href(lang, "/sss") },
  ];
  const featuredSet = new Set(FEATURED_SLUGS);
  const articles = posts.filter((p) => !featuredSet.has(p.slug));
  const sections = [
    { show: nav.hasDestinations, to: "/destinasyonlar", icon: "pin", title: T.destinations },
    { show: nav.hasRoutes, to: "/rotalar", icon: "route", title: T.routes },
    { show: nav.hasPackages, to: "/tur-paketleri", icon: "package", title: T.packages },
    { show: nav.hasProcess, to: "/kiralama-sureci", icon: "process", title: T.process },
    { show: true, to: "/hakkimizda", icon: "about", title: T.about },
  ].filter((s) => s.show);

  return (
    <>
      <Header lang={lang} />
      <main>
        <section className="relative overflow-hidden bg-navy pb-16 pt-28 text-white lg:pb-24 lg:pt-40">
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-turquoise/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-turquoise/10 blur-3xl" />
          <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-turquoise">{T.guide}</p>
            <h1 className="font-display max-w-3xl text-4xl font-medium leading-tight lg:text-6xl">{T.hubTitle}</h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 lg:text-lg">{T.hubIntro}</p>
            <a href="#yazilar" className="mt-8 inline-flex items-center gap-2 rounded-full bg-turquoise px-7 py-3.5 font-semibold text-navy transition hover:brightness-110">{en ? "Browse the guides" : "Yazıları İncele"} <span aria-hidden>↓</span></a>
          </div>
        </section>

        <div id="yazilar" className="mx-auto max-w-7xl scroll-mt-20 px-5 pb-20 pt-14 lg:px-8 lg:pt-20">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-turquoise-dark">{en ? "Reading suggestions" : "Okuma önerileri"}</p>
          <h2 className="font-display text-3xl font-medium text-navy lg:text-4xl">{T.articlesTitle}</h2>
          <p className="mt-3 max-w-2xl text-navy/70">{T.articlesIntro}</p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {feats.map((f, i) => (
              <Link key={f.to + i} href={f.to} className="group flex flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-navy/10 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-navy/15">
                <div className="relative h-2 bg-gradient-to-r from-turquoise to-navy" />
                <div className="flex flex-1 flex-col p-7">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-turquoise-dark">{f.tag}</span>
                  <h3 className="font-display mt-3 text-xl font-medium leading-snug text-navy lg:text-2xl">{f.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-navy/65">{f.text}</p>
                  <span className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-navy/15 px-5 py-2.5 text-sm font-semibold text-navy transition group-hover:border-turquoise group-hover:bg-turquoise group-hover:text-navy">{en ? "Read the guide" : "Rehberi oku"} <span aria-hidden>→</span></span>
                </div>
              </Link>
            ))}
          </div>

          {articles.length > 0 && (
            <>
              <h2 className="font-display mt-16 text-2xl font-medium text-navy lg:text-3xl">{en ? "More to read" : "Daha fazla yazı"}</h2>
              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((p, i) => (
                  <Link key={p.slug} href={postHref(p, lang)} className="group flex flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-navy/10 transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-navy/15">
                    {p.cover && (
                      <div className="relative aspect-[16/9] overflow-hidden">
                        <Photo src={p.cover} alt={p.title} sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-6">
                      {tag(p) && <span className="text-xs font-semibold uppercase tracking-[0.2em] text-turquoise-dark">{tag(p)}</span>}
                      <h3 className="mt-2 text-lg font-semibold leading-snug text-navy">{p.title}</h3>
                      {p.excerpt && <p className="mt-2 flex-1 text-sm leading-relaxed text-navy/65">{p.excerpt}</p>}
                      <span className="mt-5 flex items-center justify-between border-t border-navy/10 pt-4 text-sm font-semibold text-navy"><span>{en ? "Read the article" : "Yazıyı oku"}</span><span aria-hidden className="text-turquoise-dark transition group-hover:translate-x-1">→</span></span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {sections.length > 0 && (
            <div className="mt-16 flex flex-wrap gap-3">
              {sections.map((s) => (
                <Link key={s.to} href={href(lang, s.to)} className="inline-flex items-center gap-2.5 rounded-full bg-mist px-5 py-3 text-sm font-semibold text-navy ring-1 ring-navy/10 transition hover:bg-turquoise/15">
                  <span className="flex h-6 w-6 items-center justify-center text-turquoise-dark"><BoatIcon name={s.icon} /></span>{s.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer lang={lang} />
    </>
  );
}
