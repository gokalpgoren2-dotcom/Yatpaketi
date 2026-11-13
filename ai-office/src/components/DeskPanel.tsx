"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SAMPLE_TASKS, deskOf } from "@/shared/office";
import type { AgentId } from "@/shared/types";
import { JobCard, StatusPill } from "./JobCard";
import type { Office } from "./useOffice";

export function DeskPanel({ agentId, office, onClose }: { agentId: AgentId; office: Office; onClose: () => void }) {
  const desk = deskOf(agentId);
  const info = office.agents.find((a) => a.id === agentId);
  const jobs = useMemo(() => office.jobList.filter((j) => j.agentId === agentId).reverse(), [office.jobList, agentId]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const status = office.deskStatus(agentId);
  const { markSeen } = office;
  const lastKey = jobs.length ? `${jobs[jobs.length - 1].id}:${jobs[jobs.length - 1].status}` : "";

  useEffect(() => {
    markSeen(agentId);
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [agentId, lastKey, markSeen]);

  useEffect(() => {
    setText("");
    setError("");
  }, [agentId]);

  const send = async () => {
    const prompt = text.trim();
    if (prompt.length < 3 || sending) return;
    setSending(true);
    setError("");
    try {
      await office.submit(agentId, prompt);
      setText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Görev gönderilemedi.");
    } finally {
      setSending(false);
    }
  };

  return (
    <aside className="ao-panel ao-glass" aria-label={`${desk.name} masası`}>
      <header className="ao-panel-head">
        <span className="ao-avatar-chip" style={{ background: desk.shirt, borderColor: desk.accent }}>
          {desk.name[0]}
        </span>
        <div>
          <h2>
            {desk.name} <small>{desk.role}</small>
          </h2>
          <p className="ao-dim">
            <code>{agentId}</code>
          </p>
        </div>
        <StatusPill status={status} />
        <button type="button" className="ao-icon-btn" aria-label="Masayı kapat" onClick={onClose}>
          ×
        </button>
      </header>

      <div className="ao-panel-info">
        {info?.defined ? (
          <>
            <p>{info.description}</p>
            <p className="ao-dim">Yetkili araçlar: {info.tools.length ? info.tools.join(", ") : "yok"}</p>
          </>
        ) : (
          <p className="ao-error">
            Ajan tanımı bulunamadı: <code>.claude/agents/{agentId}.md</code>. Tanım eklenene kadar bu masa görev yürütemez.
          </p>
        )}
        {info && info.missingIntegrations.length > 0 && (
          <p className="ao-warn">Bağlı olmayan entegrasyon: {info.missingIntegrations.join("; ")}. Bu veriye dayanan sonuç üretilmez.</p>
        )}
      </div>

      <div className="ao-thread" ref={scroller}>
        {jobs.length === 0 ? (
          <div className="ao-empty">
            <p>Bu masada henüz görev yok. Örnek bir görevle başlayabilirsiniz:</p>
            {SAMPLE_TASKS[agentId].map((s) => (
              <button type="button" key={s} className="ao-chip" onClick={() => setText(s)}>
                {s}
              </button>
            ))}
          </div>
        ) : (
          jobs.map((j) => <JobCard key={j.id} job={j} office={office} />)
        )}
      </div>

      <form
        className="ao-composer"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        {error && <p className="ao-error">{error}</p>}
        <label className="ao-sr" htmlFor="ao-task">
          {desk.name} için görev
        </label>
        <textarea
          id="ao-task"
          rows={2}
          value={text}
          maxLength={8000}
          placeholder={`${desk.name} için görev yazın…`}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              void send();
            }
          }}
        />
        <button type="submit" className="ao-btn ao-btn-primary" disabled={sending || text.trim().length < 3 || !info?.defined}>
          {sending ? "Gönderiliyor…" : "Görev ver"}
        </button>
      </form>
    </aside>
  );
}
