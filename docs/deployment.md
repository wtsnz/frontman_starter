# Deployment

Read when building or operating a release.

## Build a container

```sh
docker build -t frontman-starter .
```

The Dockerfile builds an Elixir release that carries its own Node. `mix assets.deploy` runs
Frontman's `mix frontman.package`, which downloads the Node version pinned in
`config :frontman, :package`, checks it against Node's published checksums, builds the frontend
with it, and copies the `node` binary to `priv/node` and the build to `priv/frontend`. The build
stage needs no Node of its own; BuildKit cache mounts keep the Node archive and npm's cache
between builds. The runtime is a plain Debian image with `ps`, `kill` and the libraries Node
links. Only Phoenix's port 4000 is public; worker ports are private loopback listeners.

Change Node by updating `node_version` in `config/config.exs` and `.mise.toml` together.

Provide `DATABASE_PATH`, `SECRET_KEY_BASE`, `AUTH_TOKEN_SECRET`, `PUBLIC_ORIGIN` and `PHX_HOST`.
Generate two separate secrets with `mix phx.gen.secret`. Set `DATABASE_PATH=/data/app.db` and
mount a persistent volume. The image creates `/data` owned by its unprivileged runtime user.
Apply migrations once per deploy with the same volume used by the server:

```sh
docker run --rm --env-file .env.production -v frontman-starter-data:/data frontman-starter bin/frontman_starter eval 'FrontmanStarter.Release.migrate()'
docker run --rm --env-file .env.production -v frontman-starter-data:/data -p 4000:4000 -e PHX_SERVER=true frontman-starter
```

Do not set `PHX_SERVER` for the migration command; Node and the endpoint stay stopped. Keep
`.env.production` out of Git. If you use a TLS reverse proxy, point it at Phoenix and configure
`PUBLIC_ORIGIN` to the external HTTPS origin. TLS termination and the database are application
hosting choices, not Frontman features. Production cookies are Secure, so serve the application
over HTTPS. The local listener is allowed for internal SSR calls; only expose Phoenix through
your reverse proxy. `compose.yaml` provides the same application volume and environment wiring.

Production seeds are disabled. For a disposable demo only, set `SEED_DEMO=true` and run
`bin/frontman_starter eval 'FrontmanStarter.Release.seed()'` with that volume. This creates the
example login and tasks and makes its credentials visible. Don't enable this on a real service.

Keep SQLite on local disk, run one application instance per database, and back it up with SQLite's
backup API rather than copying an open file. For multiple hosts or heavier concurrent writes,
switch the resources and repo to AshPostgres and generate new migrations before deployment.

`GET /health/ready` reports the database and ready worker count. Its HTTP status is 503 if either
is unavailable. A saturated pool rejects individual pages without changing readiness.

## Build without Docker

Build on the platform the release runs on, since Node is downloaded for the build machine:

```sh
MIX_ENV=prod mix assets.deploy
MIX_ENV=prod mix release
```

The release starts its workers with `priv/node/bin/node`. Set `NODE_BINARY` to an absolute path
to use another Node. The host needs `ps`, `kill`, glibc and `libstdc++`.

The starter pins Frontman to a public Git commit. Update that ref deliberately, fetch dependencies,
and run the gate before adopting a new runtime revision.

## Drain a release

Move traffic to the new ready release first, then on the old release:

```elixir
Frontman.drain(FrontmanStarter.SSR, timeout: 10_000)
```

Stop the old release after the drain returns. Timeout leaves admission closed too. Do not call
`Frontman.stop/2` on a permanently supervised child because its parent will restart it. A release
shutdown performs process cleanup, but does not automatically invoke the admission drain.
