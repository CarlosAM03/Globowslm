export type Totals = { draft: number; published: number; withdrawn: number };
export type DashboardData = {
  totals: Totals;
  byKind: Array<Totals & { kind: string }>;
  recent: Array<{ id: string; action: string; entityType: string; entityId: string; at: string }>;
};
