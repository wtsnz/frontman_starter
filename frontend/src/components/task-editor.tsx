import { Dialog } from "@base-ui/react/dialog";
import { Input } from "@base-ui/react/input";
import { useState, type FormEvent } from "react";
import { saveTask, type Task } from "../lib/tasks";

export function TaskEditor({
  task,
  saved,
}: {
  task?: Task;
  saved: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setBusy(true);
    setError(undefined);
    try {
      await saveTask(
        { title: String(data.get("title")), notes: String(data.get("notes")) },
        task?.id,
      );
      await saved();
      setOpen(false);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Couldn't save the task.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        if (!busy) {
          setOpen(value);
          setError(undefined);
        }
      }}
    >
      <Dialog.Trigger
        type="button"
        className={task ? "button-secondary" : "button-primary"}
      >
        {task ? "Edit" : "New task"}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="absolute inset-0 bg-neutral-950/35" />
        <Dialog.Viewport className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Popup className="w-full max-w-md rounded-xl bg-white p-6 ring-1 ring-black/10 shadow-xl">
            <div className="space-y-2">
              <Dialog.Title className="text-2xl font-semibold tracking-tight">
                {task ? "Edit task" : "New task"}
              </Dialog.Title>
              <Dialog.Description className="text-base text-neutral-500 sm:text-sm">
                Give your next step a name.
              </Dialog.Description>
            </div>
            <form method="post" onSubmit={submit} className="mt-6 space-y-5">
              <div className="space-y-2">
                <label htmlFor="task-title" className="font-medium">
                  Title
                </label>
                <Input
                  id="task-title"
                  name="title"
                  className="input"
                  required
                  maxLength={140}
                  defaultValue={task?.title || ""}
                  placeholder="What needs doing?"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="task-notes" className="font-medium">
                  Notes
                </label>
                <textarea
                  id="task-notes"
                  name="notes"
                  className="input min-h-28 resize-y"
                  maxLength={2000}
                  defaultValue={task?.notes || ""}
                />
              </div>
              {error && (
                <p role="alert" className="text-red-700">
                  {error}
                </p>
              )}
              <div className="flex justify-end gap-3">
                <Dialog.Close
                  type="button"
                  className="button-secondary"
                  disabled={busy}
                >
                  Cancel
                </Dialog.Close>
                <button
                  type="submit"
                  className="button-primary"
                  disabled={busy}
                >
                  {busy ? "Saving…" : "Save task"}
                </button>
              </div>
            </form>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
