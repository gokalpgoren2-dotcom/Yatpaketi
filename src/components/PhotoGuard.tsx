"use client";

import { useEffect } from "react";

// Fotoğraflarda sağ tık ("Resmi farklı kaydet"), sürükleyip bırakma ve telefonda uzun basıp kaydetme kapalı.
// Yönetim panelinde etkin değildir.
export function PhotoGuard() {
  useEffect(() => {
    if (location.pathname.startsWith("/admin")) return;
    const isPhoto = (t: EventTarget | null) => t instanceof Element && Boolean(t.closest("img, picture, video, [data-photo]"));
    const block = (e: Event) => { if (isPhoto(e.target)) e.preventDefault(); };
    document.addEventListener("contextmenu", block);
    document.addEventListener("dragstart", block);
    return () => {
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("dragstart", block);
    };
  }, []);
  return null;
}
