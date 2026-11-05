import type { Metadata } from "next";
import { ArticlePage, postMetadata } from "@/components/PostPages";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return postMetadata("page", (await params).slug, "ru");
}

export default async function StaticPageRu({ params }: { params: Promise<{ slug: string }> }) {
  return <ArticlePage lang="ru" kind="page" slug={(await params).slug} />;
}
