# Frontman Starter

A working starting point for Elixir, Phoenix, Ash, Frontman, AshTypescript, TanStack Start,
Tailwind CSS and Base UI. Includes SQLite, password login with Ash Authentication, and a small
task CRUD example scoped to each user.

Phoenix owns the public listener in production. Frontman supervises Node workers for SSR.
One TanStack loader uses the generated Ash client on the server and in the browser; client-side
navigation and writes call Phoenix directly. Base UI supplies the accessible tabs and dialogs,
and Tailwind styles them.

## Start developing

Use [the GitHub template](https://github.com/wtsnz/frontman_starter/generate) to create your own
repository, or clone this one:

```sh
git clone https://github.com/wtsnz/frontman_starter.git
cd frontman_starter
```

Requires Elixir 1.20, OTP 29, Node 22, a C compiler, and POSIX `ps`/`kill`.
The tested versions are pinned in `.mise.toml`, `mix.lock`, and `frontend/package-lock.json`.
With mise, run `mise install` and activate it in your shell, or prefix commands with `mise exec --`.

```sh
mix setup
```

Run these in two terminals:

```sh
mix phx.server
```

```sh
npm --prefix frontend run dev
```

Open [localhost:5173](http://localhost:5173). Vite serves the frontend and proxies RPC and session
requests to Phoenix on port 4000. SQLite lives in `data/dev.db`; no database server is needed.

Sign in with **`demo@example.com` / `starter-password`**. `mix setup` creates this account and two
example tasks. The login form is prefilled locally. Re-running setup preserves the account's
password and existing tasks.

## Try the supervised build

```sh
mix frontend.build
SUPERVISE_FRONTEND=true mix phx.server
```

Stop the development Phoenix process before this command. Open [localhost:4000](http://localhost:4000).
Phoenix now serves the built assets and sends page requests to two supervised Node workers.
The filter is URL state, so a reload restores the selected tab.

## Check the project

```sh
./scripts/check
```

The gate checks formatting, Elixir tests, the generated TypeScript client, frontend types and
build, login/logout, browser CRUD, SSR and direct browser RPC. Install the browser once with
`cd frontend && npx playwright install chromium`. See [Development](docs/development.md) for details.

## Make it yours

Keep the integration in `FrontendPool`, the endpoint plugs, `frontend/src/server.ts`, and
`frontend/src/lib/rpc.ts`. Replace the example `Workspace.Task` resource and its UI with your domain.
[Development](docs/development.md) describes renaming the application and adding an Ash action.

Phoenix handles login, logout, CSRF and signed sessions. Ash policies restrict tasks to their
owner. Tokens expire after seven days and logout revokes the token in the database. Registration,
email confirmation and password reset UIs are left for your application.

Production doesn't seed or display the demo credentials by default. Only set `SEED_DEMO=true`
on a disposable demo deployment. Keep public credentials out of a real application.

[Architecture](docs/architecture.md) explains the request paths. [Deployment](docs/deployment.md)
covers a single-container release. Frontman is pinned to a Git commit; it doesn't need a Hex release.

## License

MIT. See [LICENSE](LICENSE).
