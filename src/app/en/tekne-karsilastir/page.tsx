import type { Metadata } from "next";
import { CompareView } from "@/views/CompareView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Compare Yachts | Yatpaketi",
  description: "Compare two yachts side by side on size, age, cabins, water sports and price.",
  alternates: { canonical: "/en/tekne-karsilastir", languages: { tr: "/tekne-karsilastir", en: "/en/tekne-karsilastir", ru: "/ru/tekne-karsilastir" } },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ a?: string; b?: string }> }) {
  const q = await searchParams;
  return <CompareView lang="en" a={q.a} b={q.b} />;
}
