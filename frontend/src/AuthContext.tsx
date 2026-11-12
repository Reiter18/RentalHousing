import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiJson, getTokens, saveTokens, type Tokens } from "./api";

export type CurrentUser = { id: number; full_name: string; email: string; role: "landlord" | "tenant" };
type Credentials = { email: string; password: string };
type Registration = Credentials & { full_name: string; role: "landlord" | "tenant" };
type AuthValue = { user: CurrentUser | null; loading: boolean; login(data: Credentials): Promise<void>; register(data: Registration): Promise<void>; logout(): Promise<void> };
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    const current = await apiJson<CurrentUser>("/auth/me");
    setUser(current);
  }

  useEffect(() => {
    if (!getTokens()) { setLoading(false); return; }
    loadUser().catch(() => { saveTokens(null); setUser(null); }).finally(() => setLoading(false));
  }, []);

  async function finishAuth(path: string, data: object) {
    const tokens = await apiJson<Tokens>(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    saveTokens(tokens);
    await loadUser();
  }

  async function logout() {
    const tokens = getTokens();
    if (tokens) await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/auth/logout`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: tokens.refresh_token }),
    }).catch(() => undefined);
    saveTokens(null);
    setUser(null);
  }

  const value: AuthValue = {
    user, loading,
    login: (data) => finishAuth("/auth/login", data),
    register: (data) => finishAuth("/auth/register", data),
    logout,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth должен вызываться внутри AuthProvider");
  return value;
}
