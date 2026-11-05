import type { Metadata } from "next";
import { FaqView } from "@/views/FaqView";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular",
  description: "Yat kiralama, rezervasyon, ödeme, rota ve yatta yaşam hakkında sıkça sorulan sorular.",
  alternates: { canonical: "/sss", languages: { tr: "/sss", en: "/en/sss", ru: "/ru/sss" } },
};

export default function FaqPage() {
  return <FaqView lang="tr" />;
}
