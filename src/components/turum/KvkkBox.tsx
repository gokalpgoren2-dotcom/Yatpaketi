"use client";

import { KVKK_INFO } from "@/lib/turum";

// Onay kutusu + açılır aydınlatma metni
export function KvkkBox({ checked, onChange, label, email, showInfo = true }: { checked: boolean; onChange: (v: boolean) => void; label: string; email: string; showInfo?: boolean }) {
  const contact = email ? `${email} adresine` : "iletişim sayfamızdaki adreslerden bize";
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-navy/10">
      {showInfo && (
        <details className="group mb-3">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-semibold text-turquoise-dark [&::-webkit-details-marker]:hidden">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7l8-4Z" /></svg>
            KVKK aydınlatma metnini okuyun
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="transition group-open:rotate-180"><path d="M6 9l6 6 6-6" /></svg>
          </summary>
          <dl className="mt-3 max-h-72 space-y-2.5 overflow-y-auto rounded-xl bg-mist p-4 text-[13px] leading-relaxed text-navy/75">
            {KVKK_INFO.map(([k, v]) => (
              <div key={k}><dt className="font-semibold text-navy">{k}</dt><dd>{v.replace("{iletisim}", contact)}</dd></div>
            ))}
          </dl>
        </details>
      )}
      <label className="flex cursor-pointer items-start gap-3">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#0f95a4]" />
        <span className="text-sm leading-relaxed text-navy/80">{label}</span>
      </label>
    </div>
  );
}
