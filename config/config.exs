# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

config :frontman_starter,
  ecto_repos: [FrontmanStarter.Repo],
  ash_domains: [FrontmanStarter.Accounts, FrontmanStarter.Workspace],
  generators: [timestamp_type: :utc_datetime]

# Configure the endpoint
config :frontman_starter, FrontmanStarterWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  render_errors: [
    formats: [json: FrontmanStarterWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: FrontmanStarter.PubSub,
  live_view: [signing_salt: "K3z2K6r2"]

# Configure Elixir's Logger
config :logger, :default_formatter,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

config :ash, default_string_length_count: :codepoints

config :ash_typescript,
  manifest: FrontmanStarter.Manifest,
  output_file: "frontend/src/ash_rpc.ts",
  run_endpoint: "/rpc/run",
  validate_endpoint: "/rpc/validate",
  input_field_formatter: :camel_case,
  output_field_formatter: :camel_case

config :frontman_starter, :frontend,
  enabled: false,
  workers: 2,
  max_concurrency: 16,
  node: "node",
  directory: Path.expand("../frontend", __DIR__),
  public_origin: "http://localhost:4000"

# `mix assets.deploy` downloads this Node, builds the frontend with it, and bundles both in the
# release. Keep it in step with .mise.toml.
config :frontman, :package, node_version: "22.22.3"

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"
