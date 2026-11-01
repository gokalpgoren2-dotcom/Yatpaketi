import type { Metadata } from "next";
import { ListPage } from "@/components/PostPages";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Destinasyonlar",
  description: "Göcek 12 Ada, Kelebekler Vadisi, Kekova, Knidos ve Gökova gibi mavi yolculuk destinasyonlarının tanıtımı.",
  alternates: { canonical: "/destinasyonlar" },
};

export default function Page() {
  return (
    <ListPage
      kind="destination"
      eyebrow="Yatpaketi Rehberi"
      title="Destinasyonlar"
      intro="Mavi yolculukta uğrayabileceğiniz koylar, adalar ve antik limanlar: nerede ne var, ne zaman gidilir, nelere dikkat edilir."
      empty="Destinasyon tanıtımları çok yakında burada olacak."
    />
  );
}
