import type { Metadata } from "next";
import { ListPage } from "@/components/PostPages";
import { gt } from "@/lib/guide-text";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Destinasyonlar",
  description: gt("tr").metaDest,
  alternates: { canonical: "/destinasyonlar", languages: { tr: "/destinasyonlar", en: "/en/destinasyonlar" } },
};

export default function Page() {
  const T = gt("tr");
  return <ListPage lang="tr" kind="destination" eyebrow={T.guide} title={T.destinations} intro={T.destIntro} empty={T.destEmpty} />;
}
