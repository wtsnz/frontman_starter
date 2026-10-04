defmodule FrontmanStarter.Demo do
  @moduledoc "Development example account and idempotent seed data."
  alias FrontmanStarter.Accounts.User
  alias FrontmanStarter.Workspace.Task
  require Ash.Query

  def credentials do
    if Application.get_env(:frontman_starter, :demo_seed?, false),
      do: %{email: "demo@example.com", password: "starter-password"}
  end

  def seed! do
    if credentials = credentials() do
      user =
        User
        |> Ash.Query.filter(email == ^credentials.email)
        |> Ash.read_one!(authorize?: false)
        |> case do
          nil ->
            strategy = AshAuthentication.Info.strategy!(User, :password)

            {:ok, user} =
              AshAuthentication.Strategy.action(strategy, :register, %{
                email: credentials.email,
                password: credentials.password,
                password_confirmation: credentials.password
              })

            user

          user ->
            user
        end

      if Ash.read!(Task, actor: user) == [] do
        for {title, notes} <- [
              {"Make this starter your own", "Start with the Task resource and the index route."},
              {"Ship something small", "A working first version is a good next step."}
            ] do
          Task
          |> Ash.Changeset.for_create(:create, %{title: title, notes: notes}, actor: user)
          |> Ash.create!()
        end
      end
    end
  end
end
