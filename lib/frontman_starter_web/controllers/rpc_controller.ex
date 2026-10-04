defmodule FrontmanStarterWeb.RpcController do
  use FrontmanStarterWeb, :controller

  plug :require_user when action in [:run, :validate]

  def run(conn, params),
    do: json(conn, AshTypescript.Rpc.run_action(:frontman_starter, conn, params))

  def validate(conn, params),
    do: json(conn, AshTypescript.Rpc.validate_action(:frontman_starter, conn, params))

  def csrf(conn, _params) do
    conn
    |> put_resp_header("cache-control", "no-store")
    |> json(%{token: Plug.CSRFProtection.get_csrf_token()})
  end

  defp require_user(conn, _opts) do
    if conn.assigns[:current_user] do
      conn
    else
      conn |> put_status(:unauthorized) |> json(%{error: "Please sign in."}) |> halt()
    end
  end
end
