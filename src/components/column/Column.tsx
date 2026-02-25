import { useState, useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import type { Task, ColumnId } from '@/types/task';
import { COLUMN_CONFIG } from '@/types/task';
import { TaskCard } from '@/components/task/TaskCard';
import { useBoardStore } from '@/store/useBoardStore';

const PAGE_SIZE = 5;

interface ColumnProps {
  columnId: ColumnId;
  tasks: Task[];
}

export function Column({ columnId, tasks }: ColumnProps) {
  const config = COLUMN_CONFIG[columnId];
  const { openCreateModal } = useBoardStore();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const { setNodeRef, isOver } = useDroppable({ id: columnId });

  const visibleTasks = useMemo(() => {
    const sorted = [...tasks].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    return sorted.slice(0, visibleCount);
  }, [tasks, visibleCount]);

  const hasMore = visibleCount < tasks.length;

  return (
    <div
      className={`flex flex-col rounded-xl bg-card/60 border border-border/60 min-h-[300px] transition-colors ${
        isOver ? 'ring-2 ring-ring/30 bg-accent/40' : ''
      }`}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: `hsl(var(${config.colorVar}))` }}
          />
          <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            {config.label}
          </h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {tasks.length}
          </span>
        </div>
      </div>

      <div ref={setNodeRef} className="flex-1 p-2 space-y-2 column-scroll overflow-y-auto max-h-[calc(100vh-280px)]">
        <SortableContext items={visibleTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {visibleTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center py-8 text-xs text-muted-foreground/60">
            No tasks yet
          </div>
        )}

        {hasMore && (
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="w-full rounded-lg py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            Show more ({tasks.length - visibleCount} remaining)
          </button>
        )}
      </div>

      <button
        onClick={() => openCreateModal(columnId)}
        className="flex items-center gap-1.5 px-4 py-3 text-xs font-medium text-muted-foreground hover:text-foreground border-t border-border/40 hover:bg-accent/50 transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        Add task
      </button>
    </div>
  );
}
