import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/Logo";
import { loadPortal } from "@/lib/portal";
import { portalLogin } from "./actions";

export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  bos: "E-posta adresinizi ve kodu girin.",
  giris: "E-posta veya kod hatalı, ya da kodun süresi dolmuş. Birkaç kez yanlış girerseniz 15 dakika beklemeniz gerekir.",
  sistem: "Şu an giriş yapılamıyor. Lütfen biraz sonra tekrar deneyin.",
};

export default async function PortalLogin({ searchParams }: { searchParams: Promise<{ hata?: string }> }) {
  const { hata } = await searchParams;
  if (await loadPortal()) redirect("/musteri/panel");
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
      <Link href="/" aria-label="Ana sayfa"><Logo /></Link>
      <h1 className="font-display mt-8 text-3xl text-navy">Müşteri Girişi</h1>
      <p className="mt-2 text-sm text-navy/65">Rezervasyonunuz onaylandığında e-posta adresinize kişiye özel bir kod gönderilir. Kod, tur bitiş tarihinden sonra geçerliliğini yitirir.</p>
      {hata && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700 ring-1 ring-red-200">{messages[hata] ?? messages.giris}</p>}
      <form action={portalLogin} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">E-posta</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30" />
        </div>
        <div>
          <label htmlFor="code" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">Giriş kodu</label>
          <input id="code" name="code" required autoComplete="one-time-code" autoCapitalize="characters" placeholder="XXXXX-XXXXX" className="w-full rounded-xl border border-navy/15 bg-white px-3 py-3 font-mono text-base uppercase tracking-widest outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30" />
        </div>
        <button type="submit" className="w-full rounded-xl bg-turquoise px-6 py-3.5 text-base font-semibold text-white">Giriş yap</button>
      </form>
      <p className="mt-6 text-sm text-navy/60">Kodunuz yoksa ya da çalışmıyorsa bizimle WhatsApp'tan iletişime geçin.</p>
    </main>
  );
}
