// Frontman can serve a page from memory when its HTML is the same for every visitor. A route
// opts in with `staticData: { pageCache: "public, max-age=300" }`. The root route turns that into
// the x-frontman-cache response header and keeps the session out of the server render.

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    // x-frontman-cache directives: `public`, then optional `max-age` and
    // `stale-while-revalidate` in seconds.
    pageCache?: string;
  }
}

type Match = { staticData?: { pageCache?: string } };

// The deepest matched route that sets `pageCache` decides.
export function pageCache(matches: readonly Match[]): string | undefined {
  return [...matches].reverse().find((match) => match.staticData?.pageCache)
    ?.staticData?.pageCache;
}

export function pageCacheHeaders(matches: readonly Match[]) {
  const directives = pageCache(matches);
  // Frontman never caches under the Vite dev server. Keep the header out of it too.
  return directives && !import.meta.env.DEV
    ? { "x-frontman-cache": directives }
    : undefined;
}
