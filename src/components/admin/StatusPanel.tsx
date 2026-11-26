import type { ReactNode } from "react";

export function StatusPanel({ kind, children }: { kind: "loading" | "empty" | "error"; children: ReactNode }) {
  return (
    <div className="admin-status" role={kind === "error" ? "alert" : "status"} aria-busy={kind === "loading"}>
      {children}
    </div>
  );
}
