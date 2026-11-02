export function supabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// Proje adresinin sonundaki / veya fazladan yol (ör. /rest/v1) varsa temizler.
export function supabaseOrigin() {
  const raw = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
  try {
    return new URL(raw).origin;
  } catch {
    return raw.replace(/\/+$/, "");
  }
}

export function publicImageUrl(path: string | null | undefined) {
  if (!path) return null;
  if (path.startsWith("/") || path.startsWith("http")) return path; // sitenin kendi klasöründeki fotoğraflar (ör. /tekneler/...)
  return `${supabaseOrigin()}/storage/v1/object/public/media/${path}`;
}
