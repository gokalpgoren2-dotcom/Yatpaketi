"use client";

import { useEffect, useState } from "react";
import { STATUS_COLOR, STATUS_LABEL, deskOf } from "@/shared/office";
import { isActive, type Job, type JobEvent } from "@/shared/types";
import { Markdown } from "./Markdown";
import { fmtCost, fmtDuration, fmtTime } from "./format";
import type { Office } from "./useOffice";

export function StatusPill({ status }: { status: Job["status"] | "idle" }) {
  return (
    <span className="ao-pill" style={{ ["--c" as string]: STATUS_COLOR[status] }}>
      <i />
      {STATUS_LABEL[status]}
    </span>
  );
}

function eventLine(e: JobEvent): string | null {
  const d = e.data as Record<string, string | number | boolean | undefined>;
  switch (e.type) {
    case "tool":
      return `Araç: ${d.summary ?? d.tool}${d.gate === "deny" ? " (reddedildi)" : d.gate === "ask" ? " (onay istendi)" : ""}`;
    case "tool_result":
      return d.ok === false ? `Araç hatası: ${d.tool}: ${d.error}` : null;
    case "approval":
      return d.decision === "pending" ? `Onay istendi: ${d.summary}` : d.decision === "approved" ? "Kullanıcı onayladı" : "Kullanıcı reddetti";
    case "handoff":
      return d.to ? `Yönlendirildi: ${deskOf(d.to as never)?.name ?? d.to} (${d.to})` : `Rapor döndü: ${d.from} (${STATUS_LABEL[d.status as Job["status"]] ?? d.status})`;
    case "error":
      return `Hata: ${d.message}${d.retryInMs ? ` · ${Math.round(Number(d.retryInMs) / 1000)} sn sonra yeniden denenecek` : ""}`;
    case "status":
      return d.status === "working" ? `Yürütme başladı (deneme ${d.attempt ?? 1})` : d.status === "queued" && d.by === "user-retry" ? "Yeniden kuyruğa alındı" : null;
    case "message":
      return String(d.text ?? "").slice(0, 400);
    default:
      return null;
  }
}

export function JobCard({ job, office, showAgent = false }: { job: Job; office: Office; showAgent?: boolean }) {
  const [busy, setBusy] = useState("");
  const [err, setErr] = useState("");
  const [logOpen, setLogOpen] = useState(false);
  const events = office.events[job.id] ?? [];
  const active = isActive(job.status);
  const { loadEvents } = office;

  useEffect(() => {
    if (active || logOpen) void loadEvents(job.id);
  }, [active, logOpen, job.id, loadEvents]);

  const act = (name: string, fn: () => Promise<unknown>) => async () => {
    setBusy(name);
    setErr("");
    try {
      await fn();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "İşlem başarısız.");
    } finally {
      setBusy("");
    }
  };

  const lines = events.map((e) => ({ e, text: eventLine(e) })).filter((x) => x.text);
  const visible = logOpen ? lines : lines.slice(-3);
  const desk = deskOf(job.agentId);
  const pa = job.pendingApproval;

  return (
    <article className="ao-job">
      <div className="ao-bubble ao-bubble-user">
        <p>{job.prompt}</p>
        <time>
          {job.parentId ? "Kaptan yönlendirdi · " : ""}
          {fmtTime(job.createdAt)}
        </time>
      </div>
      <div className="ao-bubble ao-bubble-agent" style={{ ["--accent" as string]: desk.accent }}>
        <header>
          {showAgent && <strong>{desk.name}</strong>}
          <StatusPill status={job.status} />
          <span className={`ao-mode ao-mode-${job.mode}`}>{job.mode === "claude" ? "Claude" : "Yerel"}</span>
          {job.attempt > 1 && <span className="ao-dim">deneme {job.attempt}</span>}
        </header>

        {(active || logOpen) && visible.length > 0 && (
          <ul className="ao-log" aria-live="polite">
            {visible.map(({ e, text }) => (
              <li key={e.id} data-type={e.type}>
                {text}
              </li>
            ))}
          </ul>
        )}
        {job.status === "queued" && <p className="ao-dim">Görev sırada. Yürütme başladığında burada görünecek.</p>}

        {pa && job.status === "approval_required" && (
          <div className="ao-approval" role="alertdialog" aria-label="Onay gerekiyor">
            <strong>Onayınız gerekiyor</strong>
            <p>{pa.summary}</p>
            {pa.detail && <pre>{pa.detail}</pre>}
            <div className="ao-row">
              <button type="button" className="ao-btn ao-btn-primary" disabled={!!busy} onClick={act("ok", () => office.decide(job.id, pa.id, true))}>
                Onayla
              </button>
              <button type="button" className="ao-btn" disabled={!!busy} onClick={act("no", () => office.decide(job.id, pa.id, false))}>
                Reddet
              </button>
            </div>
          </div>
        )}

        {job.status === "completed" && job.report && <Markdown text={job.report} />}
        {job.status === "failed" && <p className="ao-error">{job.error || "Görev başarısız oldu."}</p>}
        {job.status === "cancelled" && <p className="ao-dim">Görev iptal edildi. Rapor üretilmedi.</p>}

        <footer>
          {job.usage && (
            <span className="ao-dim">
              {fmtDuration(job.usage.durationMs)}
              {job.mode === "claude" && ` · ${job.usage.turns} tur · ${(job.usage.inputTokens + job.usage.outputTokens).toLocaleString("tr-TR")} token · ${fmtCost(job.usage.costUsd)}`}
            </span>
          )}
          <span className="ao-spacer" />
          <button type="button" className="ao-link" onClick={() => setLogOpen((v) => !v)}>
            {logOpen ? "Kaydı gizle" : "Kaydı göster"}
          </button>
          {job.status === "completed" && job.report && (
            <button type="button" className="ao-link" onClick={() => void navigator.clipboard?.writeText(job.report!)}>
              Kopyala
            </button>
          )}
          {active && (
            <button type="button" className="ao-link ao-link-danger" disabled={!!busy} onClick={act("cancel", () => office.cancel(job.id))}>
              İptal et
            </button>
          )}
          {(job.status === "failed" || job.status === "cancelled") && !job.parentId && (
            <button type="button" className="ao-link" disabled={!!busy} onClick={act("retry", () => office.retry(job.id))}>
              Yeniden dene
            </button>
          )}
        </footer>
        {err && <p className="ao-error">{err}</p>}
      </div>
    </article>
  );
}
