import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { PortalCreate } from "@/components/admin/PortalCreate";

export const dynamic = "force-dynamic";

export default async function NewPortal() {
  await requireAdmin();
  return (
    <>
      <p className="text-sm"><Link href="/admin/musteri-panelleri" className="text-turquoise-dark">← Müşteri Panelleri</Link></p>
      <h1 className="font-display mt-2 text-3xl">Yeni müşteri paneli</h1>
      <div className="mt-5"><PortalCreate /></div>
    </>
  );
}
