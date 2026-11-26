"use client";

import { createContext, useContext, type ReactNode } from "react";

const CsrfContext = createContext<string | null>(null);

export function AdminSession({ token, children }: { token: string; children: ReactNode }) {
  return <CsrfContext.Provider value={token}>{children}</CsrfContext.Provider>;
}

export function useCsrfToken() {
  const token = useContext(CsrfContext);
  if (!token) throw new Error("La sesión administrativa no está disponible.");
  return token;
}
