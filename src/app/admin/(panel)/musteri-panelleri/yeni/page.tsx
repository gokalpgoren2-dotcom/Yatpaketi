import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { PortalCreate } from "@/components/admin/PortalCreate";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

type SP = { email?: string; ad?: string; tekne?: string; bas?: string; bit?: string };
const one = (v?: string) => (v ?? "").slice(0, 200);
const date = (v?: string) => (/^\d{4}-\d{2}-\d{2}$/.test(v ?? "") ? (v as string) : "");

export default async function NewPortal({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  await requireAdmin();
  return (
    <>
      <p className="text-sm"><Link href="/admin/musteri-panelleri" className="text-turquoise-dark">← Müşteri Panelleri</Link></p>
      <h1 className="font-display mt-2 text-3xl">Yeni müşteri paneli</h1>
      <div className="mt-5"><PortalCreate initial={{ email: one(sp.email), name: one(sp.ad), boat: one(sp.tekne), start: date(sp.bas), end: date(sp.bit) }} /></div>
    </>
  );
}
