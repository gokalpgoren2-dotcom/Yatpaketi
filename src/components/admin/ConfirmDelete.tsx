"use client";

import { useState } from "react";

// İki adımlı silme: önce "Sil", sonra "Evet, sil". Tarayıcı onay penceresi kullanılmaz.
export function ConfirmDelete({ action, id, label = "Sil", warning = "Bu kayıt kalıcı olarak silinir.", next }: { action: (formData: FormData) => void | Promise<void>; id: string; label?: string; warning?: string; next?: string }) {
  const [ask, setAsk] = useState(false);
  if (!ask) {
    return <button type="button" onClick={() => setAsk(true)} className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700">{label}</button>;
  }
  return (
    <form action={action} className="rounded-xl bg-red-50 p-3 ring-1 ring-red-200">
      <input type="hidden" name="id" value={id} />
      {next && <input type="hidden" name="next" value={next} />}
      <p className="text-sm font-medium text-red-800">{warning} Emin misiniz?</p>
      <div className="mt-2 flex gap-2">
        <button type="submit" className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white">Evet, sil</button>
        <button type="button" onClick={() => setAsk(false)} className="rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm font-semibold">Vazgeç</button>
      </div>
    </form>
  );
}
