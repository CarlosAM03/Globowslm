"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SignOut({ csrfToken }: { csrfToken: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/cms/auth/logout", { method: "POST", headers: { "X-Csrf-Token": csrfToken } });
      if (!response.ok && response.status !== 401) throw new Error("Salida no disponible");
      router.replace("/admin/login");
      router.refresh();
    } catch {
      setError("No se pudo cerrar sesión. Intenta de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button type="button" disabled={pending} onClick={signOut}>Cerrar sesión</button>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
