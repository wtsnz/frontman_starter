import Config

server? = System.get_env("PHX_SERVER") == "true"
port = String.to_integer(System.get_env("PORT", "4000"))

if server?, do: config(:frontman_starter, FrontmanStarterWeb.Endpoint, server: true)
config :frontman_starter, FrontmanStarterWeb.Endpoint, http: [port: port]

config :frontman_starter,
  demo_seed?: config_env() != :prod or System.get_env("SEED_DEMO") == "true",
  token_signing_secret:
    if(config_env() == :prod,
      do: System.fetch_env!("AUTH_TOKEN_SECRET"),
      else: "development-only-token-secret-replace-this-with-a-production-secret"
    )

if config_env() == :test, do: config(:bcrypt_elixir, :log_rounds, 4)

if config_env() == :test and System.get_env("E2E_DATABASE_PATH") do
  config :frontman_starter, FrontmanStarter.Repo,
    database: System.fetch_env!("E2E_DATABASE_PATH"),
    pool: DBConnection.ConnectionPool,
    pool_size: 5
end

if config_env() == :prod do
  config :frontman_starter, FrontmanStarter.Repo,
    database: System.fetch_env!("DATABASE_PATH"),
    pool_size: String.to_integer(System.get_env("POOL_SIZE", "5"))

  config :frontman_starter, FrontmanStarterWeb.Endpoint,
    url: [host: System.get_env("PHX_HOST", "localhost"), port: 443, scheme: "https"],
    http: [ip: {0, 0, 0, 0}],
    secret_key_base: System.fetch_env!("SECRET_KEY_BASE")
end

priv = :code.priv_dir(:frontman_starter) |> to_string()

frontend? =
  (config_env() != :test or System.get_env("E2E_SERVER") == "true") and
    if(config_env() == :prod, do: server?, else: System.get_env("SUPERVISE_FRONTEND") == "true")

config :frontman_starter, :frontend,
  enabled: frontend?,
  workers: String.to_integer(System.get_env("FRONTEND_WORKERS", "2")),
  max_concurrency: String.to_integer(System.get_env("FRONTEND_MAX_CONCURRENCY", "16")),
  # Pages whose route sets staticData.pageCache are served from memory. FRONTEND_CACHE=false
  # turns that off. Campaign parameters don't change a page, so they share one entry.
  cache:
    if(System.get_env("FRONTEND_CACHE", "true") == "true",
      do: [
        query: {:except, ~w(utm_source utm_medium utm_campaign utm_term utm_content gclid fbclid)}
      ]
    ),
  node:
    System.get_env(
      "NODE_BINARY",
      if(config_env() == :prod,
        do: Path.join(priv, "node/bin/node"),
        else: System.find_executable("node") || "node"
      )
    ),
  directory:
    System.get_env(
      "FRONTEND_DIR",
      if(config_env() == :prod, do: Path.join(priv, "frontend"), else: Path.expand("frontend"))
    ),
  public_origin:
    if(config_env() == :prod,
      do: System.fetch_env!("PUBLIC_ORIGIN"),
      else: System.get_env("PUBLIC_ORIGIN", "http://localhost:#{port}")
    )
