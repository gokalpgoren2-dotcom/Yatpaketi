import type { Metadata } from "next";
import { ListPage } from "@/components/PostPages";
import { gt } from "@/lib/guide-text";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Klasik Rotalar",
  description: gt("tr").metaRoutes,
  alternates: { canonical: "/rotalar", languages: { tr: "/rotalar", en: "/en/rotalar", ru: "/ru/rotalar" } },
};

export default function Page() {
  const T = gt("tr");
  return <ListPage lang="tr" kind="route" eyebrow={T.guide} title={T.routesTitle} intro={T.routesIntro} empty={T.routesEmpty} />;
}
