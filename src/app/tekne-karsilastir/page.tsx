import type { Metadata } from "next";
import { CompareView } from "@/views/CompareView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Yat Karşılaştırma | Yatpaketi",
  description: "İki yatı boy, yaş, kabin, su sporları ve fiyat açısından yan yana karşılaştırın.",
  alternates: { canonical: "/tekne-karsilastir", languages: { tr: "/tekne-karsilastir", en: "/en/tekne-karsilastir", ru: "/ru/tekne-karsilastir" } },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ a?: string; b?: string }> }) {
  const q = await searchParams;
  return <CompareView lang="tr" a={q.a} b={q.b} />;
}
