import type { Metadata } from "next";
import { ListPage } from "@/components/PostPages";
import { gt } from "@/lib/guide-text";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Классические маршруты",
  description: gt("ru").metaRoutes,
  alternates: { canonical: "/ru/rotalar", languages: { tr: "/rotalar", en: "/en/rotalar", ru: "/ru/rotalar" } },
};

export default function Page() {
  const T = gt("ru");
  return <ListPage lang="ru" kind="route" eyebrow={T.guide} title={T.routesTitle} intro={T.routesIntro} empty={T.routesEmpty} />;
}
