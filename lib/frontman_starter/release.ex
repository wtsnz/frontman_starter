defmodule FrontmanStarter.Release do
  @app :frontman_starter
  def migrate do
    Application.load(@app)

    for repo <- Application.fetch_env!(@app, :ecto_repos) do
      {:ok, _, _} = Ecto.Migrator.with_repo(repo, &Ecto.Migrator.run(&1, :up, all: true))
    end
  end

  def seed do
    {:ok, _} = Application.ensure_all_started(@app)
    FrontmanStarter.Demo.seed!()
  end
end
