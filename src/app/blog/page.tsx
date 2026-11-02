import type { Metadata } from "next";
import { ListPage } from "@/components/PostPages";

export const revalidate = 60;
export const metadata: Metadata = {
  title: "Blog",
  description: "Rotalar, koylar ve yat tatili üzerine yazılar.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  return <ListPage kind="blog" eyebrow="Blog" title="Seyahat yazıları" intro="Rotalar, koylar ve yat tatili üzerine yazılar." empty="Blog yazıları çok yakında burada olacak." />;
}
