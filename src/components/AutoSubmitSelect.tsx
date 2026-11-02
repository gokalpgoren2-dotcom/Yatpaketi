"use client";

// Seçim değişince bağlı olduğu formu hemen gönderen açılır liste (sıralama için).
export function AutoSubmitSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} onChange={(e) => e.currentTarget.form?.requestSubmit()} />;
}
