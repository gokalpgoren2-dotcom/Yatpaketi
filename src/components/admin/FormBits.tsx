"use client";

import { useEffect } from "react";
import { useFormStatus } from "react-dom";

export function SubmitButton({ children = "Kaydet" }: { children?: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-xl bg-turquoise px-6 py-4 text-base font-semibold text-white hover:bg-turquoise-dark disabled:opacity-60 sm:w-auto"
    >
      {pending ? "Kaydediliyor…" : children}
    </button>
  );
}

// Kayıttan sonra sayfa aynı adreste kalırsa mesaj ekranın dışında kalır; yukarı kaydırır.
export function Notice({ kind, text }: { kind: "ok" | "error"; text: string }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  return (
    <p
      role={kind === "error" ? "alert" : "status"}
      className={`mt-4 rounded-xl p-4 text-sm font-medium ${
        kind === "error" ? "bg-red-50 text-red-700 ring-1 ring-red-200" : "bg-green-50 text-green-800 ring-1 ring-green-200"
      }`}
    >
      {text}
    </p>
  );
}
