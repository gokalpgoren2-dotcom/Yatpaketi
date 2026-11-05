import type { Metadata } from "next";
import { BoatsListView, type SP } from "@/views/BoatsListView";

export const metadata: Metadata = {
  title: "Boats for Charter",
  description: "Filter gulets, motor yachts, catamarans and sailing yachts for charter in Türkiye.",
  alternates: { canonical: "/en/tekneler", languages: { tr: "/tekneler", en: "/en/tekneler", ru: "/ru/tekneler" } },
  robots: { index: false, follow: true },
};

export const revalidate = 60;

export default async function BoatsPageEn({ searchParams }: { searchParams: Promise<SP> }) {
  return <BoatsListView lang="en" sp={await searchParams} />;
}
