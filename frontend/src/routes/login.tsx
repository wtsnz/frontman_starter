import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { Input } from "@base-ui/react/input";
import { useEffect, useState } from "react";
import { getSession, login } from "../lib/auth";

export const Route = createFileRoute("/login")({
  loader: async () => {
    const session = await getSession();
    if (session.user) throw redirect({ to: "/", search: { status: "all" } });
    return session;
  },
  component: LoginPage,
});

function LoginPage() {
  const { demoCredentials } = Route.useLoaderData();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState<string>();
  async function submit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError(undefined);
    try {
      await login(String(data.get("email")), String(data.get("password")));
      await router.invalidate();
      await router.navigate({ to: "/", search: { status: "all" } });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="page py-12 sm:py-20">
      <div className="mx-auto max-w-md space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-base text-neutral-500">
            Sign in to your workspace.
          </p>
        </div>
        <form method="post" onSubmit={submit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="block font-medium">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              className="input w-full"
              defaultValue={demoCredentials?.email}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block font-medium">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="input w-full"
              defaultValue={demoCredentials?.password}
              required
            />
          </div>
          {error && (
            <p role="alert" className="text-red-700">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="button-primary w-full"
            disabled={busy || !hydrated}
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        {demoCredentials && (
          <aside
            className="space-y-2 rounded-lg bg-neutral-950/5 p-4 text-base sm:text-sm"
            aria-label="Example account"
          >
            <p className="font-medium">Try the example account</p>
            <p className="text-neutral-600">
              The form is filled in for you. Your local database includes a few
              tasks to get started.
            </p>
            <p className="break-all font-mono text-neutral-600">
              {demoCredentials.email}
              <br />
              {demoCredentials.password}
            </p>
          </aside>
        )}
      </div>
    </section>
  );
}
