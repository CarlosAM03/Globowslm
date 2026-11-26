import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { AdminSession } from "@/components/admin/AdminSession";
import { AdminNavigation } from "@/components/admin/AdminNavigation";
import { SignOut } from "@/components/admin/SignOut";
import { readOwnerSession } from "@/lib/cms/auth-server";

async function ProtectedContent({ children }: { children: ReactNode }) {
  const session = await readOwnerSession();
  if (session.state === "anonymous") redirect("/admin/login");
  if (session.state !== "authenticated") {
    return <main className="admin-login"><h1>Administración</h1><p role="alert">No se pudo comprobar tu sesión. Recarga para intentarlo de nuevo.</p></main>;
  }
  return (
    <>
      <header className="admin-session">
        <span>Globows LM</span>
        <AdminNavigation role={session.data.owner.role} />
        <SignOut csrfToken={session.data.csrfToken} />
      </header>
      <AdminSession token={session.data.csrfToken}>{children}</AdminSession>
    </>
  );
}

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p className="admin-login" role="status">Comprobando sesión…</p>}>
      <ProtectedContent>{children}</ProtectedContent>
    </Suspense>
  );
}
