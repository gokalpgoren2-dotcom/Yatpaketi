"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MODE_LABEL } from "@/shared/office";
import { AGENT_IDS, isActive, type AgentId, type DeskStatus, type OfficeState } from "@/shared/types";
import { Board } from "./Board";
import { DeskPanel } from "./DeskPanel";
import { OfficeScene } from "./OfficeScene";
import { useOffice } from "./useOffice";

function useIsWide() {
  const [wide, setWide] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const on = () => setWide(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return wide;
}

export function OfficeApp({ initial }: { initial: OfficeState }) {
  const office = useOffice(initial);
  const [selected, setSelected] = useState<AgentId | null>(null);
  const [board, setBoard] = useState(false);
  const wide = useIsWide();
  const { deskStatus } = office;

  const statuses = useMemo(() => Object.fromEntries(AGENT_IDS.map((id) => [id, deskStatus(id)])) as Record<AgentId, DeskStatus>, [deskStatus]);
  const activeCount = office.jobList.filter((j) => isActive(j.status)).length;
  const approvals = office.jobList.filter((j) => j.status === "approval_required").length;

  const openDesk = useCallback((id: AgentId) => {
    setSelected(id);
    setBoard(false);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelected(null);
        setBoard(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Açık panelin kapladığı alan: masaüstünde sağ sütun, mobilde alt sayfa.
  const insets = useMemo(() => {
    const open = !!selected || board;
    return { right: wide && open ? 440 : 0, bottom: !wide && open && typeof window !== "undefined" ? Math.min(window.innerHeight * 0.74, 640) : 0 };
  }, [wide, selected, board]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <main className="ao-root">
      <OfficeScene statuses={statuses} selected={selected} onSelect={openDesk} insets={insets} />

      <header className="ao-topbar ao-glass">
        <div className="ao-brand">
          <b>yatpaketi</b>
          <span>AI Office</span>
        </div>
        <span className={`ao-mode ao-mode-${office.mode}`} title={office.mode === "claude" ? `Model: ${office.model}` : "ANTHROPIC_API_KEY tanımlı değil. Ajanlar depo üzerinde sabit denetim çalıştırır."}>
          {MODE_LABEL[office.mode]}
        </span>
        {office.conn !== "live" && <span className="ao-conn">{office.conn === "connecting" ? "Bağlanıyor…" : "Canlı bağlantı koptu, yoklanıyor"}</span>}
        <span className="ao-spacer" />
        <button type="button" className="ao-btn" onClick={() => setBoard((v) => !v)} aria-pressed={board}>
          Görev Panosu
          {activeCount > 0 && <i className="ao-count">{activeCount}</i>}
          {approvals > 0 && <i className="ao-count ao-count-warn">{approvals} onay</i>}
        </button>
        {office.authRequired && (
          <button type="button" className="ao-btn ao-btn-ghost" onClick={() => void logout()}>
            Çıkış
          </button>
        )}
      </header>

      {office.mode === "local" && !selected && !board && (
        <p className="ao-hint ao-glass">
          Yerel mod: dil modeli bağlı değil. Masalar depo üzerinde gerçek ama sabit denetimler çalıştırır; serbest görev yürütmek için <code>ANTHROPIC_API_KEY</code> tanımlayın.
        </p>
      )}
      {!selected && !board && <p className="ao-help">Masaya tıklayın: görev verin · Zemine tıklayın: yürüyün · Sürükleyin: kaydırın · Tekerlek ya da iki parmak: yakınlaştırın</p>}

      {selected && !board && <DeskPanel agentId={selected} office={office} onClose={() => setSelected(null)} />}
      {board && <Board office={office} onOpenDesk={openDesk} onClose={() => setBoard(false)} />}
    </main>
  );
}
