import type { Metadata } from "next";
import { ArticlePage, postMetadata } from "@/components/PostPages";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return postMetadata("blog", (await params).slug);
}

export default async function BlogArticle({ params }: { params: Promise<{ slug: string }> }) {
  return <ArticlePage kind="blog" slug={(await params).slug} back={{ href: "/blog", label: "Blog" }} />;
}
