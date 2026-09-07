export const ADMIN_SESSION_COOKIE = "indiabid_admin_session";

// Web Crypto (not Node's crypto module) so this works in both the Edge
// Runtime (middleware) and Node (server components/actions) without
// branching per-runtime.
async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * A deterministic token derived from ADMIN_PASSWORD (not the password
 * itself) so the cookie value never reveals it. Good enough for a
 * single-admin internal tool — this isn't guarding payment or user data.
 */
export async function adminSessionToken(): Promise<string | null> {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return sha256Hex(`indiabid-admin:${password}`);
}

export function isValidAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected) && password === expected;
}

export async function isValidAdminSession(cookieValue: string | undefined): Promise<boolean> {
  if (!cookieValue) return false;
  const expected = await adminSessionToken();
  return expected !== null && cookieValue === expected;
}
