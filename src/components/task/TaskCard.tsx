import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Pencil, Trash2 } from 'lucide-react';
import type { Task } from '@/types/task';
import { COLUMN_CONFIG } from '@/types/task';
import { useBoardStore } from '@/store/useBoardStore';
import { useDeleteTask } from '@/hooks/useTasks';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface TaskCardProps {
  task: Task;
  /** When used inside DragOverlay we render a static preview (no sortable listeners). */
  isOverlay?: boolean;
}

function makeSvgCursor(svg: string, hotspotX = 12, hotspotY = 12, fallback = 'grab') {
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');

  return `url("data:image/svg+xml,${encoded}") ${hotspotX} ${hotspotY}, ${fallback}`;
}

const CURSOR_GRAB = makeSvgCursor(
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
     <path d="M8 11V8a1 1 0 1 1 2 0v3h1V7a1 1 0 1 1 2 0v4h1V8a1 1 0 1 1 2 0v3h1V9a1 1 0 1 1 2 0v6c0 2.8-2 5-4.8 5H12c-2.2 0-3.4-1.1-4.2-2.6L6.1 14.2a1.3 1.3 0 0 1 2-1.6L8 13V11z"
           fill="#6b7280"/>
   </svg>`,
  12,
  12,
  'grab'
);

const CURSOR_GRABBING = makeSvgCursor(
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24">
     <path d="M8 11V8a1 1 0 1 1 2 0v3h1V7a1 1 0 1 1 2 0v4h1V8a1 1 0 1 1 2 0v3h1V9a1 1 0 1 1 2 0v6c0 2.8-2 5-4.8 5H12c-2.2 0-3.4-1.1-4.2-2.6L6.1 14.2a1.3 1.3 0 0 1 2-1.6L8 13V11z"
           fill="black"/>
   </svg>`,
  12,
  12,
  'grabbing'
);

export function TaskCard({ task, isOverlay }: TaskCardProps) {
  const { openEditModal } = useBoardStore();
  const deleteMutation = useDeleteTask();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const sortable = useSortable({ id: task.id, data: { task } });

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortable;

  const config = COLUMN_CONFIG[task.column];

  const stop = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleConfirmDelete = async () => {
    deleteMutation.mutate(task.id, {
      onSuccess: () => setConfirmOpen(false),
      onError: () => setConfirmOpen(false),
    });
  };

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging && !isOverlay ? 0.6 : 1,

    cursor: isOverlay || isDragging ? CURSOR_GRABBING : CURSOR_GRAB,
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...(!isOverlay ? attributes : {})}
        {...(!isOverlay ? listeners : {})}
        className={`group rounded-lg border border-border bg-card p-3.5 shadow-sm hover:shadow-md transition-shadow ${
          isDragging && !isOverlay ? 'task-dragging' : ''
        }`}
        aria-label="Task card"
      >
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-foreground leading-snug">{task.title}</h4>
            <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {task.description}
            </p>

            <span
              className="mt-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground"
              style={{ backgroundColor: `hsl(var(${config.colorVar}))` }}
            >
              {config.label}
            </span>
          </div>

          {!isOverlay && (
            <div className="shrink-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  stop(e);
                  openEditModal(task.id);
                }}
                className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                aria-label="Edit task"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={(e) => {
                  stop(e);
                  setConfirmOpen(true);
                }}
                className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                aria-label="Delete task"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The task will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}