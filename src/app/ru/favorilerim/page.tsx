import type { Metadata } from "next";
import { FavoritesView } from "@/views/FavoritesView";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Избранные яхты | Yatpaketi",
  robots: { index: false, follow: true },
  alternates: { canonical: "/ru/favorilerim", languages: { tr: "/favorilerim", en: "/en/favorilerim", ru: "/ru/favorilerim" } },
};

export default function Page() {
  return <FavoritesView lang="ru" />;
}
