import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

let browserCsrf: Promise<string> | undefined;
export function resetCsrf() {
  browserCsrf = undefined;
}
async function csrfToken() {
  browserCsrf ??= fetch("/auth/csrf", {
    headers: { accept: "application/json" },
    credentials: "same-origin",
    signal: AbortSignal.timeout(8000),
  })
    .then(async (response) => {
      if (!response.ok)
        throw new Error(
          "Could not start a secure session. Reload and try again.",
        );
      const { token } = (await response.json()) as { token: string };
      return token;
    })
    .catch((error: unknown) => {
      browserCsrf = undefined;
      throw error;
    });
  return browserCsrf;
}

export const rpcFetch = createIsomorphicFn()
  .server(async (input: RequestInfo | URL, init?: RequestInit) => {
    const backend = process.env.BACKEND_URL || "http://127.0.0.1:4000";
    const incoming = getRequestHeaders();
    const headers = new Headers(init?.headers);
    headers.set("accept", "application/json");
    const cookie = incoming.get("cookie");
    if (cookie) headers.set("cookie", cookie);
    const requestId = incoming.get("x-request-id");
    if (requestId) headers.set("x-request-id", requestId);
    // CSRF stays in Phoenix. Use the returned session cookie for this internal request,
    // including on a first visit with no browser cookie. It never crosses into another user.
    const csrf = await fetch(new URL("/auth/csrf", backend), {
      headers,
      signal: AbortSignal.timeout(8000),
      redirect: "manual",
    });
    if (!csrf.ok) throw new Error("Could not initialize the SSR session.");
    const { token } = (await csrf.json()) as { token: string };
    const cookies = new Map(
      (cookie || "")
        .split("; ")
        .filter(Boolean)
        .map((part) => {
          const i = part.indexOf("=");
          return [part.slice(0, i), part.slice(i + 1)];
        }),
    );
    for (const value of csrf.headers.getSetCookie()) {
      const pair = value.split(";", 1)[0];
      const i = pair.indexOf("=");
      cookies.set(pair.slice(0, i), pair.slice(i + 1));
    }
    if (cookies.size)
      headers.set(
        "cookie",
        Array.from(cookies, ([key, value]) => `${key}=${value}`).join("; "),
      );
    headers.set("x-csrf-token", token);
    return fetch(new URL(String(input), backend), {
      ...init,
      headers,
      signal: init?.signal || AbortSignal.timeout(8000),
      redirect: "manual",
    });
  })
  .client(async (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    headers.set("x-csrf-token", await csrfToken());
    return fetch(input, {
      ...init,
      headers,
      credentials: "same-origin",
      signal: init?.signal || AbortSignal.timeout(8000),
    });
  });
