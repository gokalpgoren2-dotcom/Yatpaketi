import type { Metadata } from "next";
import { ListPage } from "@/components/PostPages";
import { gt } from "@/lib/guide-text";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Tour Packages",
  description: gt("en").metaPackages,
  alternates: { canonical: "/en/tur-paketleri", languages: { tr: "/tur-paketleri", en: "/en/tur-paketleri" } },
};

export default function Page() {
  const T = gt("en");
  return <ListPage lang="en" kind="package" eyebrow={T.guide} title={T.packagesTitle} intro={T.packagesIntro} empty={T.packagesEmpty} />;
}
