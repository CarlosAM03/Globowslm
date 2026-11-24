"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Field } from "./Field";

const subscribe = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function LoginForm() {
  const hydrated = useSyncExternalStore(subscribe, clientReady, serverReady);
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError("");

    try {
      const challenge = await fetch("/api/cms/auth/csrf", { cache: "no-store" });
      if (!challenge.ok) {
        setError((await challenge.json()).message ?? "No se pudo iniciar sesión.");
        return;
      }
      const { csrfToken } = await challenge.json();
      const response = await fetch("/api/cms/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Csrf-Token": csrfToken },
        body: JSON.stringify({ email: data.get("email"), password: data.get("password") }),
      });
      if (!response.ok) {
        setError((await response.json()).message ?? "No se pudo iniciar sesión.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("No se pudo conectar. Intenta de nuevo.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="admin-login-form" method="post" onSubmit={submit}>
      <Field label="Correo electrónico" id="admin-email" name="email" type="email" autoComplete="username" maxLength={254} required />
      <Field label="Contraseña" id="admin-password" name="password" type="password" autoComplete="current-password" maxLength={1024} required />
      {error && <p role="alert">{error}</p>}
      <button type="submit" disabled={!hydrated || pending}>{pending ? "Ingresando…" : "Entrar"}</button>
    </form>
  );
}
