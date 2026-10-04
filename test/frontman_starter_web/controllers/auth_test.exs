defmodule FrontmanStarterWeb.AuthTest do
  use FrontmanStarterWeb.ConnCase, async: false

  test "credentials, cookie sessions, CSRF, actor-scoped RPC and logout revocation", %{conn: conn} do
    user = FrontmanStarter.Fixtures.user()
    conn = get(conn, "/auth/csrf")
    token = json_response(conn, 200)["token"]

    conn =
      post_json(
        recycle(conn),
        "/auth/login",
        %{email: "user@example.com", password: "wrong"},
        token
      )

    assert json_response(conn, 401)["error"] == "Email or password is incorrect."

    conn =
      post_json(
        recycle(conn),
        "/auth/login",
        %{email: "user@example.com", password: "test-password"},
        token
      )

    assert json_response(conn, 200)["user"]["id"] == user.id
    authenticated_cookie = conn.resp_cookies["_frontman_starter_key"].value
    conn = get(recycle(conn), "/auth/session")
    assert json_response(conn, 200)["user"]["email"] == "user@example.com"
    assert get_resp_header(conn, "cache-control") == ["no-store"]
    conn = get(recycle(conn), "/auth/csrf")
    token = json_response(conn, 200)["token"]

    conn =
      post_json(
        recycle(conn),
        "/rpc/run",
        %{action: "create_task", input: %{title: "Authenticated RPC"}, fields: ["id", "title"]},
        token
      )

    result = json_response(conn, 200)
    assert result["success"]
    assert result["data"]["title"] == "Authenticated RPC"
    task = Ash.get!(FrontmanStarter.Workspace.Task, result["data"]["id"], actor: user)
    assert task.user_id == user.id
    conn = post_json(recycle(conn), "/auth/logout", %{}, token)
    assert json_response(conn, 200)["user"] == nil

    replay =
      build_conn()
      |> put_req_cookie("_frontman_starter_key", authenticated_cookie)
      |> get("/auth/session")

    assert json_response(replay, 200)["user"] == nil
  end

  test "mutations require CSRF, and anonymous RPC requires login", %{conn: conn} do
    assert_raise Plug.CSRFProtection.InvalidCSRFTokenError, fn ->
      post_json(conn, "/auth/login", %{email: "user@example.com", password: "test-password"}, nil)
    end

    conn = get(build_conn(), "/auth/csrf")
    token = json_response(conn, 200)["token"]
    conn = post_json(recycle(conn), "/rpc/run", %{action: "list_tasks", fields: ["id"]}, token)
    assert json_response(conn, 401)["error"] == "Please sign in."
  end

  test "demo seed can be repeated and its advertised credentials work" do
    FrontmanStarter.Demo.seed!()
    FrontmanStarter.Demo.seed!()
    credentials = FrontmanStarter.Demo.credentials()
    strategy = AshAuthentication.Info.strategy!(FrontmanStarter.Accounts.User, :password)
    assert {:ok, user} = AshAuthentication.Strategy.action(strategy, :sign_in, credentials)
    assert length(Ash.read!(FrontmanStarter.Workspace.Task, actor: user)) == 2
    assert to_string(user.email) == credentials.email
    refute user.hashed_password == credentials.password
  end

  defp post_json(conn, path, body, token) do
    conn =
      conn
      |> put_private(:plug_skip_csrf_protection, false)
      |> put_req_header("content-type", "application/json")

    conn = if token, do: put_req_header(conn, "x-csrf-token", token), else: conn
    post(conn, path, Jason.encode!(body))
  end
end
