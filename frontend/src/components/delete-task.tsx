import { AlertDialog } from "@base-ui/react/alert-dialog";
import { useState } from "react";
import { removeTask, type Task } from "../lib/tasks";
export function DeleteTask({
  task,
  saved,
}: {
  task: Task;
  saved: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState<string>();
  async function remove() {
    setBusy(true);
    setError(undefined);
    try {
      await removeTask(task.id);
      await saved();
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't delete the task.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(value) => {
        if (!busy) {
          setOpen(value);
          setError(undefined);
        }
      }}
    >
      <AlertDialog.Trigger type="button" className="button-secondary">
        Delete
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop className="absolute inset-0 bg-neutral-950/35" />
        <AlertDialog.Viewport className="fixed inset-0 flex items-center justify-center p-4">
          <AlertDialog.Popup className="w-full max-w-md space-y-5 rounded-xl bg-white p-6 ring-1 ring-black/10 shadow-xl">
            <div className="space-y-2">
              <AlertDialog.Title className="text-2xl font-semibold tracking-tight">
                Delete task?
              </AlertDialog.Title>
              <AlertDialog.Description className="text-base text-neutral-600 sm:text-sm">
                “{task.title}” will be permanently removed.
              </AlertDialog.Description>
            </div>
            {error && (
              <p role="alert" className="text-red-700">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-3">
              <AlertDialog.Close
                type="button"
                className="button-secondary"
                disabled={busy}
              >
                Cancel
              </AlertDialog.Close>
              <button
                type="button"
                onClick={remove}
                className="button-primary bg-red-700 hover:bg-red-800"
                disabled={busy}
              >
                {busy ? "Deleting…" : "Delete task"}
              </button>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
