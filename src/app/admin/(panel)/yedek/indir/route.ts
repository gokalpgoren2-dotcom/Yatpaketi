import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Giriş kodu özetleri ve oturum belirteçleri yedeğe konmaz (güvenlik); diğer tüm iş verisi dahildir.
const TABLES = [
  "boats", "boat_images", "boat_destinations", "categories", "destinations", "season_prices", "availability_blocks",
  "reservation_requests", "customer_portals", "portal_checklist", "blog_posts", "site_settings",
];

type Row = Record<string, unknown>;

async function all(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"], table: string): Promise<{ rows: Row[]; error?: string }> {
  const rows: Row[] = [];
  for (let from = 0; from < 100000; from += 1000) {
    const { data, error } = await supabase.from(table).select("*").range(from, from + 999);
    if (error) return { rows, error: error.message };
    const part = (data ?? []) as Row[];
    rows.push(...part);
    if (part.length < 1000) break;
  }
  return { rows };
}

const csvCell = (v: unknown) => {
  const s = v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v);
  return /[",\n\r;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET(req: Request) {
  const { supabase } = await requireAdmin();
  const type = new URL(req.url).searchParams.get("tur");
  const day = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" });

  if (type === "rezervasyonlar") {
    const { rows, error } = await all(supabase, "reservation_requests");
    if (error) return new Response("Okunamadı: " + error, { status: 500 });
    const cols = ["created_at", "status", "customer_name", "phone", "email", "boat_name", "start_date", "end_date", "guests", "message", "admin_notes", "cancel_reason", "cancelled_at"];
    const csv = "﻿" + [cols.join(";"), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(";"))].join("\r\n");
    return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="yatpaketi-rezervasyonlar-${day}.csv"`, "Cache-Control": "no-store" } });
  }

  const out: Record<string, Row[]> = {};
  const problems: string[] = [];
  for (const t of TABLES) {
    const { rows, error } = await all(supabase, t);
    if (error) problems.push(`${t}: ${error}`);
    out[t] = t === "customer_portals" ? rows.map((r) => { const { code_hash: _c, failed_attempts: _f, locked_until: _l, ...rest } = r; void _c; void _f; void _l; return rest; }) : rows;
  }
  const body = JSON.stringify({ yedek_tarihi: new Date().toISOString(), uyarilar: problems, tablolar: out }, null, 2);
  return new Response(body, { headers: { "Content-Type": "application/json; charset=utf-8", "Content-Disposition": `attachment; filename="yatpaketi-yedek-${day}.json"`, "Cache-Control": "no-store" } });
}
