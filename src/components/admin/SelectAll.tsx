"use client";

export default function SelectAll({ formId }: { formId: string }) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        onChange={(e) => {
          document.querySelectorAll<HTMLInputElement>(`input[name="ids"][form="${formId}"]`).forEach((c) => (c.checked = e.target.checked));
        }}
      />
      Bu sayfadakilerin hepsini seç
    </label>
  );
}
