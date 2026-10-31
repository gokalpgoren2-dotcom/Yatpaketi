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
    <div className="min-h-screen bg-mist">
      <div className="relative overflow-hidden bg-gradient-to-br from-navy via-navy-soft to-[#0e6a96] px-5 pb-24 pt-6 text-white">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-turquoise/25 blur-3xl" />
        <svg aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 w-full opacity-[0.12]" viewBox="0 0 400 60" preserveAspectRatio="none" height="60"><path d="M0 30c40-20 80 20 120 0s80-20 120 0 80 20 120 0 40-10 40-10v40H0z" fill="#fff" /></svg>
        <div className="relative mx-auto max-w-md">
          <Link href="/" aria-label="Ana sayfa" className="inline-block rounded-xl bg-white px-3 py-2"><Logo height={32} /></Link>
          <h1 className="font-display mt-8 text-[34px] leading-tight">Müşteri Girişi</h1>
          <p className="mt-2 text-sm leading-relaxed text-white/80">Sözleşmenizi, tur hazırlığınızı ve teknenizin konumunu buradan takip edin.</p>
        </div>
      </div>

      <main className="relative z-10 mx-auto -mt-14 max-w-md px-5 pb-12">
        <div className="rounded-3xl bg-white p-6 shadow-[0_20px_40px_-20px_rgba(6,38,75,0.35)] ring-1 ring-navy/5">
          {hata && <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-700 ring-1 ring-red-200">{messages[hata] ?? messages.giris}</p>}
          <form action={portalLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy/60">E-posta</label>
              <input id="email" name="email" type="email" required autoComplete="email" placeholder="ornek@eposta.com" className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3.5 text-base outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30" />
            </div>
            <div>
              <label htmlFor="code" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy/60">Giriş kodu</label>
              <input id="code" name="code" required autoComplete="one-time-code" autoCapitalize="characters" placeholder="XXXXX-XXXXX" className="w-full rounded-xl border border-navy/15 bg-white px-4 py-3.5 font-mono text-base uppercase tracking-widest outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30" />
              <p className="mt-1.5 text-xs text-navy/55">Rezervasyonunuz onaylandığında e-posta adresinize gönderilir.</p>
            </div>
            <button type="submit" className="w-full rounded-xl bg-turquoise px-6 py-4 text-base font-semibold text-white shadow-lg shadow-turquoise/25 active:scale-[0.99]">Giriş yap</button>
          </form>
        </div>
        <p className="mt-6 text-center text-sm leading-relaxed text-navy/60">Kodunuz yoksa ya da çalışmıyorsa bizimle WhatsApp'tan iletişime geçin.<br />Kod, tur bitiş tarihinden sonra geçerliliğini yitirir.</p>
      </main>
    </div>
  );
}
