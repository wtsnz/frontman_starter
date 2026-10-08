defmodule FrontmanStarter.MixProject do
  use Mix.Project

  def project do
    [
      app: :frontman_starter,
      version: "0.1.0",
      elixir: "~> 1.20",
      elixirc_paths: elixirc_paths(Mix.env()),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      deps: deps(),
      listeners: [Phoenix.CodeReloader]
    ]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [
      mod: {FrontmanStarter.Application, []},
      extra_applications: [:logger, :runtime_tools]
    ]
  end

  def cli do
    [
      preferred_envs: [precommit: :test]
    ]
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [
      {:phoenix, "~> 1.8.7"},
      {:ash, "~> 3.27"},
      {:ash_authentication, "~> 4.15"},
      {:bcrypt_elixir, "~> 3.0"},
      {:ash_sqlite, "~> 0.2.19"},
      {:simple_sat, "~> 0.1"},
      {:ash_typescript, "~> 0.18.3"},
      {:frontman, github: "wtsnz/frontman", ref: "179d2f0374c5a273c396e976b95e6fda4beffaf6"},
      {:phoenix_ecto, "~> 4.5"},
      {:ecto_sql, "~> 3.13"},
      {:telemetry_metrics, "~> 1.0"},
      {:telemetry_poller, "~> 1.0"},
      {:jason, "~> 1.2"},
      {:dns_cluster, "~> 0.2.0"},
      {:bandit, "~> 1.5"}
    ]
  end

  # Aliases are shortcuts or tasks specific to the current project.
  # For example, to install project dependencies and perform other setup tasks, run:
  #
  #     $ mix setup
  #
  # See the documentation for `Mix` for more info on aliases.
  defp aliases do
    [
      setup: ["deps.get", "ecto.setup", "ash_typescript.codegen", "cmd --cd frontend npm ci"],
      "docs.list": ["cmd cat docs/README.md"],
      "frontend.build": ["ash_typescript.codegen", "cmd --cd frontend npm run build"],
      # Builds the frontend with the Node pinned in config and copies both into priv for a
      # release. See docs/deployment.md.
      "assets.deploy": ["frontman.package"],
      "ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      test: ["ecto.create --quiet", "ecto.migrate --quiet", "test"],
      precommit: ["cmd ./scripts/check"]
    ]
  end
end
