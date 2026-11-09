"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type PickOption = { value: string; label: string; sub?: string; icon?: React.ReactNode };

type Props = {
  id: string;
  label: React.ReactNode;
  labelClass: string;
  value: string;
  options: PickOption[];
  onChange: (v: string) => void;
  title: string;
};

// Arama çubuğu için açılır seçim kutusu: tarayıcının düz listesi yerine
// alanın altında açılan, simgeli ve açıklamalı bir panel (klavye ile de kullanılır).
export function SearchPicker({ id, label, labelClass, value, options, onChange, title }: Props) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [box, setBox] = useState<{ left: number; top: number; width: number; maxH: number; up: boolean } | null>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const listId = useId();
  const current = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => setMounted(true), []);

  function place() {
    const r = btn.current?.getBoundingClientRect();
    if (!r) return;
    const vw = window.innerWidth, vh = window.innerHeight;
    const width = Math.min(Math.max(r.width + 24, 300), vw - 24);
    const left = Math.min(Math.max(12, r.left - 12), vw - width - 12);
    const below = vh - r.bottom - 16, above = r.top - 16;
    const up = below < 260 && above > below;
    setBox({ left, top: up ? r.top - 10 : r.bottom + 10, width, maxH: Math.max(200, Math.min(420, up ? above : below)), up });
  }

  useLayoutEffect(() => { if (open) place(); }, [open]);
  useEffect(() => {
    if (!open) return;
    const close = (e: Event) => {
      const t = e.target as Node;
      if (panel.current?.contains(t) || btn.current?.contains(t)) return;
      setOpen(false);
    };
    const onScroll = (e: Event) => { if (!panel.current?.contains(e.target as Node)) place(); };
    document.addEventListener("pointerdown", close);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("pointerdown", close);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);
  useEffect(() => {
    if (open) panel.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  function openList() {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  }
  function choose(i: number) {
    onChange(options[i].value);
    setOpen(false);
    btn.current?.focus();
  }
  function onKey(e: React.KeyboardEvent) {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); openList(); }
      return;
    }
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(options.length - 1, a + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
    else if (e.key === "Home") { e.preventDefault(); setActive(0); }
    else if (e.key === "End") { e.preventDefault(); setActive(options.length - 1); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); choose(active); }
    else if (e.key === "Escape" || e.key === "Tab") setOpen(false);
  }

  return (
    <>
      <span id={`${id}-label`} className={labelClass}>{label}</span>
      <button
        ref={btn}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={`${id}-label ${id}`}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKey}
        className="flex w-full min-w-0 items-center justify-between gap-2 text-left text-base font-medium text-navy outline-none"
      >
        <span className="truncate">{current?.label}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className={`shrink-0 text-navy/40 transition ${open ? "rotate-180" : ""}`}><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {mounted && open && box && createPortal(
        <div
          ref={panel}
          className="fixed z-[80] overflow-hidden rounded-2xl bg-white text-left shadow-2xl shadow-navy/25 ring-1 ring-navy/10"
          style={{ left: box.left, width: box.width, top: box.up ? undefined : box.top, bottom: box.up ? window.innerHeight - box.top : undefined }}
        >
          <p className="border-b border-navy/5 px-4 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-wider text-navy/45">{title}</p>
          <ul id={listId} role="listbox" aria-labelledby={`${id}-label`} className="overflow-y-auto p-1.5" style={{ maxHeight: box.maxH - 44 }}>
            {options.map((o, i) => {
              const sel = o.value === value;
              return (
                <li
                  key={o.value || "all"}
                  id={`${listId}-${i}`}
                  data-i={i}
                  role="option"
                  aria-selected={sel}
                  onPointerEnter={() => setActive(i)}
                  onClick={() => choose(i)}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition ${i === active ? "bg-mist" : ""}`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${sel ? "bg-navy text-white" : "bg-turquoise/10 text-turquoise-dark"}`}>{o.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-[15px] ${sel ? "font-semibold text-navy" : "font-medium text-navy/85"}`}>{o.label}</span>
                    {o.sub && <span className="block truncate text-xs text-navy/50">{o.sub}</span>}
                  </span>
                  {sel && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="shrink-0 text-turquoise-dark"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>}
                </li>
              );
            })}
          </ul>
        </div>,
        document.body,
      )}
    </>
  );
}
