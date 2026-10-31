import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import {
  Blog, Categories, Destinations, FeaturedBoats, Footer, HowItWorks, RentalModes, Routes, Support, WhyUs,
} from "@/components/Sections";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Categories />
        <FeaturedBoats />
        <HowItWorks />
        <Destinations />
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
