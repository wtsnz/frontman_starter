import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { getSession } from "../lib/auth";
import { Tabs } from "@base-ui/react/tabs";
import { useState } from "react";
import {
  loadTasks,
  toggleTask,
  type StatusFilter,
  type Task,
} from "../lib/tasks";
import { TaskEditor } from "../components/task-editor";
import { DeleteTask } from "../components/delete-task";
export const Route = createFileRoute("/")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { status: StatusFilter } => ({
    status:
      search.status === "open" || search.status === "done"
        ? search.status
        : "all",
  }),
  loaderDeps: ({ search }) => ({ status: search.status }),
  beforeLoad: async () => {
    if (!(await getSession()).user) throw redirect({ to: "/login" });
  },
  loader: ({ deps }) => loadTasks(deps.status),
  component: TasksPage,
});
function TasksPage() {
  const tasks = Route.useLoaderData(),
    { status } = Route.useSearch(),
    router = useRouter(),
    navigate = Route.useNavigate();
  const [error, setError] = useState<string>(),
    [busy, setBusy] = useState<string>();
  const saved = async () => {
    await router.invalidate();
  };
  async function toggle(task: Task) {
    setBusy(task.id);
    setError(undefined);
    try {
      await toggleTask(task);
      await saved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't update the task.");
    } finally {
      setBusy(undefined);
    }
  }
  return (
    <section className="py-12 sm:py-16">
      <div className="page space-y-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              A little room to get things done.
            </h1>
            <p className="max-w-[56ch] text-base text-pretty text-neutral-500">
              Your tasks, one next step at a time.
            </p>
          </div>
          <TaskEditor saved={saved} />
        </div>
        <Tabs.Root
          value={status}
          onValueChange={(value) => {
            void navigate({ search: { status: value as StatusFilter } });
          }}
        >
          <Tabs.List
            className="flex gap-2 overflow-x-auto border-b border-neutral-950/10 pb-4"
            aria-label="Task status"
          >
            {(["all", "open", "done"] as const).map((value) => (
              <Tabs.Tab
                key={value}
                value={value}
                className="rounded-md px-3 py-2 font-medium text-neutral-500 hover:bg-neutral-950/5 data-active:bg-neutral-950/5 data-active:text-neutral-950"
              >
                {value === "all"
                  ? "All tasks"
                  : value === "open"
                    ? "Open"
                    : "Done"}
              </Tabs.Tab>
            ))}
          </Tabs.List>
          <Tabs.Panel value={status} className="pt-6 outline-none">
            {error && (
              <p role="alert" className="pb-4 text-red-700">
                {error}
              </p>
            )}
            <p
              role="status"
              className="pb-4 text-base text-neutral-500 sm:text-sm"
            >
              <span className="tabular-nums">{tasks.length}</span>{" "}
              {tasks.length === 1 ? "task" : "tasks"}
            </p>
            {tasks.length ? (
              <ul role="list" className="divide-y divide-neutral-950/10">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0 flex-1 space-y-2">
                      <h2 className="font-medium text-balance">{task.title}</h2>
                      {task.notes && (
                        <p className="whitespace-pre-wrap break-words text-base text-pretty text-neutral-500 sm:text-sm">
                          {task.notes}
                        </p>
                      )}
                      <p className="text-base text-neutral-500 sm:text-sm">
                        {task.status === "done" ? "Completed" : "Open"}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        className="button-secondary"
                        disabled={busy === task.id}
                        onClick={() => {
                          void toggle(task);
                        }}
                      >
                        {busy === task.id
                          ? "Updating…"
                          : task.status === "open"
                            ? "Mark done"
                            : "Reopen"}
                      </button>
                      <TaskEditor task={task} saved={saved} />
                      <DeleteTask task={task} saved={saved} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="space-y-2 py-12">
                <h2 className="text-xl font-medium text-balance">
                  {status === "done"
                    ? "Nothing completed yet."
                    : "A fresh start."}
                </h2>
                <p className="text-base text-pretty text-neutral-500">
                  {status === "done"
                    ? "Finished tasks will appear here."
                    : "Create a task when you're ready."}
                </p>
              </div>
            )}
          </Tabs.Panel>
        </Tabs.Root>
      </div>
    </section>
  );
}
