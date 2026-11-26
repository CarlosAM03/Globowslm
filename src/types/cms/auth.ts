export type AccountRole = "OWNER" | "ADMIN";
export type OwnerIdentity = { id: string; email: string; role: AccountRole };
export type OwnerSession = { owner: OwnerIdentity; csrfToken: string };
