import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const PORTAL_COOKIE = "yp_portal";

// Müşteri paneli oturumsuz (çerezsiz) istemciyle çalışır; tüm yetki veritabanındaki güvenli fonksiyonlardadır.
export function portalDb() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export type PortalData = {
  email: string;
  customer_name: string | null;
  boat_name: string;
  tour_start: string;
  tour_end: string;
  location_open?: boolean;
  location_opens_at?: string;
  lat?: number | null;
  lng?: number | null;
  location_text: string | null;
  location_updated_at: string | null;
  contract_path: string | null;
  signed_at: string | null;
  checklist: { label: string; done: boolean }[];
};

export async function getPortalToken(): Promise<string | null> {
  return (await cookies()).get(PORTAL_COOKIE)?.value ?? null;
}

export async function loadPortal(): Promise<PortalData | null> {
  const token = await getPortalToken();
  if (!token) return null;
  const { data, error } = await portalDb().rpc("portal_get", { p_token: token });
  if (error || !data) return null;
  return data as PortalData;
}
