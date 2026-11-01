import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { AdminNav } from "@/components/admin/AdminNav";
import { signOut } from "../login/actions";

const I = {
  home: "M3 11l9-8 9 8v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z",
  inbox: "M4 13l2-8h12l2 8M4 13v6h16v-6M4 13h5l1 2h4l1-2h5",
  tour: "M3 17l2 3h14l2-3zM12 3v10M12 5l6 8h-6",
  cal: "M5 5h14v15H5zM5 10h14M9 3v4M15 3v4",
  user: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0",
  x: "M6 6l12 12M18 6L6 18",
  boat: "M3 17l2 3h14l2-3zM12 3v10M12 5l6 8h-6",
  tag: "M3 12V4h8l10 10-8 8zM8 8h.01",
  pin: "M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21zM12 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5z",
  doc: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6",
  edit: "M4 20h4L19 9l-4-4L4 16zM13 7l4 4",
  save: "M12 3v12M7 10l5 5 5-5M5 21h14",
  star: "M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.2 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z",
  gear: "M12 15a3 3 0 100-6 3 3 0 000 6zM19 12a7 7 0 00-.1-1.2l2-1.5-2-3.4-2.4 1a7 7 0 00-2-1.2L14 3h-4l-.5 2.7a7 7 0 00-2 1.2l-2.4-1-2 3.4 2 1.5A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.4-1a7 7 0 002 1.2L10 21h4l.5-2.7a7 7 0 002-1.2l2.4 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z",
};

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireAdmin();
  // Rezervasyonlar menüsünde yanıt bekleyen yeni talep sayısı görünür.
  const { count } = await supabase.from("reservation_requests").select("id", { count: "exact", head: true }).eq("status", "new");
  const fresh = count ?? 0;
  const { count: pendingReviews } = await supabase.from("reviews").select("id", { count: "exact", head: true }).eq("status", "pending");

  const groups = [
    {
      title: "Günlük işler",
      items: [
        { href: "/admin", label: "Genel Bakış", icon: I.home },
        { href: "/admin/rezervasyonlar", label: "Rezervasyonlar", icon: I.inbox, badge: fresh || undefined },
        { href: "/admin/turlar", label: "Turlar", icon: I.tour },
        { href: "/admin/takvim", label: "Takvim", icon: I.cal },
        { href: "/admin/musteri-panelleri", label: "Müşteri Panelleri", icon: I.user },
        { href: "/admin/iptal-edilenler", label: "İptal Edilenler", icon: I.x },
      ],
    },
    {
      title: "Site içeriği",
      items: [
        { href: "/admin/tekneler", label: "Tekneler", icon: I.boat },
        { href: "/admin/kategoriler", label: "Tekne Tipleri", icon: I.tag },
        { href: "/admin/destinasyonlar", label: "Limanlar", icon: I.pin },
        { href: "/admin/yazilar", label: "Yazılar", icon: I.doc },
        { href: "/admin/yorumlar", label: "Yorumlar", icon: I.star, badge: pendingReviews || undefined },
        { href: "/admin/kampanyalar", label: "Kampanyalar", icon: I.tag },
        { href: "/admin/sayfa-metinleri", label: "Sayfa Metinleri", icon: I.doc },
        { href: "/admin/icerik", label: "Site İçeriği", icon: I.edit },
      ],
    },
    {
      title: "Sistem",
      items: [
        { href: "/admin/yedek", label: "Yedek", icon: I.save },
        { href: "/admin/ayarlar", label: "Ayarlar", icon: I.gear },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-mist">
      <header className="relative overflow-hidden bg-gradient-to-br from-navy via-navy-soft to-[#0e6a96] text-white">
        <div aria-hidden className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-turquoise/25 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 pt-3">
          <div className="flex items-center justify-between gap-3 pb-3">
            <Link href="/admin" className="font-display text-xl font-semibold">
              yat<span className="text-turquoise">paketi</span> <span className="text-sm font-normal text-white/60">yönetim</span>
            </Link>
            <form action={signOut} className="flex items-center gap-3">
              <span className="hidden text-xs text-white/60 sm:inline">{user.email}</span>
              <button className="rounded-full border border-white/25 px-4 py-2 text-xs font-semibold text-white">Çıkış</button>
            </form>
          </div>
          <AdminNav groups={groups} variant="chips" />
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-5">
        <AdminNav groups={groups} variant="sidebar" />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
