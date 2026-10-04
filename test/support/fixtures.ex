defmodule FrontmanStarter.Fixtures do
  def user(email \\ "user@example.com") do
    strategy = AshAuthentication.Info.strategy!(FrontmanStarter.Accounts.User, :password)

    {:ok, user} =
      AshAuthentication.Strategy.action(strategy, :register, %{
        email: email,
        password: "test-password",
        password_confirmation: "test-password"
      })

    user
  end
end
