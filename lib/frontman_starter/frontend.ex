defmodule FrontmanStarter.Frontend do
  @moduledoc "Runtime configuration shared by the pool and asset plugs."
  def config, do: Application.fetch_env!(:frontman_starter, :frontend)
  def enabled?, do: config()[:enabled] == true
  def public_dir, do: Path.join(config()[:directory], ".output/public")
  def workers, do: Frontman.workers(FrontmanStarter.SSR)
end
