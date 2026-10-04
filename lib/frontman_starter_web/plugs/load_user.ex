defmodule FrontmanStarterWeb.LoadUser do
  import AshAuthentication.Plug.Helpers

  def init(opts), do: opts

  def call(conn, _opts) do
    conn
    |> retrieve_from_session(:frontman_starter)
    |> set_actor(:user)
  end
end
