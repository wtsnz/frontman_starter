import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  // The same HTML for every visitor, so Frontman renders it once and serves it from memory.
  // It's fresh for five minutes, then refreshed in the background for up to a day.
  staticData: {
    pageCache: "public, max-age=300, stale-while-revalidate=86400",
  },
  head: () => ({ meta: [{ title: "About · Frontman Starter" }] }),
  component: About,
});

const parts = [
  [
    "Phoenix and Ash",
    "Phoenix owns every request, sessions and CSRF. Ash holds the domain and its policies.",
  ],
  [
    "TanStack Start",
    "Node renders pages under Phoenix's supervision. Navigation after the first page calls Phoenix directly.",
  ],
  [
    "One release",
    "mix frontman.package bundles Node and the frontend build, so the release is the whole app.",
  ],
  [
    "A page cache",
    "Pages like this one are rendered once per server and served from memory until they go stale.",
  ],
];

function About() {
  return (
    <div className="page space-y-10 py-12">
      <section className="max-w-2xl space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">
          About this starter
        </h1>
        <p className="text-neutral-600">
          A small, working base for Elixir, Phoenix, Ash and TanStack Start
          applications, deployed as one release.
        </p>
      </section>
      <ul className="grid gap-6 sm:grid-cols-2">
        {parts.map(([title, body]) => (
          <li key={title} className="rounded-lg p-5 ring-1 ring-neutral-950/10">
            <h2 className="font-medium">{title}</h2>
            <p className="mt-2 text-sm text-neutral-600">{body}</p>
          </li>
        ))}
      </ul>
      <p className="max-w-2xl text-sm text-neutral-500">
        This page is cached. Its route sets <code>staticData.pageCache</code>,
        and the root route keeps your session out of its server render. If you
        are signed in, the header learns who you are after the page loads.
      </p>
    </div>
  );
}
