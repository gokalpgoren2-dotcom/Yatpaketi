import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { signOut } from "../login/actions";

const active = [
  { href: "/admin", label: "Genel Bakış" },
  { href: "/admin/tekneler", label: "Tekneler" },
  { href: "/admin/rezervasyonlar", label: "Rezervasyonlar" },
  { href: "/admin/yazilar", label: "Yazılar" },
  { href: "/admin/icerik", label: "Site İçeriği" },
  { href: "/admin/ayarlar", label: "Ayarlar" },
];
const soon = ["Destinasyonlar"];

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdmin();
  return (
    <>
      <header className="border-b border-navy/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/admin" className="font-display text-xl font-semibold">
            yat<span className="text-turquoise">paketi</span> <span className="text-sm font-normal text-navy/50">yönetim</span>
          </Link>
          <form action={signOut} className="flex items-center gap-3">
            <span className="hidden text-xs text-navy/50 sm:inline">{user.email}</span>
            <button className="rounded-lg border border-navy/15 px-3 py-2 text-xs font-semibold">Çıkış</button>
          </form>
        </div>
        <nav aria-label="Yönetim menüsü" className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-3">
          {active.map((l) => (
            <Link key={l.href} href={l.href} className="whitespace-nowrap rounded-full bg-navy px-4 py-2 text-sm font-medium text-white">
              {l.label}
            </Link>
          ))}
          {soon.map((s) => (
            <span key={s} className="whitespace-nowrap rounded-full border border-dashed border-navy/20 px-4 py-2 text-sm text-navy/40">
              {s} · yakında
            </span>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </>
  );
}
