import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import {
  Blog, Categories, Destinations, FeaturedBoats, Footer, HowItWorks, RentalModes, Routes, Support, WhyUs,
} from "@/components/Sections";
import { getDestinations, getHome } from "@/lib/content";

// Panelden yapılan değişiklikler en geç bir dakika içinde görünür.
export const revalidate = 60;

export default async function Home() {
  const [home, dests] = await Promise.all([getHome(), getDestinations()]);
  return (
    <>
      <Header />
      <main>
        <Hero home={home} destinations={dests} />
        <Destinations items={dests} />
        <FeaturedBoats />
        <Categories />
        <HowItWorks />
        <RentalModes />
        <Routes />
        <WhyUs />
        <Blog />
        <Support />
      </main>
      <Footer />
    </>
  );
}
