import {
  createRootRoute,
  HeadContent,
  Link,
  Outlet,
  Scripts,
  useRouter,
} from "@tanstack/react-router";
import { deferredSession, getSession, logout } from "../lib/auth";
import { pageCache, pageCacheHeaders } from "../lib/page-cache";
import { useEffect, useState } from "react";
import stylesheet from "../styles.css?url";
export const Route = createRootRoute({
  beforeLoad: ({ matches }) => ({ cached: pageCache(matches) !== undefined }),
  // A cached page is served to everyone, so its server render must not know who asked.
  loader: ({ context }) =>
    context.cached && import.meta.env.SSR ? deferredSession : getSession(),
  headers: ({ matches }) => pageCacheHeaders(matches),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Frontman Starter" },
    ],
    links: [
      { rel: "stylesheet", href: stylesheet },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
    ],
  }),
  component: Root,
});
function Root() {
  const { user, deferred } = Route.useLoaderData();
  const router = useRouter();
  // After hydrating a cached page, load the session in the browser.
  useEffect(() => {
    if (deferred) void router.invalidate();
  }, [deferred, router]);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<string>();
  async function signOut() {
    setBusy(true);
    try {
      await logout();
      await router.invalidate();
      await router.navigate({ to: "/login" });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not sign out.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="antialiased">
        <div className="isolate min-h-dvh">
          <header className="border-b border-neutral-950/10">
            <div className="page flex min-h-20 items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <a
                  href="/"
                  aria-label="Homepage"
                  className="font-semibold tracking-tight"
                >
                  Frontman Starter
                </a>
                <Link to="/about" className="text-sm text-neutral-600">
                  About
                </Link>
              </div>
              {user && (
                <nav
                  aria-label="Main"
                  className="flex items-center gap-4 max-lg:hidden"
                >
                  <Link
                    to="/"
                    search={{ status: "all" }}
                    className="rounded-md bg-neutral-950/5 px-3 py-2"
                  >
                    Tasks
                  </Link>
                  <span className="text-sm text-neutral-500">{user.email}</span>
                  <button
                    type="button"
                    className="button-secondary"
                    disabled={busy}
                    onClick={() => {
                      void signOut();
                    }}
                  >
                    {busy ? "Signing out…" : "Sign out"}
                  </button>
                </nav>
              )}
              {user && (
                <details className="relative lg:hidden">
                  <summary className="cursor-pointer rounded-md px-3 py-2">
                    Menu
                  </summary>
                  <nav
                    aria-label="Mobile"
                    className="absolute right-0 top-12 z-10 min-w-56 space-y-4 rounded-lg bg-white p-4 ring-1 ring-black/10 shadow-lg"
                  >
                    <Link to="/" search={{ status: "all" }}>
                      Tasks
                    </Link>
                    <p className="text-neutral-500">{user.email}</p>
                    <button
                      type="button"
                      className="button-secondary"
                      disabled={busy}
                      onClick={() => {
                        void signOut();
                      }}
                    >
                      Sign out
                    </button>
                  </nav>
                </details>
              )}
            </div>
          </header>
          <main>
            {error && (
              <p role="alert" className="page py-4 text-red-700">
                {error}
              </p>
            )}
            <Outlet />
          </main>
          <footer className="border-t border-neutral-950/10 py-6">
            <p className="page text-base text-neutral-500 sm:text-sm">
              A small starting point for your next application.
            </p>
          </footer>
        </div>
        <Scripts />
      </body>
    </html>
  );
}
