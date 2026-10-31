import type { Metadata } from "next";
import { ListPage } from "@/components/PostPages";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Yatpaketi Rehberi",
  description: "Mavi yolculuk, tekne seçimi, kumanya, mürettebat ve tekne kiralama hakkında bilmeniz gerekenler.",
  alternates: { canonical: "/rehber" },
};

export default function GuidePage() {
  return (
    <ListPage
      kind="guide"
      eyebrow="Yatpaketi Rehberi"
      title="Tekne kiralamadan önce bilmeniz gerekenler"
      intro="Mavi yolculuk, tekne seçimi, yemek, mürettebat ve daha fazlası: ilk kez tekne kiralayanlar için kısa ve sade rehberler."
      empty="Rehber yazıları çok yakında burada olacak."
    />
  );
}
