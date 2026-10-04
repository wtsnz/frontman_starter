defmodule FrontmanStarter.Workspace do
  use Ash.Domain, extensions: [AshTypescript.Rpc]

  resources do
    resource FrontmanStarter.Workspace.Task
  end

  typescript_rpc do
    resource FrontmanStarter.Workspace.Task do
      rpc_action :list_tasks, :read
      rpc_action :create_task, :create
      rpc_action :update_task, :update
      rpc_action :destroy_task, :destroy
    end
  end
end
