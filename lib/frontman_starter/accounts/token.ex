defmodule FrontmanStarter.Accounts.Token do
  use Ash.Resource,
    domain: FrontmanStarter.Accounts,
    data_layer: AshSqlite.DataLayer,
    extensions: [AshAuthentication.TokenResource],
    authorizers: [Ash.Policy.Authorizer]

  sqlite do
    table "tokens"
    repo FrontmanStarter.Repo
  end

  policies do
    bypass AshAuthentication.Checks.AshAuthenticationInteraction do
      authorize_if always()
    end
  end
end
