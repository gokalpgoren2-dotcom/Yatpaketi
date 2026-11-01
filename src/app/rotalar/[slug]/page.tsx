import type { Metadata } from "next";
import { ArticlePage, postMetadata } from "@/components/PostPages";
import { gt } from "@/lib/guide-text";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return postMetadata("route", (await params).slug, "tr");
}

export default async function Article({ params }: { params: Promise<{ slug: string }> }) {
  return <ArticlePage lang="tr" kind="route" slug={(await params).slug} back={{ href: "/rotalar", label: gt("tr").routes }} />;
}
