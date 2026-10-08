# Development

Read when setting up the project, adding a resource, or making a new application from this template.

## Setup and commands

```sh
mix setup
```

Start Phoenix with `mix phx.server` and Vite with `npm --prefix frontend run dev`. Open port 5173.
For a production-style local run, stop Phoenix, run `mix frontend.build`, and start
`SUPERVISE_FRONTEND=true mix phx.server`. Open port 4000.
The Nitro plugin's `devProxy` handles `/rpc`, `/auth` and `/health` in Vite mode; a plain
`server.proxy` would run after Nitro's SSR middleware and miss these requests.
The client dependency optimizer includes TanStack's runtime imports explicitly so the first
page can hydrate without a dependency-discovery reload.

| Command | Purpose |
| --- | --- |
| `mix setup` | Fetch dependencies, create/migrate/seed the development DB, generate the client, install frontend dependencies |
| `mix ash_typescript.codegen` | Regenerate the TypeScript client and types |
| `mix ash_sqlite.generate_migrations --name your_change` | Generate migrations and resource snapshots after a resource change |
| `mix ecto.migrate` | Apply generated migrations |
| `mix frontend.build` | Regenerate the client and build the Node server and browser assets |
| `mix docs.list` | List these guides |
| `./scripts/check` | Run the full verification gate, including a temporary supervised server |
| `mix precommit` | Run the same full gate through Mix |

Generated `frontend/src/ash_rpc.ts`, `ash_types.ts`, resource snapshots and migrations are committed.
Change Ash resources, regenerate, and review the output. Do not manually edit generated clients.
The check gate verifies the generated files are current with `mix ash_typescript.codegen --check`.
Generated Ash clients and TanStack's route tree are excluded from Prettier; their generators
own the output format.

The development database is `data/dev.db`. Unit tests use `data/test.db`, browser tests use
`data/e2e.db`, and the e2e gate chooses an
available local port. Set `E2E_PORT` to override it. `BACKEND_URL` lets Vite proxy to a different Phoenix port. Mix doesn't read `.env` files;
export any overrides in your shell. SQLite tests that write to the database run sequentially.

`mix setup` seeds `demo@example.com` with password `starter-password`. The login form displays
these credentials and is prefilled. Seeds find the account case-insensitively and never reset
an existing password. The demo tasks are created only if the account has no tasks. The e2e gate
also seeds its test database. It doesn't modify development data.

## Add an action

1. Define attributes and actions on an Ash resource and register it in `Workspace`.
2. Add the action to `typescript_rpc` to expose it.
3. Generate and migrate the database changes, then regenerate TypeScript.
4. Add policies for the current actor and call the generated function with `customFetch: rpcFetch`.
5. Put reads in a TanStack route loader and writes in event handlers. Read loader data through
   `Route.useLoaderData()`.

## Make the application yours

Copy or clone this repository and start fresh Git history for your application. Choose an OTP
app name and matching Elixir module name. Rename `FrontmanStarter` and `FrontmanStarterWeb` modules,
`lib/` and test paths, and the `frontman_starter` application references in `mix.exs`, configuration,
release scripts and the Dockerfile. Also update database names, the session cookie key, Compose
project name, the demo credentials in `Demo`, and `frontend/package.json`.

The complete rename should be reviewed as an ordinary code change, then verified with
`./scripts/check` and a release build. Keep the generated Ash client names derived from your
resources. Replace `Workspace.Task` and the task UI with your own domain.

## Cache a page

For a page whose HTML is the same for every visitor, add
`staticData: { pageCache: "public, max-age=300" }` to its route. Check every loader in its tree:
none may read cookies or the session during SSR. The root route already defers the session on
cached pages. Read [Cached pages](architecture.md#cached-pages) first. The cache runs only in the
supervised build, so test it with `SUPERVISE_FRONTEND=true mix phx.server` and look for
`x-frontman-cache-status: hit` on the second request.

## Components

`TaskEditor` uses Base UI Dialog and Input. `DeleteTask` uses AlertDialog. The status filter uses
Tabs with URL state. These show keyboard focus, accessible labels, loading, validation, errors,
and small-screen layouts. Tailwind utilities and local styles provide their appearance.

## Tests

Elixir tests exercise Ash constraints, ownership policies, password login, logout revocation,
idempotent seeds and the RPC CSRF contract. Playwright tests exercise login/logout, SSR HTML,
CRUD, URL state, browser transport, the page cache and mobile overflow. The gate exercises the supervised
frontend build and then Vite with the same temporary Phoenix server. Unit-test data rolls back
in the SQL sandbox; Vite starts with `--force` so browser tests also cover a cold dependency cache.
Browser tests use a separate SQLite file and clean up their own tasks.
The temporary browser server uses a normal connection pool rather than the SQL sandbox, since
its concurrent HTTP requests need separate connections. Database-writing unit tests use a single
sandbox connection and run sequentially.
