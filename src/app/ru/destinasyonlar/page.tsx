import type { Metadata } from "next";
import { ListPage } from "@/components/PostPages";
import { gt } from "@/lib/guide-text";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Направления",
  description: gt("ru").metaDest,
  alternates: { canonical: "/ru/destinasyonlar", languages: { tr: "/destinasyonlar", en: "/en/destinasyonlar", ru: "/ru/destinasyonlar" } },
};

export default function Page() {
  const T = gt("ru");
  return <ListPage lang="ru" kind="destination" eyebrow={T.guide} title={T.destinations} intro={T.destIntro} empty={T.destEmpty} />;
}
