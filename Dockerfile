FROM node:22.22.3-bookworm-slim AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build && npm run typecheck

FROM hexpm/elixir:1.20.1-erlang-29.0.2-debian-bookworm-20260610-slim AS backend-build
RUN apt-get update && apt-get install -y --no-install-recommends build-essential ca-certificates git && apt-get clean
ENV MIX_ENV=prod
WORKDIR /build
RUN mix local.hex --force && mix local.rebar --force
COPY mix.exs mix.lock ./
COPY config/config.exs config/prod.exs config/
RUN mix deps.get --only prod && mix deps.compile
COPY lib lib
COPY priv priv
COPY --from=frontend-build /frontend/.output priv/frontend/.output
COPY config/runtime.exs config/runtime.exs
RUN mix compile --warnings-as-errors && mix release

FROM node:22.22.3-bookworm-slim AS app
RUN apt-get update && apt-get install -y --no-install-recommends libstdc++6 openssl libncurses6 libsctp1 ca-certificates procps && apt-get clean
WORKDIR /app
RUN mkdir -p /data && chown node:node /data
COPY --from=backend-build --chown=node:node /build/_build/prod/rel/frontman_starter ./
ENV LANG=C.UTF-8 LC_ALL=C.UTF-8 NODE_BINARY=/usr/local/bin/node
USER node
EXPOSE 4000
CMD ["bin/frontman_starter", "start"]
