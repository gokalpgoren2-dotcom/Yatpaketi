import { GuideArt, hasGuideArt } from "./GuideArt";
import { regionMapFor } from "@/lib/region-maps";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Sections";
import { Photo } from "./Photo";
import { PostCard, postHref } from "./PostCard";
import { RichText } from "./RichText";
import { getPost, getPosts, type PostKind } from "@/lib/posts";
import { href, type Lang } from "@/lib/i18n";
import { gt } from "@/lib/guide-text";
import { Scroller } from "./Scroller";
import { getDestPhotos } from "@/lib/site-texts";
import { regionText } from "@/lib/regions";
import { RegionPage } from "./RegionPage";

export async function ListPage({ kind, eyebrow, title, intro, empty, lang = "tr" }: { kind: PostKind; eyebrow: string; title: string; intro: string; empty: string; lang?: Lang }) {
  const posts = await getPosts(kind, undefined, lang);
  return (
    <>
      <Header lang={lang} />
      <main className="mx-auto max-w-7xl px-5 pb-20 pt-24 lg:px-8 lg:pt-32">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-turquoise-dark">{eyebrow}</p>
        <h1 className="font-display text-3xl font-medium text-navy lg:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-navy/70">{intro}</p>
        {posts.length === 0 ? (
          <p className="mt-10 rounded-3xl bg-mist p-8 text-center text-navy/70">{empty}</p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{posts.map((p, i) => <PostCard key={p.slug} p={p} i={i} lang={lang} />)}</div>
        )}
      </main>
      <Footer lang={lang} />
    </>
  );
}

export async function postMetadata(kind: PostKind, slug: string, lang: Lang = "tr"): Promise<Metadata> {
  const p = await getPost(kind, slug, lang);
  if (!p) return {};
  const desc = p.seoDescription || p.excerpt || undefined;
  return {
    title: p.seoTitle || p.title,
    description: desc,
    alternates: { canonical: postHref(p, lang) },
    openGraph: { title: p.seoTitle || p.title, description: desc, images: p.cover ? [p.cover] : undefined, type: "article" },
  };
}

export async function ArticlePage({ kind, slug, back, lang = "tr" }: { kind: PostKind; slug: string; back?: { href: string; label: string }; lang?: Lang }) {
  const T = gt(lang);
  const p = await getPost(kind, slug, lang);
  if (!p) {
    if (lang === "en") redirect(back ? back.href : "/en");
    notFound();
  }
  const map = regionMapFor(kind, slug);
  const more = kind === "page" ? [] : (await getPosts(kind, undefined, lang)).filter((x) => x.slug !== slug).slice(0, 3);
  if (kind === "destination") {
    const photos = await getDestPhotos(slug);
    const R = regionText(slug, lang);
    if (R) return <RegionPage p={p} R={R} photos={photos} map={map} more={more} back={back} lang={lang} />;
    const en = lang === "en";
    const eyebrow = "text-xs font-semibold uppercase tracking-[0.25em] text-turquoise-dark";
    return (
      <>
        <Header lang={lang} />
        <main className="pb-20">
          <section className="relative isolate overflow-hidden bg-[#05204a]">
            {map ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={map} alt={p.title} className="block h-[24rem] w-full object-cover lg:h-[32rem]" />
            ) : p.cover ? (
              <div className="relative h-[24rem] lg:h-[32rem]"><Photo src={p.cover} alt={p.title} priority sizes="100vw" className="object-cover" /></div>
            ) : (
              <div className="h-[24rem] bg-gradient-to-br from-navy via-[#0a3d63] to-[#0b6a86] lg:h-[32rem]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/35 to-navy/25" />
            <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-5 pb-9 text-white lg:px-8 lg:pb-14">
              {back && <Link href={back.href} className="text-sm text-white/80 hover:text-white">← {back.label}</Link>}
              <h1 className="font-display mt-3 max-w-3xl text-4xl font-medium leading-tight lg:text-6xl">{p.title}</h1>
              {p.excerpt && <p className="mt-3 max-w-2xl text-lg text-white/85">{p.excerpt}</p>}
            </div>
          </section>

          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_22rem] lg:gap-14">
              <div>
                <p className={`mb-4 ${eyebrow}`}>{en ? "About the region" : "Bölge hakkında"}</p>
                <div className="max-w-3xl"><RichText text={p.content} /></div>
              </div>
              <aside className="h-fit rounded-3xl bg-gradient-to-br from-navy to-[#0b4a66] p-7 text-white lg:sticky lg:top-28">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-turquoise">{en ? "Plan your trip" : "Planınızı yapalım"}</p>
                <h2 className="font-display mt-3 text-2xl leading-snug">{en ? "Want to sail this region?" : "Bu bölgede yolculuk mu planlıyorsunuz?"}</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/75">{en ? "Tell us your dates and group size, we'll suggest the right yacht and route." : "Tarihlerinizi ve kişi sayınızı yazın, size uygun tekneyi ve rotayı önerelim."}</p>
                <div className="mt-6 flex flex-col gap-3">
                  <Link href={href(lang, "/tekneler")} className="rounded-full bg-turquoise px-6 py-3 text-center text-sm font-semibold text-navy transition hover:brightness-110">{T.browse}</Link>
                  <Link href={href(lang, "/iletisim")} className="rounded-full px-6 py-3 text-center text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/10">{en ? "Write to us" : "Bize yazın"}</Link>
                </div>
              </aside>
            </div>

            {photos.length > 0 && (
              <section className="mt-14">
                <p className={`mb-3 ${eyebrow}`}>{en ? "Gallery" : "Galeri"}</p>
                <div className="grid auto-rows-[10rem] grid-cols-2 gap-3 sm:auto-rows-[12rem] lg:grid-cols-4 lg:gap-4">
                  {photos.map((src, i) => (
                    <div key={src} className={`relative overflow-hidden rounded-2xl bg-mist lg:rounded-3xl ${i === 0 && photos.length > 2 ? "col-span-2 row-span-2" : ""}`}>
                      <Photo src={src} alt={`${p.title} ${i + 1}`} sizes={i === 0 ? "(min-width:1024px) 50vw, 100vw" : "(min-width:1024px) 25vw, 50vw"} className="object-cover transition duration-500 hover:scale-105" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {more.length > 0 && (
              <section className="mt-14">
                <h2 className="font-display text-2xl text-navy lg:text-3xl">{T.moreDest}</h2>
                <div className="mt-6">
                  <Scroller className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 lg:mx-0 lg:gap-6 lg:px-0">
                    {more.map((m, i) => <div key={m.slug} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[calc((100%-3rem)/3)]"><PostCard p={m} i={i} lang={lang} /></div>)}
                  </Scroller>
                </div>
              </section>
            )}
          </div>
        </main>
        <Footer lang={lang} />
      </>
    );
  }
  return (
    <>
      <Header lang={lang} />
      <main className="mx-auto max-w-3xl px-5 pb-20 pt-24 lg:pt-32">
        {back && <p className="mb-4 text-sm"><Link href={back.href} className="text-turquoise-dark">← {back.label}</Link></p>}
        <h1 className="font-display text-3xl font-medium leading-tight text-navy lg:text-5xl">{p.title}</h1>
        {p.excerpt && <p className="mt-4 text-lg text-navy/70">{p.excerpt}</p>}
        {map && (
          <div className="mt-8 overflow-hidden rounded-3xl bg-[#05204a] shadow-lg shadow-navy/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={map} alt={p.title} className="block h-auto w-full" />
          </div>
        )}
        {!map && p.cover && (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-3xl bg-mist">
            <Photo src={p.cover} alt={p.title} priority sizes="(min-width:768px) 768px, 100vw" className="object-cover" />
          </div>
        )}
        {!map && !p.cover && hasGuideArt(p.kind, p.slug) && (
          <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-3xl"><GuideArt slug={p.slug} className="h-full w-full" /></div>
        )}
        <div className="mt-8"><RichText text={p.content} /></div>
        {kind !== "page" && (
          <div className="mt-12 rounded-3xl bg-mist p-6 text-center">
            <p className="font-display text-2xl text-navy">{T.findBoat}</p>
            <Link href={href(lang, "/tekneler")} className="mt-4 inline-block rounded-full bg-turquoise px-7 py-3 text-sm font-semibold text-white transition hover:bg-turquoise-dark">{T.browse}</Link>
          </div>
        )}
        {more.length > 0 && (
          <section className="mt-14">
            <h2 className="font-display text-2xl text-navy">{kind === "route" ? T.moreRoutes : kind === "package" ? T.morePackages : T.morePosts}</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">{more.map((m, i) => <PostCard key={m.slug} p={m} i={i} lang={lang} />)}</div>
          </section>
        )}
      </main>
      <Footer lang={lang} />
    </>
  );
}
