import type { Metadata } from "next";
import { ListPage } from "@/components/PostPages";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Klasik Rotalar",
  description: "Göcek, Fethiye, Bodrum, Datça ve Marmaris çıkışlı klasik mavi yolculuk rotaları ve gün gün tanıtımları.",
  alternates: { canonical: "/rotalar" },
};

export default function Page() {
  return (
    <ListPage
      kind="route"
      eyebrow="Yatpaketi Rehberi"
      title="Klasik Rotalar"
      intro="Mavi yolculuğun denenmiş klasik rotaları: kaç gece, hangi koylar, nerede yüzülür, nerede akşam yemeği yenir."
      empty="Rota tanıtımları çok yakında burada olacak."
    />
  );
}
