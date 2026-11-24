const methods = { csrf: "GET", session: "GET", login: "POST", logout: "POST" } as const;
export type AuthAction = keyof typeof methods;

export function resolveAuthAction(parts: readonly string[], method: string): AuthAction | null {
  if (parts.length !== 2 || parts[0] !== "auth" || !Object.hasOwn(methods, parts[1])) return null;
  const action = parts[1] as AuthAction;
  return methods[action] === method ? action : null;
}
