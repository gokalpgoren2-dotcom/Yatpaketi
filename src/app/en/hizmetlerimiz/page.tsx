import type { Metadata } from "next";
import { ServicesView } from "@/views/ServicesView";
import { getServices } from "@/lib/site-texts";

export const revalidate = 60;
export async function generateMetadata(): Promise<Metadata> {
  const S = (await getServices()).en;
  return {
    title: S.title.replace(/\s+/g, " "),
    description: S.meta,
    alternates: { canonical: "/en/hizmetlerimiz", languages: { tr: "/hizmetlerimiz", en: "/en/hizmetlerimiz", ru: "/ru/hizmetlerimiz" } },
  };
}

export default function ServicesPage() {
  return <ServicesView lang="en" />;
}
