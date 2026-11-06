import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { PortalAdmin, type PortalRow, type CheckItem } from "@/components/admin/PortalAdmin";
import { PortalExtrasAdmin, type AdminFile } from "@/components/admin/PortalExtrasAdmin";
import type { Guest, Prefs } from "@/lib/turum";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export default async function PortalDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const cols = "id,email,customer_name,boat_name,tour_start,tour_end,status,location_text,location_updated_at,contract_path,signed_path,signed_at";
  // contract_emailed_at, lat, lng sonradan eklenen sütunlar: SQL henüz çalıştırılmadıysa sayfa yine açılsın.
  const withCol = await supabase.from("customer_portals").select(cols + ",contract_emailed_at,lat,lng,review_open").eq("id", id).maybeSingle();
  const plain = withCol.error ? await supabase.from("customer_portals").select(cols).eq("id", id).maybeSingle() : null;
  const data = (withCol.error ? plain?.data : withCol.data) as Record<string, unknown> | null | undefined;
  if (!data) notFound();
  // Biniş saati (konum-2-saat.sql çalıştırılmadıysa boş kalır, 14:00 kabul edilir)
  const bt = await supabase.from("customer_portals").select("boarding_time").eq("id", id).maybeSingle();
  data.boarding_time = bt.error ? null : (bt.data as { boarding_time?: string | null } | null)?.boarding_time ?? null;
  const { data: items } = await supabase.from("portal_checklist").select("id,label,done,sort_order").eq("portal_id", id).order("sort_order").order("label");
  const store = supabase.storage.from("contracts");
  const sign = async (path: string | null) => (path ? (await store.createSignedUrl(path, 900)).data?.signedUrl ?? null : null);
  const [contractUrl, signedUrl] = await Promise.all([sign(data.contract_path as string | null), sign(data.signed_path as string | null)]);

  // Turum ek bölümleri (turum-misafir.sql çalıştırılmadıysa gösterilmez)
  const [pr, gs, ch, fl, gu] = await Promise.all([
    supabase.from("portal_prefs").select("data,updated_at").eq("portal_id", id).maybeSingle(),
    supabase.from("portal_guests").select("full_name,gender,birth_date,nationality,doc_type,doc_no,phone").eq("portal_id", id).order("sort_order"),
    supabase.from("portal_menu_choices").select("menu_id,portal_menus(title)").eq("portal_id", id),
    supabase.from("portal_files").select("*").eq("portal_id", id).order("created_at", { ascending: false }),
    supabase.from("customer_portals").select("guests_updated_at").eq("id", id).maybeSingle(),
  ]);
  const kv = await supabase.from("customer_portals").select("kvkk_info_at,kvkk_health_at").eq("id", id).maybeSingle();
  const kvkk = (kv.data ?? {}) as { kvkk_info_at?: string | null; kvkk_health_at?: string | null };
  const extrasReady = !gs.error && !fl.error;
  const fileStore = supabase.storage.from("portal-files");
  const files: AdminFile[] = await Promise.all(((fl.data ?? []) as Omit<AdminFile, "url">[]).map(async (f) => ({ ...f, url: f.path ? (await fileStore.createSignedUrl(f.path, 900)).data?.signedUrl ?? null : null })));
  const menuTitles = ((ch.data ?? []) as unknown as { portal_menus: { title: string } | { title: string }[] | null }[])
    .map((c) => (Array.isArray(c.portal_menus) ? c.portal_menus[0]?.title : c.portal_menus?.title)).filter(Boolean) as string[];
  return (
    <>
      <p className="text-sm"><Link href="/admin/musteri-panelleri" className="text-turquoise-dark">← Müşteri Panelleri</Link></p>
      <h1 className="font-display mt-2 text-3xl">{String(data.customer_name || data.email)}</h1>
      <div className="mt-5"><PortalAdmin portal={data as unknown as PortalRow} items={(items ?? []) as unknown as CheckItem[]} contractUrl={contractUrl} signedUrl={signedUrl} /></div>
      {extrasReady ? (
        <div className="mt-5">
          <PortalExtrasAdmin
            portalId={id} boat={String(data.boat_name)}
            prefs={(pr.data?.data as Prefs | undefined) ?? null} prefsAt={(pr.data?.updated_at as string | undefined) ?? null}
            guests={(gs.data ?? []) as Guest[]} guestsAt={((gu.data as { guests_updated_at?: string } | null)?.guests_updated_at) ?? null}
            menus={menuTitles} files={files} kvkkInfoAt={kvkk.kvkk_info_at ?? null} kvkkHealthAt={kvkk.kvkk_health_at ?? null}
          />
        </div>
      ) : (
        <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">Misafir listesi, tercihler, menüler ve alışveriş bölümleri için Supabase&apos;de <b>supabase/turum-misafir.sql</b> dosyasını bir kez çalıştırın.</p>
      )}
    </>
  );
}
