"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useCsrfToken } from "./AdminSession";

export function ChangePassword() {
  const csrf = useCsrfToken();
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function change(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/cms/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRF-Token": csrf },
        body: JSON.stringify({ currentPassword: data.get("current"), newPassword: data.get("next") }),
      });
      if (!response.ok) {
        setError("No se pudo cambiar la contraseña. Verifica la contraseña actual o vuelve a iniciar sesión.");
        return;
      }
      form.reset();
      router.replace("/admin/login");
      router.refresh();
    } catch {
      setError("El servicio no está disponible. Intenta de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="admin-editor" method="post" onSubmit={change}>
      <p>El cambio cierra todas las sesiones de tu cuenta.</p>
      <label>Contraseña actual<input name="current" type="password" autoComplete="current-password" required /></label>
      <label>Nueva contraseña<input name="next" type="password" autoComplete="new-password" minLength={12} required /></label>
      <button type="submit" disabled={pending}>Cambiar contraseña</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
