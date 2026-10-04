defmodule FrontmanStarterWeb.FrontendProxy do
  @behaviour Plug
  def init(opts), do: opts

  def call(conn, _opts) do
    Frontman.Proxy.call(conn,
      name: FrontmanStarter.SSR,
      enabled: FrontmanStarter.Frontend.enabled?(),
      pass_through: ["/rpc/", "/auth/", "/health/"]
    )
  end
end
