import type { Metadata } from "next";
import { ProcessView } from "@/views/ProcessView";
import { gt } from "@/lib/guide-text";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Kiralama Süreci",
  description: gt("tr").metaProcess,
  alternates: { canonical: "/kiralama-sureci", languages: { tr: "/kiralama-sureci", en: "/en/kiralama-sureci", ru: "/ru/kiralama-sureci" } },
};

export default function ProcessPage() {
  return <ProcessView lang="tr" />;
}
