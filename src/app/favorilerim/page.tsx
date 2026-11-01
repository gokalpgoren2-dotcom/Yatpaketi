import type { Metadata } from "next";
import { FavoritesView } from "@/views/FavoritesView";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Favori Tekneler | Yatpaketi",
  robots: { index: false, follow: true },
  alternates: { canonical: "/favorilerim", languages: { tr: "/favorilerim", en: "/en/favorilerim" } },
};

export default function Page() {
  return <FavoritesView lang="tr" />;
}
