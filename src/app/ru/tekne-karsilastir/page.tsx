import type { Metadata } from "next";
import { CompareView } from "@/views/CompareView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Сравнение яхт | Yatpaketi",
  description: "Сравните две яхты по размеру, возрасту, каютам, водным развлечениям и цене.",
  alternates: { canonical: "/ru/tekne-karsilastir", languages: { tr: "/tekne-karsilastir", en: "/en/tekne-karsilastir", ru: "/ru/tekne-karsilastir" } },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ a?: string; b?: string }> }) {
  const q = await searchParams;
  return <CompareView lang="ru" a={q.a} b={q.b} />;
}
