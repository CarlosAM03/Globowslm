import { Suspense } from "react";
import { Diagnostics } from "@/components/admin/Diagnostics";
import { readOwnerSession } from "@/lib/cms/auth-server";

async function AdminDiagnostics() {
  const session = await readOwnerSession();
  if (session.state !== "authenticated" || session.data.owner.role !== "ADMIN") {
    return <p role="alert">Acceso reservado a la cuenta ADMIN.</p>;
  }
  return <Diagnostics />;
}

export default function DiagnosticsPage() {
  return (
    <main className="admin-main">
      <h1>Diagnóstico</h1>
      <Suspense fallback={<p role="status">Comprobando acceso…</p>}><AdminDiagnostics /></Suspense>
    </main>
  );
}
