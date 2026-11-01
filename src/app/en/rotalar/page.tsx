import type { Metadata } from "next";
import { ListPage } from "@/components/PostPages";
import { gt } from "@/lib/guide-text";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Classic Routes",
  description: gt("en").metaRoutes,
  alternates: { canonical: "/en/rotalar", languages: { tr: "/rotalar", en: "/en/rotalar" } },
};

export default function Page() {
  const T = gt("en");
  return <ListPage lang="en" kind="route" eyebrow={T.guide} title={T.routesTitle} intro={T.routesIntro} empty={T.routesEmpty} />;
}
