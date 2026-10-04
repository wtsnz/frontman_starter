defmodule FrontmanStarter.TaskTest do
  use FrontmanStarter.DataCase, async: false
  alias FrontmanStarter.Workspace.Task

  test "Ash validates task inputs and persists updates" do
    user = FrontmanStarter.Fixtures.user()
    refute Task |> Ash.Changeset.for_create(:create, %{title: "   "}) |> Map.fetch!(:valid?)

    refute Task
           |> Ash.Changeset.for_create(:create, %{title: "Test", status: "unknown"})
           |> Map.fetch!(:valid?)

    task =
      Task
      |> Ash.Changeset.for_create(:create, %{title: "A next step"}, actor: user)
      |> Ash.create!()

    assert task.status == :open
    assert task.user_id == user.id

    done =
      task |> Ash.Changeset.for_update(:update, %{status: :done}, actor: user) |> Ash.update!()

    assert Ash.get!(Task, task.id, actor: user).status == :done
    Ash.destroy!(done, actor: user)
    assert Ash.read!(Task, actor: user) == []
  end

  test "users cannot read or mutate another user's tasks" do
    owner = FrontmanStarter.Fixtures.user("owner@example.com")
    stranger = FrontmanStarter.Fixtures.user("stranger@example.com")

    task =
      Task
      |> Ash.Changeset.for_create(:create, %{title: "Private"}, actor: owner)
      |> Ash.create!()

    assert Ash.read!(Task, actor: stranger) == []
    assert {:error, _} = Ash.update(task, %{title: "Stolen"}, actor: stranger)
    assert {:error, _} = Ash.destroy(task, actor: stranger)

    assert {:error, _} =
             Task |> Ash.Changeset.for_create(:create, %{title: "Anonymous"}) |> Ash.create()

    assert Ash.get!(Task, task.id, actor: owner).title == "Private"
  end
end
