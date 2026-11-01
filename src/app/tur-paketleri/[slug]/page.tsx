import type { Metadata } from "next";
import { ArticlePage, postMetadata } from "@/components/PostPages";
import { gt } from "@/lib/guide-text";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return postMetadata("package", (await params).slug, "tr");
}

export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  return <ArticlePage lang="tr" kind="package" slug={(await params).slug} back={{ href: "/tur-paketleri", label: gt("tr").packages }} />;
}
