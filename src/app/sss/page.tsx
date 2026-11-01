import type { Metadata } from "next";
import { FaqView } from "@/views/FaqView";

export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular",
  description: "Tekne kiralama, rezervasyon, ödeme, rota ve teknede yaşam hakkında sıkça sorulan sorular.",
  alternates: { canonical: "/sss", languages: { tr: "/sss", en: "/en/sss" } },
};

export default function FaqPage() {
  return <FaqView lang="tr" />;
}
