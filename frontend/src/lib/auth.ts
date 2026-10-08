import { rpcFetch, resetCsrf } from "./rpc";

export interface User {
  id: string;
  email: string;
}
export interface Session {
  user: User | null;
  demoCredentials: { email: string; password: string } | null;
  // The server left the session out of a cached page; the browser loads it.
  deferred?: boolean;
}
// What a cached page renders on the server: nobody signed in.
export const deferredSession: Session = {
  user: null,
  demoCredentials: null,
  deferred: true,
};
export async function getSession(): Promise<Session> {
  const response = await rpcFetch("/auth/session");
  if (!response.ok) throw new Error("Could not load your session.");
  return response.json();
}
export async function login(email: string, password: string) {
  const response = await rpcFetch("/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error("Email or password is incorrect.");
  resetCsrf();
}
export async function logout() {
  const response = await rpcFetch("/auth/logout", { method: "POST" });
  if (!response.ok) throw new Error("Could not sign out. Please try again.");
  resetCsrf();
}
