"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { isActive, type AgentId, type DeskStatus, type Job, type JobEvent, type OfficeState } from "@/shared/types";

// Arayüzün gerçek yürütme katmanıyla tek bağlantısı: /api uç noktaları ve SSE akışı.
// Burada durum üretilmez; gösterilen her durum sunucudaki görev kaydından gelir.

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Oturum gerekli.");
  }
  const body = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(body.error || `İstek başarısız (${res.status}).`);
  return body;
}

/** Gelen kopya eldekinden eskiyse yok sayılır (SSE ile POST yanıtı sırasız gelebilir). */
const mergeJobs = (prev: Record<string, Job>, incoming: Job[]) => {
  let next = prev;
  for (const j of incoming) {
    const cur = next[j.id];
    if (cur && cur.rev > j.rev) continue;
    if (next === prev) next = { ...prev };
    next[j.id] = j;
  }
  return next;
};

const SEEN_KEY = "aio.seen";
const loadSeen = (): Record<string, number> => {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || "{}");
  } catch {
    return {};
  }
};

export type Connection = "connecting" | "live" | "offline";

export function useOffice(initial: OfficeState) {
  const [jobs, setJobs] = useState<Record<string, Job>>(() => Object.fromEntries(initial.jobs.map((j) => [j.id, j])));
  const [events, setEvents] = useState<Record<string, JobEvent[]>>({});
  const [meta, setMeta] = useState({ mode: initial.mode, model: initial.model, agents: initial.agents, authRequired: initial.authRequired });
  const [conn, setConn] = useState<Connection>("connecting");
  const [seen, setSeen] = useState<Record<string, number>>({});
  const loaded = useRef(new Set<string>());

  useEffect(() => setSeen(loadSeen()), []);

  const refresh = useCallback(async () => {
    const s = await api<OfficeState>("/api/state");
    setMeta({ mode: s.mode, model: s.model, agents: s.agents, authRequired: s.authRequired });
    setJobs((prev) => mergeJobs(prev, s.jobs));
  }, []);

  useEffect(() => {
    const es = new EventSource("/api/events");
    es.onopen = () => {
      setConn("live");
      void refresh().catch(() => {});
    };
    es.onerror = () => setConn("offline");
    es.addEventListener("job", (e) => {
      const job = JSON.parse((e as MessageEvent).data) as Job;
      setJobs((prev) => mergeJobs(prev, [job]));
    });
    es.addEventListener("event", (e) => {
      const ev = JSON.parse((e as MessageEvent).data) as JobEvent;
      setEvents((prev) => {
        const list = prev[ev.jobId] ?? [];
        return list.some((x) => x.id === ev.id) ? prev : { ...prev, [ev.jobId]: [...list, ev] };
      });
    });
    return () => es.close();
  }, [refresh]);

  // SSE kapalıyken (vekil, uyku) durum geri kalmasın diye yedek yoklama.
  useEffect(() => {
    if (conn === "live") return;
    const t = setInterval(() => void refresh().catch(() => {}), 4000);
    return () => clearInterval(t);
  }, [conn, refresh]);

  const loadEvents = useCallback(async (jobId: string) => {
    if (loaded.current.has(jobId)) return;
    loaded.current.add(jobId);
    try {
      const r = await api<{ job: Job; events: JobEvent[] }>(`/api/jobs/${jobId}`);
      setEvents((prev) => {
        const merged = new Map<number, JobEvent>();
        for (const e of [...r.events, ...(prev[jobId] ?? [])]) merged.set(e.id, e);
        return { ...prev, [jobId]: [...merged.values()].sort((a, b) => a.id - b.id) };
      });
    } catch {
      loaded.current.delete(jobId);
    }
  }, []);

  const put = (r: { job: Job }) => setJobs((prev) => mergeJobs(prev, [r.job]));

  const submit = useCallback(async (agentId: AgentId, prompt: string) => {
    const key = crypto.randomUUID();
    const send = () => api<{ job: Job }>("/api/jobs", { method: "POST", headers: { "Idempotency-Key": key }, body: JSON.stringify({ agentId, prompt }) });
    // Ağ hatasında aynı anahtarla bir kez daha denenir; sunucu ikinci bir iş açmaz.
    const r = await send().catch((e) => (e instanceof TypeError ? send() : Promise.reject(e)));
    put(r);
    return r.job;
  }, []);

  const cancel = useCallback(async (id: string) => put(await api<{ job: Job }>(`/api/jobs/${id}/cancel`, { method: "POST" })), []);
  const retry = useCallback(async (id: string) => put(await api<{ job: Job }>(`/api/jobs/${id}/retry`, { method: "POST" })), []);
  const decide = useCallback(
    async (id: string, approvalId: string, approved: boolean) =>
      put(await api<{ job: Job }>(`/api/jobs/${id}/approval`, { method: "POST", body: JSON.stringify({ approvalId, approved }) })),
    [],
  );

  const markSeen = useCallback((agentId: AgentId) => {
    setSeen((prev) => {
      const next = { ...prev, [agentId]: Date.now() };
      try {
        localStorage.setItem(SEEN_KEY, JSON.stringify(next));
      } catch {
        /* özel sekme */
      }
      return next;
    });
  }, []);

  const jobList = useMemo(() => Object.values(jobs).sort((a, b) => b.createdAt - a.createdAt), [jobs]);

  const deskStatus = useCallback(
    (agentId: AgentId): DeskStatus => {
      const mine = jobList.filter((j) => j.agentId === agentId);
      const active = mine.filter((j) => isActive(j.status));
      for (const s of ["approval_required", "working", "queued"] as const) if (active.some((j) => j.status === s)) return s;
      const last = mine[0];
      if (last && (last.status === "completed" || last.status === "failed") && (last.finishedAt ?? 0) > (seen[agentId] ?? 0)) return last.status;
      return "idle";
    },
    [jobList, seen],
  );

  return { ...meta, jobs, jobList, events, conn, loadEvents, submit, cancel, retry, decide, markSeen, deskStatus };
}

export type Office = ReturnType<typeof useOffice>;
