import type { Metadata } from "next";
import { ArticlePage, postMetadata } from "@/components/PostPages";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return postMetadata("destination", (await params).slug);
}

export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  return <ArticlePage kind="destination" slug={(await params).slug} back={{ href: "/destinasyonlar", label: "Destinasyonlar" }} />;
}
