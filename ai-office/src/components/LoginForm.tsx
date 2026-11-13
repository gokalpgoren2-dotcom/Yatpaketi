"use client";

import { useState } from "react";

export function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      if (res.ok) {
        window.location.href = "/";
        return;
      }
      setError(((await res.json().catch(() => ({}))) as { error?: string }).error || "Giriş başarısız.");
    } catch {
      setError("Sunucuya ulaşılamadı.");
    }
    setBusy(false);
  };

  return (
    <form onSubmit={submit} className="ao-login-form">
      <label htmlFor="ao-pw">Parola</label>
      <input id="ao-pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required autoFocus />
      {error && <p className="ao-error">{error}</p>}
      <button type="submit" className="ao-btn ao-btn-primary" disabled={busy || !password}>
        {busy ? "Giriş yapılıyor…" : "Giriş yap"}
      </button>
    </form>
  );
}
