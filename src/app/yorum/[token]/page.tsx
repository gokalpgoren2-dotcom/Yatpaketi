import type { Metadata } from "next";
import { ReviewPageView } from "@/views/ReviewPageView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Yorumunuz | Yatpaketi", robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  return <ReviewPageView lang="tr" token={(await params).token} />;
}
