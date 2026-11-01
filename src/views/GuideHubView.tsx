import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Sections";
import { PostCard } from "@/components/PostCard";
import { BoatIcon } from "@/components/BoatIcon";
import { getNavInfo, getPosts } from "@/lib/posts";
import { href, type Lang } from "@/lib/i18n";
import { gt } from "@/lib/guide-text";

export async function GuideHubView({ lang }: { lang: Lang }) {
  const T = gt(lang);
  const [nav, posts] = await Promise.all([getNavInfo(lang), getPosts("guide", undefined, lang)]);
  const sections = [
    { show: nav.hasDestinations, to: "/destinasyonlar", icon: "pin", title: T.destinations, text: T.hubDest },
    { show: nav.hasRoutes, to: "/rotalar", icon: "route", title: T.routes, text: T.hubRoutes },
    { show: nav.hasPackages, to: "/tur-paketleri", icon: "package", title: T.packages, text: T.hubPackages },
    { show: nav.hasProcess, to: "/kiralama-sureci", icon: "process", title: T.process, text: T.hubProcess },
    { show: nav.pages.some((p) => p.slug === "hakkimizda"), to: "/hakkimizda", icon: "about", title: T.about, text: T.hubAbout },
  ].filter((s) => s.show);
  return (
    <>
      <Header lang={lang} />
      <main className="mx-auto max-w-7xl px-5 pb-20 pt-24 lg:px-8 lg:pt-32">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-turquoise-dark">{T.guide}</p>
        <h1 className="font-display text-3xl font-medium text-navy lg:text-5xl">{T.hubTitle}</h1>
        <p className="mt-4 max-w-2xl text-navy/70">{T.hubIntro}</p>

        {sections.length > 0 && (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((s) => (
              <Link key={s.to} href={href(lang, s.to)} className="group flex gap-4 rounded-3xl bg-white p-6 ring-1 ring-navy/10 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-navy/10">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-turquoise/10 text-turquoise-dark"><BoatIcon name={s.icon} /></span>
                <span>
                  <span className="block font-semibold text-navy">{s.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-navy/65">{s.text}</span>
                  <span className="mt-2 block text-sm font-semibold text-turquoise-dark">{T.look}</span>
                </span>
              </Link>
            ))}
          </div>
        )}

        {posts.length > 0 && (
          <section id="yazilar" className="mt-16 scroll-mt-24">
            <h2 className="font-display text-2xl text-navy lg:text-3xl">{T.articlesTitle}</h2>
            <p className="mt-2 max-w-2xl text-navy/70">{T.articlesIntro}</p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{posts.map((p, i) => <PostCard key={p.slug} p={p} i={i} lang={lang} />)}</div>
          </section>
        )}

        {sections.length === 0 && posts.length === 0 && (
          <p className="mt-10 rounded-3xl bg-mist p-8 text-center text-navy/70">{T.hubEmpty}</p>
        )}
      </main>
      <Footer lang={lang} />
    </>
  );
}
