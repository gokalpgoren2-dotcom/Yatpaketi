import type { Config } from "../config";

// Meta Marketing API: yalnızca okuma (GET insights). Yazma, yayınlama ya da bütçe değiştirme yoktur.
export async function fetchMetaInsights(meta: Config["meta"], datePreset: string, signal?: AbortSignal) {
  const url = new URL(`https://graph.facebook.com/${meta.graphVersion}/act_${meta.adAccountId}/insights`);
  url.searchParams.set("level", "campaign");
  url.searchParams.set("date_preset", datePreset);
  url.searchParams.set("fields", "campaign_name,impressions,reach,clicks,ctr,cpc,spend,actions");
  url.searchParams.set("limit", "50");
  const res = await fetch(url, { headers: { Authorization: `Bearer ${meta.token}` }, signal });
  const body = (await res.json().catch(() => null)) as { data?: unknown[]; error?: { message?: string } } | null;
  if (!res.ok || !body || body.error) throw new Error(body?.error?.message || `HTTP ${res.status}`);
  return { source: "Meta Marketing API", datePreset, fetchedAt: new Date().toISOString(), campaigns: body.data ?? [] };
}
