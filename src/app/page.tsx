import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import {
  Blog, Categories, Destinations, FeaturedBoats, Footer, RentalModes, Routes, Support, WhyUs,
} from "@/components/Sections";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Destinations />
        <FeaturedBoats />
        <Categories />
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
