import type { Metadata } from "next";
import { ServicesView } from "@/views/ServicesView";
import { getServices } from "@/lib/site-texts";

export const revalidate = 60;
export async function generateMetadata(): Promise<Metadata> {
  const S = (await getServices()).tr;
  return {
    title: S.title.replace(/\s+/g, " "),
    description: S.meta,
    alternates: { canonical: "/hizmetlerimiz", languages: { tr: "/hizmetlerimiz", en: "/en/hizmetlerimiz" } },
  };
}

export default function ServicesPage() {
  return <ServicesView lang="tr" />;
}
