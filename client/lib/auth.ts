export type AuthUser = { id: string; name: string; email?: string | null; avatar_url?: string | null };

const TOKEN_KEY = "token";
const USER_KEY = "user";

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  window.dispatchEvent(new Event("auth:change"));
}
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("auth:change"));
}
export function setUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}
export function getUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  try { return raw ? JSON.parse(raw) as AuthUser : null; } catch { return null; }
}
