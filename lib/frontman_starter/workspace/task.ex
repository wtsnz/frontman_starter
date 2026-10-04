defmodule FrontmanStarter.Workspace.Task do
  use Ash.Resource,
    domain: FrontmanStarter.Workspace,
    data_layer: AshSqlite.DataLayer,
    authorizers: [Ash.Policy.Authorizer],
    extensions: [AshTypescript.Resource]

  typescript do
    type_name "Task"
  end

  sqlite do
    table "tasks"
    repo FrontmanStarter.Repo
  end

  attributes do
    uuid_primary_key :id

    attribute :title, :string,
      allow_nil?: false,
      public?: true,
      constraints: [min_length: 1, max_length: 140, trim?: true]

    attribute :notes, :string, public?: true, default: "", constraints: [max_length: 2000]

    attribute :status, :atom,
      allow_nil?: false,
      public?: true,
      default: :open,
      constraints: [one_of: [:open, :done]]

    create_timestamp :created_at, public?: true
    update_timestamp :updated_at, public?: true
  end

  actions do
    defaults [
      :read,
      :destroy,
      update: [:title, :notes, :status]
    ]

    create :create do
      primary? true
      accept [:title, :notes, :status]
      change relate_actor(:user)
    end
  end

  relationships do
    belongs_to :user, FrontmanStarter.Accounts.User do
      allow_nil? false
    end
  end

  policies do
    policy action_type(:create) do
      authorize_if actor_present()
    end

    policy action_type([:read, :update, :destroy]) do
      authorize_if expr(user_id == ^actor(:id))
    end
  end
end
