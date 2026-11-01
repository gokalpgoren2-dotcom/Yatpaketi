import type { Metadata } from "next";
import { ArticlePage, postMetadata } from "@/components/PostPages";
import { gt } from "@/lib/guide-text";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return postMetadata("destination", (await params).slug, "en");
}

export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  return <ArticlePage lang="en" kind="destination" slug={(await params).slug} back={{ href: "/en/destinasyonlar", label: gt("en").destinations }} />;
}
