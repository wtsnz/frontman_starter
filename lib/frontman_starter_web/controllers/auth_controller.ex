defmodule FrontmanStarterWeb.AuthController do
  use FrontmanStarterWeb, :controller
  import AshAuthentication.Plug.Helpers

  alias FrontmanStarter.Accounts.User

  def session(conn, _params) do
    conn
    |> put_resp_header("cache-control", "no-store")
    |> json(%{
      user: serialize_user(conn.assigns[:current_user]),
      demoCredentials: FrontmanStarter.Demo.credentials()
    })
  end

  def login(conn, %{"email" => email, "password" => password}) do
    strategy = AshAuthentication.Info.strategy!(User, :password)

    case AshAuthentication.Strategy.action(strategy, :sign_in, %{email: email, password: password}) do
      {:ok, user} ->
        Plug.CSRFProtection.delete_csrf_token()

        conn
        |> configure_session(renew: true)
        |> clear_session()
        |> store_in_session(user)
        |> put_resp_header("cache-control", "no-store")
        |> json(%{user: serialize_user(user)})

      {:error, _error} ->
        invalid_credentials(conn)
    end
  end

  def login(conn, _params), do: invalid_credentials(conn)

  def logout(conn, _params) do
    conn = revoke_session_tokens(conn, :frontman_starter)
    Plug.CSRFProtection.delete_csrf_token()

    conn
    |> clear_session()
    |> configure_session(drop: true)
    |> put_resp_header("cache-control", "no-store")
    |> json(%{user: nil})
  end

  defp invalid_credentials(conn) do
    conn
    |> put_status(:unauthorized)
    |> put_resp_header("cache-control", "no-store")
    |> json(%{error: "Email or password is incorrect."})
  end

  defp serialize_user(nil), do: nil
  defp serialize_user(user), do: %{id: user.id, email: to_string(user.email)}
end
