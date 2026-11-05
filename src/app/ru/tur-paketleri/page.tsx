import type { Metadata } from "next";
import { ListPage } from "@/components/PostPages";
import { gt } from "@/lib/guide-text";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Туры",
  description: gt("ru").metaPackages,
  alternates: { canonical: "/ru/tur-paketleri", languages: { tr: "/tur-paketleri", en: "/en/tur-paketleri", ru: "/ru/tur-paketleri" } },
};

export default function Page() {
  const T = gt("ru");
  return <ListPage lang="ru" kind="package" eyebrow={T.guide} title={T.packagesTitle} intro={T.packagesIntro} empty={T.packagesEmpty} />;
}
