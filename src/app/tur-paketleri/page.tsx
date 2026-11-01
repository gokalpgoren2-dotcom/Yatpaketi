import type { Metadata } from "next";
import { ListPage } from "@/components/PostPages";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Tur Paketleri",
  description: "Hafta sonu, haftalık ve özel günler için hazır mavi yolculuk tur paketleri.",
  alternates: { canonical: "/tur-paketleri" },
};

export default function Page() {
  return (
    <ListPage
      kind="package"
      eyebrow="Yatpaketi Rehberi"
      title="Tur Paketleri"
      intro="Hafta sonu kaçamağından haftalık mavi yolculuğa: süreyi ve amacı belli, kolay seçilen tekne paketleri."
      empty="Tur paketleri çok yakında burada olacak."
    />
  );
}
