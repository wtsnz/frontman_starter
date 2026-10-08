FROM hexpm/elixir:1.20.1-erlang-29.0.2-debian-bookworm-20260610-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends build-essential ca-certificates git && apt-get clean
ENV MIX_ENV=prod FRONTMAN_CACHE_DIR=/cache/frontman
WORKDIR /build
RUN mix local.hex --force && mix local.rebar --force
COPY mix.exs mix.lock ./
COPY config/config.exs config/prod.exs config/
RUN mix deps.get --only prod && mix deps.compile
# Downloads the Node pinned in config, builds the frontend with it, and copies Node and the build
# into priv. The cache mounts keep the Node archive and npm's cache between builds.
COPY frontend frontend
RUN --mount=type=cache,target=/cache/frontman --mount=type=cache,target=/root/.npm \
    mix assets.deploy
COPY lib lib
COPY priv priv
COPY config/runtime.exs config/runtime.exs
RUN mix compile --warnings-as-errors && mix release

FROM debian:bookworm-20260610-slim AS app
RUN apt-get update && apt-get install -y --no-install-recommends libstdc++6 openssl libncurses6 libsctp1 ca-certificates procps && apt-get clean
RUN useradd --uid 1000 --user-group --home-dir /app app
WORKDIR /app
RUN mkdir -p /data && chown app:app /data
COPY --from=build --chown=app:app /build/_build/prod/rel/frontman_starter ./
ENV LANG=C.UTF-8 LC_ALL=C.UTF-8
USER app
EXPOSE 4000
CMD ["bin/frontman_starter", "start"]
