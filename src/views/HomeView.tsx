import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Blog, Destinations, FeaturedBoats, FinalCta, Footer, HowItWorks, RoutesShowcase, WhyUs } from "@/components/Sections";
import { getBoats, getCategories, getDestinations, getHome } from "@/lib/content";
import { getPosts } from "@/lib/posts";
import { getFeaturedOrder } from "@/lib/site-texts";
import { InstagramSection } from "@/components/InstagramSection";
import { InstagramStoriesBar } from "@/components/InstagramStoriesBar";
import type { Lang } from "@/lib/i18n";

export async function HomeView({ lang }: { lang: Lang }) {
  const [home, dests, cats, { boats, sample }, posts] = await Promise.all([
    getHome(lang), getDestinations(lang), getCategories(lang), getBoats(lang), lang === "tr" ? getPosts(["guide", "blog"], 9) : Promise.resolve([]),
  ]);
  const [pref, routes, regions] = await Promise.all([getFeaturedOrder(), getPosts("route", undefined, lang), getPosts("destination", undefined, lang)]);
  const rank = (s: string) => { const i = pref.indexOf(s); return i < 0 ? 9999 : i; };
  const featured = boats.filter((b) => b.featured).sort((a, b) => rank(a.slug) - rank(b.slug));
  const shown = featured.length > 0 ? featured : boats.slice(0, 6);
  return (
    <div lang={lang}>
      <Header lang={lang} />
      <main>
        <Hero home={home} destinations={dests} categories={cats} lang={lang} />
        <InstagramStoriesBar lang={lang} />
        <FeaturedBoats items={shown} sample={sample} cats={cats} lang={lang} />
        <Destinations items={dests} lang={lang} />
        <RoutesShowcase routes={routes} regions={regions} lang={lang} />
        <Blog items={posts} lang={lang} />
        <InstagramSection lang={lang} />
        <HowItWorks lang={lang} />
        <WhyUs lang={lang} />
        <FinalCta lang={lang} />
      </main>
      <Footer lang={lang} />
    </div>
  );
}
