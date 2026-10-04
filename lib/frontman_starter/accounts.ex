defmodule FrontmanStarter.Accounts do
  use Ash.Domain

  resources do
    resource FrontmanStarter.Accounts.User
    resource FrontmanStarter.Accounts.Token
  end
end
