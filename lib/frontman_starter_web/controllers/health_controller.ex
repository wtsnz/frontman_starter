defmodule FrontmanStarterWeb.HealthController do
  use FrontmanStarterWeb, :controller

  def ready(conn, _params) do
    database? = match?({:ok, _}, Ecto.Adapters.SQL.query(FrontmanStarter.Repo, "SELECT 1", []))
    workers = Enum.count(FrontmanStarter.Frontend.workers(), &(&1.state == :ready))
    frontend? = not FrontmanStarter.Frontend.enabled?() or workers > 0

    conn
    |> put_resp_header("cache-control", "no-store")
    |> put_status(if database? and frontend?, do: 200, else: 503)
    |> json(%{
      database: database?,
      frontend: %{enabled: FrontmanStarter.Frontend.enabled?(), ready: workers}
    })
  end
end
