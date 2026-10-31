import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import {
  Blog, Categories, Destinations, FeaturedBoats, Footer, HowItWorks, RentalModes, Routes, WhyUs,
} from "@/components/Sections";
import { getBoats, getCategories, getDestinations, getHome } from "@/lib/content";
import { getPosts } from "@/lib/posts";

// Panelden yapılan değişiklikler en geç bir dakika içinde görünür.
export const revalidate = 60;

export default async function Home() {
  const [home, dests, cats, { boats, sample }, posts] = await Promise.all([getHome(), getDestinations(), getCategories(), getBoats(), getPosts(["guide", "blog"], 3)]);
  const featured = boats.filter((b) => b.featured);
  const shown = (featured.length > 0 ? featured : boats).slice(0, 6);
  return (
    <>
      <Header />
      <main>
        <Hero home={home} destinations={dests} />
        <Destinations items={dests} />
        <FeaturedBoats items={shown} sample={sample} />
        <Categories items={cats} />
        <HowItWorks />
        <RentalModes />
        <Routes />
        <WhyUs />
        <Blog items={posts} />
      </main>
      <Footer />
    </>
  );
}
