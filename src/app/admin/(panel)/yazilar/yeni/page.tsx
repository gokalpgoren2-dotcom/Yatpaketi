import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { PostForm } from "@/components/admin/PostForm";

export const dynamic = "force-dynamic";

export default async function NewPost() {
  await requireAdmin();
  return (
    <>
      <p className="text-sm"><Link href="/admin/yazilar" className="text-turquoise-dark">← Yazılar</Link></p>
      <h1 className="font-display mt-2 text-3xl">Yeni yazı</h1>
      <div className="mt-5"><PostForm post={null} /></div>
    </>
  );
}
