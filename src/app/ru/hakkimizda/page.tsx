import type { Metadata } from "next";
import { ruDeep } from "@/lib/ru";
import { AboutView } from "@/views/AboutView";
import { getAbout } from "@/lib/site-texts";

export const revalidate = 60;
export async function generateMetadata(): Promise<Metadata> {
  const A = ruDeep((await getAbout()).en);
  return {
    title: A.title.replace(/\s+/g, " "),
    description: A.meta,
    alternates: { canonical: "/ru/hakkimizda", languages: { tr: "/hakkimizda", en: "/en/hakkimizda", ru: "/ru/hakkimizda" } },
  };
}

export default function AboutPage() {
  return <AboutView lang="ru" />;
}
