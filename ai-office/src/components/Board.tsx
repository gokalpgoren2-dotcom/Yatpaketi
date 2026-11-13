"use client";

import { useState } from "react";
import { JOB_STATUS_ORDER, STATUS_COLOR, STATUS_LABEL, deskOf } from "@/shared/office";
import type { AgentId, Job } from "@/shared/types";
import { JobCard, StatusPill } from "./JobCard";
import { fmtTime } from "./format";
import type { Office } from "./useOffice";

const TABS = [
  ["board", "Pano"],
  ["history", "Geçmiş"],
  ["reports", "Raporlar"],
  ["handoffs", "Yönlendirmeler"],
] as const;
type Tab = (typeof TABS)[number][0];

function Row({ job, onOpen }: { job: Job; onOpen: (id: AgentId) => void }) {
  const d = deskOf(job.agentId);
  return (
    <button type="button" className="ao-rowcard" onClick={() => onOpen(job.agentId)}>
      <span className="ao-avatar-chip ao-avatar-sm" style={{ background: d.shirt, borderColor: d.accent }}>
        {d.name[0]}
      </span>
      <span className="ao-rowcard-main">
        <b>
          {d.name} <small>{d.role}</small>
        </b>
        <span>{job.prompt}</span>
      </span>
      <span className="ao-rowcard-side">
        <StatusPill status={job.status} />
        <time>{fmtTime(job.createdAt)}</time>
      </span>
    </button>
  );
}

export function Board({ office, onOpenDesk, onClose }: { office: Office; onOpenDesk: (id: AgentId) => void; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("board");
  const [open, setOpen] = useState<string | null>(null);
  const jobs = office.jobList;
  const reports = jobs.filter((j) => j.status === "completed" && j.report);
  const handoffs = jobs.filter((j) => j.parentId);

  return (
    <section className="ao-board ao-glass" aria-label="Görev panosu">
      <header className="ao-panel-head">
        <h2>Görev Panosu</h2>
        <span className="ao-spacer" />
        <button type="button" className="ao-icon-btn" aria-label="Panoyu kapat" onClick={onClose}>
          ×
        </button>
      </header>
      <div className="ao-tabs" role="tablist">
        {TABS.map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? "is-on" : ""} onClick={() => setTab(id)}>
            {label}
            {id === "reports" && reports.length > 0 && <i>{reports.length}</i>}
            {id === "handoffs" && handoffs.length > 0 && <i>{handoffs.length}</i>}
          </button>
        ))}
      </div>

      <div className="ao-board-body">
        {jobs.length === 0 && <p className="ao-empty">Henüz görev yok. Ofiste bir masaya tıklayıp ilk görevi verin.</p>}

        {tab === "board" &&
          jobs.length > 0 &&
          JOB_STATUS_ORDER.map((s) => {
            const list = jobs.filter((j) => j.status === s);
            if (!list.length && (s === "cancelled" || s === "failed")) return null;
            return (
              <div key={s} className="ao-lane">
                <h3 style={{ ["--c" as string]: STATUS_COLOR[s] }}>
                  <i />
                  {STATUS_LABEL[s]} <small>{list.length}</small>
                </h3>
                {list.length === 0 ? <p className="ao-dim">Bu durumda görev yok.</p> : list.slice(0, 12).map((j) => <Row key={j.id} job={j} onOpen={onOpenDesk} />)}
              </div>
            );
          })}

        {tab === "history" && jobs.map((j) => <Row key={j.id} job={j} onOpen={onOpenDesk} />)}

        {tab === "reports" &&
          (reports.length === 0 ? (
            <p className="ao-empty">Tamamlanmış rapor yok. Raporlar yalnızca gerçekten biten görevlerden oluşur.</p>
          ) : (
            reports.map((j) =>
              open === j.id ? (
                <div key={j.id}>
                  <button type="button" className="ao-link" onClick={() => setOpen(null)}>
                    ‹ Rapor listesine dön
                  </button>
                  <JobCard job={j} office={office} showAgent />
                </div>
              ) : (
                !open && (
                  <button type="button" key={j.id} className="ao-rowcard" onClick={() => setOpen(j.id)}>
                    <span className="ao-rowcard-main">
                      <b>
                        {deskOf(j.agentId).name} <small>{j.mode === "claude" ? "Claude raporu" : "Yerel denetim raporu"}</small>
                      </b>
                      <span>{j.prompt}</span>
                    </span>
                    <span className="ao-rowcard-side">
                      <time>{fmtTime(j.finishedAt)}</time>
                    </span>
                  </button>
                )
              ),
            )
          ))}

        {tab === "handoffs" &&
          (handoffs.length === 0 ? (
            <p className="ao-empty">Ajanlar arası yönlendirme yok. Kaptan masasına birden fazla uzmanlık isteyen bir görev verdiğinizde burada görünür.</p>
          ) : (
            handoffs.map((j) => (
              <button type="button" key={j.id} className="ao-rowcard" onClick={() => onOpenDesk(j.agentId)}>
                <span className="ao-rowcard-main">
                  <b>
                    Kaptan → {deskOf(j.agentId).name} <small>{deskOf(j.agentId).role}</small>
                  </b>
                  <span>{j.prompt}</span>
                </span>
                <span className="ao-rowcard-side">
                  <StatusPill status={j.status} />
                  <time>{fmtTime(j.createdAt)}</time>
                </span>
              </button>
            ))
          ))}
      </div>
    </section>
  );
}
