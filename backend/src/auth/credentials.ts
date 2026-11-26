import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { Algorithm, hash, verify } from "@node-rs/argon2";
import { z } from "zod";

export const email = z.string().trim().toLowerCase().max(254).pipe(z.email());
export const accountRole = z.enum(["OWNER", "ADMIN"]);
export type AccountRole = z.infer<typeof accountRole>;
export const passwordInput = z.string().min(1).refine((value) => Buffer.byteLength(value) <= 1024);
export const newPasswordInput = passwordInput.refine((value) => value.length >= 12);
export const tokenPattern = /^[A-Za-z0-9_-]{43}$/;
export const newToken = () => randomBytes(32).toString("base64url");
export const hashToken = (value: string) => createHash("sha256").update(value).digest("hex");
export const csrfFor = (sessionToken: string) =>
  createHmac("sha256", sessionToken).update("globows-v2:csrf").digest("base64url");

const hashOptions = { algorithm: Algorithm.Argon2id, memoryCost: 65536, timeCost: 3, parallelism: 1 };
const dummyHash = hash(randomBytes(32), hashOptions);

export async function hashPassword(value: string): Promise<string> {
  if (!newPasswordInput.safeParse(value).success) throw new Error("Longitud de contraseña inválida");
  return hash(value, hashOptions);
}

export async function verifyPassword(password: string, saved?: string): Promise<boolean> {
  return (await verify(saved ?? await dummyHash, password)) && !!saved;
}

export function matchesHash(candidate: string | undefined, expected: string): boolean {
  return !!candidate && tokenPattern.test(candidate) &&
    timingSafeEqual(Buffer.from(hashToken(candidate), "hex"), Buffer.from(expected, "hex"));
}
