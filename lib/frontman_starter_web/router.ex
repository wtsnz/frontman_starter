defmodule FrontmanStarterWeb.Router do
  use FrontmanStarterWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
    plug :fetch_session
    plug :protect_from_forgery
    plug FrontmanStarterWeb.LoadUser
  end

  scope "/", FrontmanStarterWeb do
    pipe_through :api

    post "/rpc/run", RpcController, :run
    post "/rpc/validate", RpcController, :validate
    get "/auth/csrf", RpcController, :csrf
    get "/auth/session", AuthController, :session
    post "/auth/login", AuthController, :login
    post "/auth/logout", AuthController, :logout
    get "/health/ready", HealthController, :ready
  end
end
