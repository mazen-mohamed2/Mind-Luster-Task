import { useEffect, useMemo, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { useBoardStore } from "@/store/useBoardStore";
import { useCreateTask, useUpdateTask, useTasksQuery } from "@/hooks/useTasks";
import type { ColumnId } from "@/types/task";

export function TaskFormModal() {
  const { modalOpen, editingTaskId, modalColumn, closeModal } = useBoardStore();
  const { data: tasks } = useTasksQuery();
  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();

  const existingTask = useMemo(
    () => (editingTaskId ? tasks?.find((t) => t.id === editingTaskId) : null),
    [editingTaskId, tasks]
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const effectiveColumn: ColumnId = (existingTask?.column ??
    (modalColumn as ColumnId) ??
    "backlog") as ColumnId;

  useEffect(() => {
    if (!modalOpen) return;

    if (existingTask) {
      setTitle(existingTask.title);
      setDescription(existingTask.description);
    } else {
      setTitle("");
      setDescription("");
    }
  }, [existingTask, modalOpen]);

  const isEditing = !!editingTaskId;
  const isPending = createMutation.isPending || updateMutation.isPending;

  const nextPosition = useMemo(() => {
    const list = (tasks ?? []).filter((t) => t.column === effectiveColumn);
    const maxPos = list.reduce((m, t) => Math.max(m, t.position ?? 0), 0);
    return maxPos + 1;
  }, [tasks, effectiveColumn]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isEditing && existingTask) {
      updateMutation.mutate(
        { id: existingTask.id, title: title.trim(), description: description.trim() },
        { onSuccess: closeModal }
      );
    } else {
      createMutation.mutate(
        {
          title: title.trim(),
          description: description.trim(),
          column: effectiveColumn,
          position: nextPosition,
        },
        { onSuccess: closeModal }
      );
    }
  };

  if (!modalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={isPending ? undefined : closeModal}
      />

      <div className="relative w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold tracking-wide">{isEditing ? "Edit task" : "Add task"}</h2>
          <button
            onClick={closeModal}
            disabled={isPending}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design homepage"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write details..."
              className="mt-1 w-full min-h-[110px] resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={closeModal}
              disabled={isPending}
              className="rounded-lg border border-border px-3 py-2 text-sm hover:bg-accent transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isPending || !title.trim()}
              className="rounded-lg bg-primary px-3 py-2 text-sm text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}