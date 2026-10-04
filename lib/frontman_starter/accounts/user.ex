defmodule FrontmanStarter.Accounts.User do
  use Ash.Resource,
    domain: FrontmanStarter.Accounts,
    data_layer: AshSqlite.DataLayer,
    extensions: [AshAuthentication],
    authorizers: [Ash.Policy.Authorizer]

  sqlite do
    table "users"
    repo FrontmanStarter.Repo
  end

  attributes do
    uuid_primary_key :id
    attribute :email, :ci_string, allow_nil?: false, public?: true
    attribute :hashed_password, :string, allow_nil?: false, sensitive?: true
    create_timestamp :created_at
  end

  identities do
    identity :unique_email, [:email]
  end

  actions do
    defaults [:read]
  end

  authentication do
    tokens do
      enabled? true
      token_resource FrontmanStarter.Accounts.Token
      store_all_tokens? true
      require_token_presence_for_authentication? true
      token_lifetime {7, :days}

      signing_secret fn _, _ ->
        Application.fetch_env(:frontman_starter, :token_signing_secret)
      end
    end

    strategies do
      password :password do
        identity_field :email
      end
    end
  end

  policies do
    bypass AshAuthentication.Checks.AshAuthenticationInteraction do
      authorize_if always()
    end

    policy always() do
      forbid_if always()
    end
  end
end
