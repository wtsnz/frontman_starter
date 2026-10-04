import {
  createTask,
  destroyTask,
  listTasks,
  updateTask,
  type InferListTasksResult,
} from "../ash_rpc";
import { rpcFetch } from "./rpc";
export const taskFields = [
  "id",
  "title",
  "notes",
  "status",
  "createdAt",
] as const;
export type Task = InferListTasksResult<[...typeof taskFields]>[number];
export type StatusFilter = "all" | "open" | "done";

function unwrap<T>(
  result:
    | { success: true; data: T }
    | { success: false; errors: { message: string }[] },
): T {
  if (!result.success)
    throw new Error(result.errors.map((error) => error.message).join("; "));
  return result.data;
}
export async function loadTasks(status: StatusFilter) {
  return unwrap(
    await listTasks({
      fields: [...taskFields],
      sort: "-createdAt",
      filter: status === "all" ? undefined : { status: { eq: status } },
      customFetch: rpcFetch,
    }),
  );
}
export async function saveTask(
  input: { title: string; notes: string },
  id?: string,
) {
  return id
    ? unwrap(
        await updateTask({
          identity: id,
          input,
          fields: [...taskFields],
          customFetch: rpcFetch,
        }),
      )
    : unwrap(
        await createTask({
          input,
          fields: [...taskFields],
          customFetch: rpcFetch,
        }),
      );
}
export async function toggleTask(task: Task) {
  return unwrap(
    await updateTask({
      identity: task.id,
      input: { status: task.status === "open" ? "done" : "open" },
      fields: [...taskFields],
      customFetch: rpcFetch,
    }),
  );
}
export async function removeTask(id: string) {
  return unwrap(await destroyTask({ identity: id, customFetch: rpcFetch }));
}
