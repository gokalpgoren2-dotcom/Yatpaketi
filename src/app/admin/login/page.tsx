import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/config";
import { signIn, signOut } from "./actions";

const messages: Record<string, string> = {
  bos: "E-posta ve şifreyi girin.",
  giris: "E-posta veya şifre hatalı.",
  yetki: "Bu hesabın yönetici yetkisi yok.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const configured = supabaseConfigured();
  let loggedIn = false;

  if (configured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      loggedIn = true;
      const { data: row } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
      if (row) redirect("/admin");
    }
  }

  const field = "w-full rounded-xl border border-navy/15 bg-white px-4 py-3.5 text-base outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30";
  return (
    <div className="min-h-screen bg-mist">
      <div className="relative overflow-hidden bg-gradient-to-br from-navy via-navy-soft to-[#0e6a96] px-5 pb-24 pt-8 text-white">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-turquoise/25 blur-3xl" />
        <div className="relative mx-auto max-w-md">
          <p className="font-display text-3xl font-semibold">yat<span className="text-turquoise">paketi</span></p>
          <h1 className="font-display mt-8 text-[32px] leading-tight">Yönetim girişi</h1>
          <p className="mt-2 text-sm text-white/75">Rezervasyonlar, turlar ve site içeriği tek yerde.</p>
        </div>
      </div>
      <main className="relative z-10 mx-auto -mt-14 max-w-md px-5 pb-12">
        {!configured ? (
          <p className="rounded-3xl bg-white p-6 text-sm text-navy/70 shadow-sm">
            Supabase bağlantısı henüz yapılandırılmadı. Vercel&apos;de NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY değişkenlerini ekleyip siteyi yeniden yayınlayın.
          </p>
        ) : loggedIn ? (
          <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
            <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{messages.yetki}</p>
            <form action={signOut}>
              <button className="rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white">Çıkış yap</button>
            </form>
          </div>
        ) : (
          <form action={signIn} className="space-y-4 rounded-3xl bg-white p-6 shadow-[0_20px_40px_-20px_rgba(6,38,75,0.35)] ring-1 ring-navy/5">
            {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700 ring-1 ring-red-200">{messages[error] ?? "Giriş yapılamadı."}</p>}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy/60">E-posta</label>
              <input id="email" name="email" type="email" autoComplete="email" required className={field} />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-navy/60">Şifre</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required className={field} />
            </div>
            <button className="w-full rounded-xl bg-turquoise px-5 py-4 text-base font-semibold text-white shadow-lg shadow-turquoise/25 hover:bg-turquoise-dark">Giriş yap</button>
          </form>
        )}
      </main>
    </div>
  );
}
