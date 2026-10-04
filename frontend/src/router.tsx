import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultStaleTime: 0,
    defaultPendingComponent: () => (
      <p role="status" className="page py-12">
        Loading…
      </p>
    ),
    defaultErrorComponent: ({ error, reset }) => (
      <section className="page space-y-4 py-12">
        <h1 className="text-2xl font-semibold">We couldn't load this page</h1>
        <p role="alert">
          {error instanceof Error ? error.message : "Please try again."}
        </p>
        <button type="button" className="button-secondary" onClick={reset}>
          Try again
        </button>
      </section>
    ),
    defaultNotFoundComponent: () => (
      <section className="page py-12">
        <h1 className="text-2xl font-semibold">Page not found</h1>
        <a href="/">Return to tasks</a>
      </section>
    ),
  });
}
declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
