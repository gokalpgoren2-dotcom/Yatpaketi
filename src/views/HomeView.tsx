import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Blog, Destinations, FeaturedBoats, Footer, HowItWorks, WhyUs } from "@/components/Sections";
import { getBoats, getCategories, getDestinations, getHome } from "@/lib/content";
import { getPosts } from "@/lib/posts";
import { getFeaturedOrder } from "@/lib/site-texts";
import { InstagramSection } from "@/components/InstagramSection";
import type { Lang } from "@/lib/i18n";

export async function HomeView({ lang }: { lang: Lang }) {
  const [home, dests, cats, { boats, sample }, posts] = await Promise.all([
    getHome(lang), getDestinations(lang), getCategories(lang), getBoats(lang), lang === "tr" ? getPosts(["guide", "blog"], 9) : Promise.resolve([]),
  ]);
  const pref = await getFeaturedOrder();
  const rank = (s: string) => { const i = pref.indexOf(s); return i < 0 ? 9999 : i; };
  const featured = boats.filter((b) => b.featured).sort((a, b) => rank(a.slug) - rank(b.slug));
  const shown = featured.length > 0 ? featured : boats.slice(0, 6);
  return (
    <div lang={lang}>
      <Header lang={lang} />
      <main>
        <Hero home={home} destinations={dests} categories={cats} lang={lang} />
        <Destinations items={dests} lang={lang} />
        <FeaturedBoats items={shown} sample={sample} lang={lang} />
        <Blog items={posts} lang={lang} />
        {lang === "tr" && <InstagramSection />}
        <HowItWorks lang={lang} />
        <WhyUs lang={lang} />
      </main>
      <Footer lang={lang} />
    </div>
  );
}
