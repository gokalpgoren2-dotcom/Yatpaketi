import type { Metadata } from "next";
import { AboutView } from "@/views/AboutView";
import { getAbout } from "@/lib/site-texts";

export const revalidate = 60;
export async function generateMetadata(): Promise<Metadata> {
  const A = (await getAbout()).tr;
  return {
    title: A.title.replace(/\s+/g, " "),
    description: A.meta,
    alternates: { canonical: "/hakkimizda", languages: { tr: "/hakkimizda", en: "/en/hakkimizda" } },
  };
}

export default function AboutPage() {
  return <AboutView lang="tr" />;
}
