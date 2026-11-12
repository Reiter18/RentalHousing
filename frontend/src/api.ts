export type Tokens = { access_token: string; refresh_token: string; token_type: string };
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const TOKEN_KEY = "rental.tokens";
let refreshRequest: Promise<Tokens | null> | null = null;

export function getTokens(): Tokens | null {
  try { return JSON.parse(localStorage.getItem(TOKEN_KEY) || "null") as Tokens | null; }
  catch { return null; }
}

export function saveTokens(tokens: Tokens | null) {
  if (tokens) localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  else localStorage.removeItem(TOKEN_KEY);
}

async function refreshTokens(): Promise<Tokens | null> {
  if (refreshRequest) return refreshRequest;
  const current = getTokens();
  if (!current) return null;
  refreshRequest = fetch(`${API_URL}/auth/refresh`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: current.refresh_token }),
  }).then(async (response) => {
    if (!response.ok) { saveTokens(null); return null; }
    const tokens = await response.json() as Tokens;
    saveTokens(tokens);
    return tokens;
  }).catch(() => { saveTokens(null); return null; }).finally(() => { refreshRequest = null; });
  return refreshRequest;
}

export async function apiRequest(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const tokens = getTokens();
  if (tokens?.access_token) headers.set("Authorization", `Bearer ${tokens.access_token}`);
  let response = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (response.status === 401 && !["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"].includes(path)) {
    const next = await refreshTokens();
    if (next) {
      headers.set("Authorization", `Bearer ${next.access_token}`);
      response = await fetch(`${API_URL}${path}`, { ...init, headers });
    }
  }
  return response;
}

export async function apiJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await apiRequest(path, init);
  const body = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.detail || "Ошибка запроса к серверу");
  return body as T;
}
