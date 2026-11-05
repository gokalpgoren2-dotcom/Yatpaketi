import type { Metadata } from "next";
import { ProcessView } from "@/views/ProcessView";
import { gt } from "@/lib/guide-text";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Charter Process",
  description: gt("en").metaProcess,
  alternates: { canonical: "/en/kiralama-sureci", languages: { tr: "/kiralama-sureci", en: "/en/kiralama-sureci", ru: "/ru/kiralama-sureci" } },
};

export default function ProcessPage() {
  return <ProcessView lang="en" />;
}
