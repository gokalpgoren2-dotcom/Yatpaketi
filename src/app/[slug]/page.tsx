import type { Metadata } from "next";
import { ArticlePage, postMetadata } from "@/components/PostPages";

export const revalidate = 60;

// Hakkımızda, SSS gibi sabit sayfalar (panel > Yazılar > "Sabit sayfa"). Yayında olmayan adres 404 verir.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  return postMetadata("page", (await params).slug);
}

export default async function StaticPage({ params }: { params: Promise<{ slug: string }> }) {
  return <ArticlePage kind="page" slug={(await params).slug} />;
}
