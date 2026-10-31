"use client";

import { useState } from "react";
import { DateRangePicker } from "@/components/DateRangePicker";
import { SubmitButton } from "./FormBits";
import { addBlock } from "@/app/admin/(panel)/takvim/actions";

// Rezervasyon dışında bir tekneyi elle kapatmak için (bakım, kendi kullanımınız, başka yerden gelen rezervasyon).
export function BlockForm({ boatId, month }: { boatId: string; month: string }) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [err, setErr] = useState("");
  return (
    <form
      action={addBlock}
      onSubmit={(e) => { if (!start || !end) { e.preventDefault(); setErr("Giriş ve çıkış tarihini seçin."); } }}
      className="space-y-3"
      key={month}
    >
      <input type="hidden" name="boat_id" value={boatId} />
      <input type="hidden" name="start" value={start} />
      <input type="hidden" name="end" value={end} />
      {err && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">{err}</p>}
      <DateRangePicker label="Kapatılacak tarihler" start={start} end={end} allowPast onChange={(a, b) => { setStart(a); setEnd(b); setErr(""); }} />
      <div>
        <label htmlFor="kind" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">Sebep türü</label>
        <select id="kind" name="kind" defaultValue="closed" className="w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base">
          <option value="closed">Kapalı (bakım, kendi kullanımımız)</option>
          <option value="booked">Dolu (başka yerden gelen rezervasyon)</option>
        </select>
      </div>
      <div>
        <label htmlFor="note" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-navy/60">Not</label>
        <input id="note" name="note" maxLength={200} placeholder="Örn. Yıllık bakım" className="w-full rounded-xl border border-navy/15 bg-white px-3 py-3 text-base" />
      </div>
      <SubmitButton>Tarihleri kapat</SubmitButton>
    </form>
  );
}
