import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { Notice } from "@/components/admin/FormBits";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { BlockForm } from "@/components/admin/BlockForm";
import { deleteBlock } from "./actions";

export const dynamic = "force-dynamic";

type Boat = { id: string; name: string };
type Req = { id: string; boat_id: string | null; boat_name: string | null; customer_name: string; start_date: string; end_date: string; status: string };
type Block = { id: string; boat_id: string; start_date: string; end_date: string; kind: string; note: string | null };

const MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];
const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("tr-TR", { day: "numeric", month: "long" });
const range = (a: string, b: string) => (a === b ? fmt(a) : `${fmt(a)} – ${fmt(b)}`);
const shiftMonth = (ym: string, d: number) => { const [y, m] = ym.split("-").map(Number); const dt = new Date(Date.UTC(y, m - 1 + d, 1)); return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}`; };

export default async function Calendar({ searchParams }: { searchParams: Promise<{ tekne?: string; ay?: string; error?: string; saved?: string; t?: string }> }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const nowIst = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });
  const ym = /^\d{4}-\d{2}$/.test(sp.ay ?? "") ? (sp.ay as string) : nowIst.slice(0, 7);
  const [y, m] = ym.split("-").map(Number);
  const daysIn = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const first = `${ym}-01`;
  const last = `${ym}-${pad(daysIn)}`;

  const { data: boatData, error: boatError } = await supabase.from("boats").select("id,name").order("sort_order").order("name");
  const boats = (boatData ?? []) as Boat[];
  const boat = boats.find((b) => b.id === sp.tekne) ?? boats[0];

  const [{ data: reqData }, { data: blockData }] = await Promise.all([
    supabase.from("reservation_requests").select("id,boat_id,boat_name,customer_name,start_date,end_date,status").in("status", ["confirmed", "new", "contacted", "offered"]).lte("start_date", last).gte("end_date", first),
    supabase.from("availability_blocks").select("id,boat_id,start_date,end_date,kind,note").lte("start_date", last).gte("end_date", first),
  ]);
  const reqs = ((reqData ?? []) as Req[]).filter((r) => r.start_date && r.end_date);
  const blocks = (blockData ?? []) as Block[];

  const reqFor = (b: Boat) => reqs.filter((r) => r.boat_id === b.id || (!r.boat_id && r.boat_name === b.name));
  const dayList = Array.from({ length: daysIn }, (_, i) => `${ym}-${pad(i + 1)}`);

  // Her teknenin bu ayki dolu gün sayısı (onaylı + elle kapatılan).
  const fullDays = (b: Boat) => {
    const conf = reqFor(b).filter((r) => r.status === "confirmed");
    const bl = blocks.filter((x) => x.boat_id === b.id);
    return dayList.filter((d) => conf.some((r) => r.start_date <= d && d <= r.end_date) || bl.some((x) => x.start_date <= d && d <= x.end_date)).length;
  };

  const myReqs = boat ? reqFor(boat) : [];
  const confirmed = myReqs.filter((r) => r.status === "confirmed");
  const pending = myReqs.filter((r) => r.status !== "confirmed");
  const myBlocks = boat ? blocks.filter((x) => x.boat_id === boat.id) : [];

  const state = (d: string) => {
    if (confirmed.some((r) => r.start_date <= d && d <= r.end_date)) return "confirmed";
    const b = myBlocks.find((x) => x.start_date <= d && d <= x.end_date);
    if (b) return b.kind === "booked" ? "booked" : "closed";
    if (pending.some((r) => r.start_date <= d && d <= r.end_date)) return "pending";
    return "free";
  };
  const cls: Record<string, string> = {
    free: "bg-white text-navy ring-1 ring-navy/10",
    confirmed: "bg-turquoise font-semibold text-white",
    booked: "bg-amber-500 font-semibold text-white",
    closed: "bg-navy/70 font-semibold text-white",
    pending: "bg-white text-navy ring-2 ring-dashed ring-amber-400",
  };

  const offset = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7;
  const cells: (string | null)[] = [...Array(offset).fill(null), ...dayList];
  const q = (b: string, month: string) => `?tekne=${b}&ay=${month}`;

  return (
    <>
      <h1 className="font-display text-3xl">Takvim</h1>
      <p className="mt-1 text-sm text-navy/60">Yalnızca siz görürsünüz, sitede gösterilmez. Onayladığınız rezervasyonlar bu takvimde otomatik dolu görünür.</p>
      {sp.saved && <Notice key={"s" + sp.t} kind="ok" text="Kaydedildi." />}
      {sp.error && <Notice key={"e" + sp.t} kind="error" text={sp.error} />}
      {boatError && <Notice kind="error" text={"Tekneler okunamadı: " + boatError.message} />}

      {!boat ? (
        <p className="mt-6 rounded-2xl bg-white p-6 text-sm text-navy/60 shadow-sm">Henüz tekne yok. Önce Tekneler bölümünden tekne ekleyin.</p>
      ) : (
        <>
          <nav aria-label="Tekne seçimi" className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {boats.map((b) => (
              <Link key={b.id} href={q(b.id, ym)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium ${b.id === boat.id ? "bg-navy text-white" : "bg-white text-navy ring-1 ring-navy/15"}`}>
                {b.name}<span className="ml-2 text-xs opacity-70">{fullDays(b)} gün dolu</span>
              </Link>
            ))}
          </nav>

          <section className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <Link href={q(boat.id, shiftMonth(ym, -1))} aria-label="Önceki ay" className="flex h-10 w-10 items-center justify-center rounded-full text-xl hover:bg-mist">‹</Link>
              <h2 className="font-semibold">{boat.name} · {MONTHS[m - 1]} {y}</h2>
              <Link href={q(boat.id, shiftMonth(ym, 1))} aria-label="Sonraki ay" className="flex h-10 w-10 items-center justify-center rounded-full text-xl hover:bg-mist">›</Link>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase text-navy/45">{DAYS.map((d) => <span key={d}>{d}</span>)}</div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {cells.map((d, i) => d === null ? <span key={"e" + i} /> : (
                <span key={d} className={`flex h-11 items-center justify-center rounded-lg text-sm tabular-nums ${cls[state(d)]} ${d === nowIst ? "outline outline-2 outline-offset-1 outline-navy" : ""}`}>{Number(d.slice(8))}</span>
              ))}
            </div>
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy/70">
              <li className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-turquoise" />Onaylı rezervasyon</li>
              <li className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-amber-500" />Dolu (elle)</li>
              <li className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-navy/70" />Kapalı</li>
              <li className="flex items-center gap-1.5"><span className="h-3 w-3 rounded ring-2 ring-dashed ring-amber-400" />Bekleyen talep (henüz onaylı değil)</li>
            </ul>
          </section>

          <section className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="font-semibold">Bu ayın kayıtları</h2>
            {confirmed.length + myBlocks.length + pending.length === 0 && <p className="mt-2 text-sm text-navy/60">Bu ay bu tekne için kayıt yok, tamamen boş.</p>}
            <ul className="mt-2 divide-y divide-navy/10 text-sm">
              {confirmed.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                  <span><b>{range(r.start_date, r.end_date)}</b> · {r.customer_name}<span className="ml-2 rounded-full bg-turquoise/15 px-2 py-0.5 text-xs font-semibold text-turquoise-dark">Onaylı</span></span>
                  <Link href="/admin/rezervasyonlar" className="shrink-0 text-xs font-semibold text-turquoise-dark">Talep</Link>
                </li>
              ))}
              {myBlocks.map((x) => (
                <li key={x.id} className="py-3">
                  <p><b>{range(x.start_date, x.end_date)}</b> · {x.kind === "booked" ? "Dolu" : "Kapalı"}{x.note ? ` · ${x.note}` : ""}</p>
                  <div className="mt-2"><ConfirmDelete action={deleteBlock} id={x.id} label="Kaydı sil" warning="Bu tarihler tekrar boş görünür." /></div>
                </li>
              ))}
              {pending.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-3 text-navy/70">
                  <span><b>{range(r.start_date, r.end_date)}</b> · {r.customer_name}<span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">Bekleyen talep</span></span>
                  <Link href="/admin/rezervasyonlar" className="shrink-0 text-xs font-semibold text-turquoise-dark">Talep</Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-semibold">Elle tarih kapat</h2>
            <BlockForm boatId={boat.id} month={ym} />
          </section>
        </>
      )}
    </>
  );
}
