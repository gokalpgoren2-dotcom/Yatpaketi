import { requireAdmin } from "@/lib/admin";
import { Notice, SubmitButton } from "@/components/admin/FormBits";
import { formatPhone, normalizePhone } from "@/lib/phone";
import { removeInstagram, saveContact, saveInstagram, testNotifyMail, testRequestMail } from "./actions";
import { igStatus } from "@/lib/instagram";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const input = "w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30";
const lab = "mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60";

export default async function Settings({ searchParams }: { searchParams: Promise<{ error?: string; saved?: string; t?: string; mail?: string }> }) {
  const { error, saved, t, mail } = await searchParams;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("site_settings").select("value").eq("key", "contact").maybeSingle();
  const v = (data?.value ?? {}) as { phone?: string; whatsapp?: string; email?: string };
  const ig = await igStatus();
  const pt = await supabase.from("private_settings").select("key").limit(1);
  const igTable = !pt.error;
  return (
    <>
      <h1 className="font-display text-3xl">Ayarlar</h1>
      <p className="mt-1 text-sm text-navy/60">Bu bilgiler sitede herkese açık görünür. Paylaşmak istemediğinizi boş bırakın.</p>
      {saved && <Notice key={"s" + t} kind="ok" text="Kaydedildi." />}
      {error && <Notice key={"e" + t} kind="error" text={error} />}
      <form action={saveContact} className="mt-6 space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">İletişim bilgileri</h2>
        <div>
          <label htmlFor="phone" className={lab}>Telefon</label>
          <input id="phone" name="phone" type="tel" inputMode="tel" defaultValue={formatPhone(normalizePhone(v.phone ?? ""))} placeholder="0541 681 23 14" className={input} />
        </div>
        <div>
          <label htmlFor="whatsapp" className={lab}>WhatsApp numarası</label>
          <input id="whatsapp" name="whatsapp" type="tel" inputMode="tel" defaultValue={formatPhone(normalizePhone(v.whatsapp ?? ""))} placeholder="0541 681 23 14" className={input} />
          <p className="mt-1 text-xs text-navy/50">Doluysa yat sayfalarında ve ana sayfada WhatsApp düğmesi görünür. Başında 0 ile veya ülke koduyla yazabilirsiniz.</p>
        </div>
        <div>
          <label htmlFor="email" className={lab}>E-posta</label>
          <input id="email" name="email" type="email" defaultValue={v.email ?? ""} className={input} />
        </div>
        <SubmitButton>Kaydet</SubmitButton>
      </form>
      <div id="instagram" className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Instagram</h2>
        <p className="mt-1 text-sm text-navy/60">Bağlanınca ana sayfada güncel story&apos;leriniz (yayındayken) ve son paylaşımlarınız görünür. Anahtar gizli saklanır ve site tarafından kendiliğinden yenilenir.</p>
        {!igTable && <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Önce Supabase&apos;de <b>supabase/instagram.sql</b> dosyasını bir kez çalıştırın.</p>}
        {ig.connected ? (
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">
            <span className="font-semibold">Bağlı{ig.username ? `: @${ig.username}` : ""}</span>
            {ig.refreshedAt && <span className="text-emerald-800/80">Son yenileme: {new Date(ig.refreshedAt).toLocaleDateString("tr-TR")}</span>}
            {ig.source === "db" && <form action={removeInstagram} className="ml-auto"><button type="submit" className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600">Bağlantıyı kaldır</button></form>}
          </div>
        ) : (
          <p className="mt-3 rounded-xl bg-mist p-3 text-sm text-navy/70">Bağlı değil.</p>
        )}
        <form action={saveInstagram} className="mt-4 space-y-3">
          <div>
            <label htmlFor="ig_token" className={lab}>{ig.connected ? "Yeni erişim anahtarı (değiştirmek için)" : "Instagram erişim anahtarı"}</label>
            <input id="ig_token" name="ig_token" type="password" autoComplete="off" placeholder="IGAA… ile başlayan uzun anahtar" className={input} />
          </div>
          <SubmitButton>Instagram&apos;ı bağla</SubmitButton>
        </form>
      </div>
      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Bildirim e-postası</h2>
        <p className="mt-1 text-sm text-navy/60">Yeni talep bildirimleri bu sistemle gelir. Çalışıp çalışmadığını buradan deneyin, hata varsa nedenini gösterir.</p>
        {mail && <p role="status" className="mt-3 rounded-xl bg-mist p-3 text-sm">{mail}</p>}
        <form action={testNotifyMail} className="mt-3"><SubmitButton>Test e-postası gönder</SubmitButton></form>
        <form action={testRequestMail} className="mt-3"><SubmitButton>Örnek talep e-postası gönder</SubmitButton></form>
      </div>
    </>
  );
}
