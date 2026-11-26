import { Suspense } from "react";
import { connection } from "next/server";
import { LoginForm } from "@/components/admin/LoginForm";

async function LoginContent() {
  await connection();
  return (
    <main className="admin-login" aria-labelledby="login-title">
      <h1 id="login-title">Iniciar sesión</h1>
      <LoginForm />
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<p className="admin-login" role="status">Cargando el acceso…</p>}>
      <LoginContent />
    </Suspense>
  );
}