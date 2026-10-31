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

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
      <p className="font-display text-3xl font-semibold">
        yat<span className="text-turquoise">paketi</span>
      </p>
      <h1 className="mt-6 text-xl font-semibold">Yönetim girişi</h1>

      {!configured ? (
        <p className="mt-4 rounded-xl bg-white p-4 text-sm text-navy/70">
          Supabase bağlantısı henüz yapılandırılmadı. Vercel&apos;de NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY değişkenlerini ekleyip siteyi yeniden yayınlayın.
        </p>
      ) : loggedIn ? (
        <div className="mt-4 space-y-4">
          <p role="alert" className="rounded-xl bg-white p-4 text-sm text-red-700">{messages.yetki}</p>
          <form action={signOut}>
            <button className="rounded-xl bg-navy px-5 py-3 text-sm font-semibold text-white">Çıkış yap</button>
          </form>
        </div>
      ) : (
        <form action={signIn} className="mt-4 space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          {error && <p role="alert" className="text-sm text-red-700">{messages[error] ?? "Giriş yapılamadı."}</p>}
          <div>
            <label htmlFor="email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">E-posta</label>
            <input id="email" name="email" type="email" autoComplete="email" required className="w-full rounded-xl border border-navy/15 px-4 py-3 text-base outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30" />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">Şifre</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required className="w-full rounded-xl border border-navy/15 px-4 py-3 text-base outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30" />
          </div>
          <button className="w-full rounded-xl bg-turquoise px-5 py-3.5 text-sm font-semibold text-white hover:bg-turquoise-dark">Giriş yap</button>
        </form>
      )}
    </main>
  );
}
