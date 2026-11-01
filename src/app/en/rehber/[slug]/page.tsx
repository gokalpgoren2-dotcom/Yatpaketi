import type { Metadata } from "next";
import { ArticlePage, postMetadata } from "@/components/PostPages";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return postMetadata("guide", (await params).slug, "en");
}

export default async function GuideArticle({ params }: { params: Promise<{ slug: string }> }) {
  return <ArticlePage lang="en" kind="guide" slug={(await params).slug} back={{ href: "/en/rehber", label: "Yatpaketi Guide" }} />;
}
