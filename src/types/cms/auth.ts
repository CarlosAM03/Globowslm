export type OwnerIdentity = { id: string; email: string; role: "OWNER" };
export type OwnerSession = { owner: OwnerIdentity; csrfToken: string };
