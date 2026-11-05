import type { Metadata } from "next";
import { BoatsListView, type SP } from "@/views/BoatsListView";

export const metadata: Metadata = {
  title: "Яхты в аренду",
  description: "Гулеты, моторные яхты, катамараны и парусники в аренду в Турции.",
  alternates: { canonical: "/ru/tekneler", languages: { tr: "/tekneler", en: "/en/tekneler", ru: "/ru/tekneler" } },
  robots: { index: false, follow: true },
};

export const revalidate = 60;

export default async function BoatsPageRu({ searchParams }: { searchParams: Promise<SP> }) {
  return <BoatsListView lang="ru" sp={await searchParams} />;
}
