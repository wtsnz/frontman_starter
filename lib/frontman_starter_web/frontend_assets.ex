defmodule FrontmanStarterWeb.FrontendAssets do
  @behaviour Plug

  @hashed Plug.Static.init(
            at: "/",
            from: {FrontmanStarter.Frontend, :public_dir, []},
            only: ~w(assets),
            cache_control_for_etags: "public, max-age=31536000, immutable"
          )
  @public Plug.Static.init(
            at: "/",
            from: {FrontmanStarter.Frontend, :public_dir, []},
            only: ~w(favicon.svg)
          )

  def init(opts), do: opts

  def call(conn, _opts) do
    if FrontmanStarter.Frontend.enabled?() do
      case Plug.Static.call(conn, @hashed) do
        %{halted: true} = conn ->
          conn

        %{path_info: ["assets" | _]} = conn ->
          conn |> Plug.Conn.send_resp(404, "") |> Plug.Conn.halt()

        conn ->
          Plug.Static.call(conn, @public)
      end
    else
      conn
    end
  end
end
