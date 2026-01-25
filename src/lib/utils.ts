import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Decode JWT payload and check exp (no verify). Returns true if expired. */
export function isJwtExpired(token: string | undefined): boolean {
  if (!token) return false
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return false
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString())
    return typeof payload.exp === "number" && payload.exp * 1000 < Date.now()
  } catch {
    return false
  }
}
