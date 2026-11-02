import { saveBoat } from "@/app/admin/(panel)/tekneler/actions";
import { SubmitButton } from "./FormBits";
import { WATER_TOYS, EQUIPMENT, parseToy, parseEquipment } from "@/lib/boatOptions";

type Row = Record<string, any>;
type Opt = { id: string; label: string };


const input = "w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/30";
const label = "mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60";

function Field({ id, title, children, hint }: { id: string; title: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label htmlFor={id} className={label}>{title}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-navy/50">{hint}</p>}
    </div>
  );
}

function Num({ name, title, boat, step, min }: { name: string; title: string; boat: Row | null; step?: string; min?: number }) {
  return (
    <Field id={name} title={title}>
      <input id={name} name={name} type="number" inputMode="decimal" step={step ?? "1"} min={min ?? 0} defaultValue={boat?.[name] ?? ""} className={input} />
    </Field>
  );
}

export function BoatForm({ boat, categories, destinations, selected }: { boat: Row | null; categories: Opt[]; destinations: Opt[]; selected: string[] }) {
  return (
    <form action={saveBoat} className="space-y-8">
      {boat && <input type="hidden" name="id" value={boat.id} />}

      <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Temel bilgiler</h2>
        <Field id="name" title="Yat adı *"><input id="name" name="name" required defaultValue={boat?.name ?? ""} className={input} /></Field>
        <Field id="slug" title="Adres (slug)" hint="Boş bırakırsanız addan otomatik oluşur. Örnek: /tekneler/ornek-gulet">
          <input id="slug" name="slug" defaultValue={boat?.slug ?? ""} className={input} />
        </Field>
        <Field id="category_id" title="Kategori">
          <select id="category_id" name="category_id" defaultValue={boat?.category_id ?? ""} className={input}>
            <option value="">Seçilmedi</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="brand" title="Marka"><input id="brand" name="brand" defaultValue={boat?.brand ?? ""} className={input} /></Field>
          <Field id="model" title="Model"><input id="model" name="model" defaultValue={boat?.model ?? ""} className={input} /></Field>
          <Num name="year" title="Yapım yılı" boat={boat} min={1950} />
          <Num name="refit_year" title="Yenileme yılı" boat={boat} min={1950} />
          <Num name="length_m" title="Uzunluk (m)" boat={boat} step="0.1" />
          <Num name="width_m" title="Genişlik (m)" boat={boat} step="0.1" />
          <Num name="cabins" title="Kabin sayısı" boat={boat} />
          <Num name="guests" title="Misafir kapasitesi" boat={boat} min={1} />
          <Num name="crew" title="Mürettebat sayısı" boat={boat} />
          <Field id="home_port" title="Kalkış limanı"><input id="home_port" name="home_port" defaultValue={boat?.home_port ?? ""} className={input} /></Field>
        </div>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="captain_included" defaultChecked={boat?.captain_included ?? true} className="h-5 w-5" /> Kaptan dahil</label>
        <fieldset>
          <legend className={label}>Kiralama bölgeleri</legend>
          <div className="flex flex-wrap gap-3">
            {destinations.map((d) => (
              <label key={d.id} className="flex items-center gap-2 rounded-full border border-navy/15 px-4 py-2 text-sm">
                <input type="checkbox" name="destinations" value={d.id} defaultChecked={selected.includes(d.id)} className="h-4 w-4" /> {d.label}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Açıklama ve donanım</h2>
        <Field id="description_tr" title="Açıklama (Türkçe)"><textarea id="description_tr" name="description_tr" rows={5} defaultValue={boat?.description_tr ?? ""} className={input} /></Field>
        <Field id="description_en" title="Açıklama (İngilizce)"><textarea id="description_en" name="description_en" rows={5} defaultValue={boat?.description_en ?? ""} className={input} /></Field>
        <EquipmentAndToys boat={boat} />
      </section>

      <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Fiyat</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="price_mode" title="Fiyat gösterimi">
            <select id="price_mode" name="price_mode" defaultValue={boat?.price_mode ?? "show"} className={input}>
              <option value="show">Fiyat göster</option><option value="ask">Fiyat sorunuz</option>
            </select>
          </Field>
          <Field id="currency" title="Para birimi">
            <select id="currency" name="currency" defaultValue={boat?.currency ?? "EUR"} className={input}>
              <option value="EUR">EUR</option><option value="TRY">TRY</option><option value="USD">USD</option>
            </select>
          </Field>
          <Num name="price_daily" title="Günlük fiyat" boat={boat} step="0.01" />
          <Num name="price_weekly" title="Haftalık fiyat" boat={boat} step="0.01" />
        </div>
        <p className="text-xs text-navy/50">Sezonluk fiyatlar sonraki aşamada eklenecek.</p>
      </section>

      <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Yayın ve SEO</h2>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="is_published" defaultChecked={boat?.is_published ?? false} className="h-5 w-5" /> Sitede yayınla</label>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" name="is_featured" defaultChecked={boat?.is_featured ?? false} className="h-5 w-5" /> Öne çıkan yat</label>
        <Num name="sort_order" title="Sıra (küçük sayı önce gelir)" boat={boat} />
        <Field id="seo_title" title="SEO başlığı"><input id="seo_title" name="seo_title" defaultValue={boat?.seo_title ?? ""} className={input} /></Field>
        <Field id="seo_description" title="SEO açıklaması"><textarea id="seo_description" name="seo_description" rows={2} defaultValue={boat?.seo_description ?? ""} className={input} /></Field>
      </section>

      <SubmitButton />
    </form>
  );
}

function EquipmentAndToys({ boat }: { boat: Row | null }) {
  const eq = ((boat?.equipment ?? []) as string[]).map(parseEquipment);
  const toys = ((boat?.water_sports ?? []) as string[]).map(parseToy);
  const stdEq = EQUIPMENT.map((e) => e.name);
  const otherEq = eq.filter((e) => !stdEq.includes(e.name));
  const otherToys = toys.filter((t) => !WATER_TOYS.includes(t.name));
  return (
    <>
      <fieldset>
        <legend className={label}>Donanımlar</legend>
        <p className="mb-2 text-xs text-navy/50">Yatta olanları işaretleyin, istersen yanına ayrıntı yazın.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {EQUIPMENT.map((e) => {
            const cur = eq.find((x) => x.name === e.name);
            return (
              <div key={e.name} className="rounded-xl border border-navy/15 p-3">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" name="equipment_std" value={e.name} defaultChecked={!!cur} className="h-4 w-4" /> {e.name}
                </label>
                <input name={`ed:${e.name}`} defaultValue={cur?.detail ?? ""} placeholder={e.hint || "Ayrıntı (isteğe bağlı)"} aria-label={`${e.name} ayrıntısı`} list={e.options ? `opt-${e.name}` : undefined} className={`${input} mt-2 py-2 text-sm`} />
                {e.options && <datalist id={`opt-${e.name}`}>{e.options.map((o) => <option key={o} value={o} />)}</datalist>}
              </div>
            );
          })}
        </div>
        <div className="mt-3">
          <label htmlFor="equipment" className={label}>Listede olmayan donanımlar</label>
          <textarea id="equipment" name="equipment" rows={3} defaultValue={otherEq.map((e) => (e.detail ? `${e.name} — ${e.detail}` : e.name)).join("\n")} className={input} />
          <p className="mt-1 text-xs text-navy/50">Her satıra bir donanım yazın.</p>
        </div>
      </fieldset>

      <fieldset>
        <legend className={label}>Su oyuncakları</legend>
        <p className="mb-2 text-xs text-navy/50">Yatta olanları işaretleyin, kaç adet olduğunu yazın (boş bırakırsanız adet gösterilmez).</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {WATER_TOYS.map((w) => {
            const cur = toys.find((x) => x.name === w);
            return (
              <div key={w} className="flex items-center justify-between gap-3 rounded-xl border border-navy/15 p-3">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" name="water_sports" value={w} defaultChecked={!!cur} className="h-4 w-4" /> {w}
                </label>
                <input name={`wq:${w}`} type="number" inputMode="numeric" min={1} max={99} defaultValue={cur?.qty ?? ""} placeholder="adet" aria-label={`${w} adedi`} className={`${input} w-20 py-2 text-center text-sm`} />
              </div>
            );
          })}
        </div>
        <div className="mt-3">
          <label htmlFor="water_sports_other" className={label}>Listede olmayan oyuncaklar</label>
          <textarea id="water_sports_other" name="water_sports_other" rows={2} defaultValue={otherToys.map((t) => (t.qty ? `${t.name} ×${t.qty}` : t.name)).join("\n")} className={input} />
          <p className="mt-1 text-xs text-navy/50">Her satıra bir oyuncak yazın.</p>
        </div>
      </fieldset>
    </>
  );
}
