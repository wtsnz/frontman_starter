defmodule FrontmanStarter.FrontendPool do
  @moduledoc "Starts Frontman once Phoenix has bound its backend listener."

  def child_spec(opts),
    do: %{id: __MODULE__, start: {__MODULE__, :start_link, [opts]}, type: :supervisor}

  def start_link(_opts) do
    config = FrontmanStarter.Frontend.config()
    {:ok, {address, port}} = FrontmanStarterWeb.Endpoint.server_info(:http)

    host =
      case address do
        {0, 0, 0, 0} -> "127.0.0.1"
        {0, 0, 0, 0, 0, 0, 0, 0} -> "[::1]"
        value when tuple_size(value) == 8 -> "[#{:inet.ntoa(value)}]"
        value -> to_string(:inet.ntoa(value))
      end

    Frontman.start_link(
      name: FrontmanStarter.SSR,
      executable: config[:node],
      args: [".output/server/index.mjs"],
      directory: config[:directory],
      workers: config[:workers],
      max_concurrency: config[:max_concurrency],
      cache: config[:cache],
      env: [{"BACKEND_URL", "http://#{host}:#{port}"}, {"PUBLIC_ORIGIN", config[:public_origin]}]
    )
  end
end
