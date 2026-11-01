import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Blog, Categories, Destinations, FeaturedBoats, Footer, HowItWorks, RentalModes, Routes, WhyUs } from "@/components/Sections";
import { getBoats, getCategories, getDestinations, getHome } from "@/lib/content";
import { getPosts } from "@/lib/posts";
import type { Lang } from "@/lib/i18n";

export async function HomeView({ lang }: { lang: Lang }) {
  const [home, dests, cats, { boats, sample }, posts] = await Promise.all([
    getHome(lang), getDestinations(lang), getCategories(lang), getBoats(lang), lang === "tr" ? getPosts(["guide", "blog"], 3) : Promise.resolve([]),
  ]);
  const featured = boats.filter((b) => b.featured);
  const shown = (featured.length > 0 ? featured : boats).slice(0, 6);
  return (
    <div lang={lang}>
      <Header lang={lang} />
      <main>
        <Hero home={home} destinations={dests} categories={cats} lang={lang} />
        <Destinations items={dests} lang={lang} />
        <FeaturedBoats items={shown} sample={sample} lang={lang} />
        <Categories items={cats} lang={lang} />
        <HowItWorks lang={lang} />
        <RentalModes lang={lang} />
        <Routes lang={lang} />
        <WhyUs lang={lang} />
        <Blog items={posts} lang={lang} />
      </main>
      <Footer lang={lang} />
    </div>
  );
}
