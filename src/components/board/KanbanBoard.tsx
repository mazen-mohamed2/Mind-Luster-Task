import { useMemo, useCallback } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { useState } from 'react';
import { useTasksQuery, useUpdateTask, useReorderTasks } from '@/hooks/useTasks';
import { useBoardStore } from '@/store/useBoardStore';
import type { Task, ColumnId } from '@/types/task';
import { COLUMNS_ORDER } from '@/types/task';
import { Column } from '@/components/column/Column';
import { TaskCard } from '@/components/task/TaskCard';
import { SearchBar } from '@/components/board/SearchBar';
import { TaskFormModal } from '@/components/task/TaskFormModal';
import { Loader2 } from 'lucide-react';

export function KanbanBoard() {
  const { data: tasks = [], isLoading, isError } = useTasksQuery();
  const updateTask = useUpdateTask();
  const reorderTasks = useReorderTasks();
  const searchQuery = useBoardStore((s) => s.searchQuery);

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    const q = searchQuery.toLowerCase();
    return tasks.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }, [tasks, searchQuery]);

  const tasksByColumn = useMemo(() => {
    const grouped: Record<ColumnId, Task[]> = {
      backlog: [],
      in_progress: [],
      review: [],
      done: [],
    };
    filteredTasks.forEach((t) => grouped[t.column].push(t));
    return grouped;
  }, [filteredTasks]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = tasks.find((t) => t.id === event.active.id);
      if (task) setActiveTask(task);
    },
    [tasks]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over) return;

      const taskId = active.id as number;
      const overId = over.id as number | string;

      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      if (COLUMNS_ORDER.includes(overId as ColumnId)) {
        const targetColumn = overId as ColumnId;
        if (task.column !== targetColumn) {
          updateTask.mutate({ id: taskId, column: targetColumn, position: 1 });
        }
        return;
      }

      const overTask = tasks.find((t) => t.id === overId);
      if (!overTask) return;

      const fromColumn = task.column;
      const toColumn = overTask.column;

      if (fromColumn !== toColumn) {
        updateTask.mutate({ id: taskId, column: toColumn, position: overTask.position ?? 1 });
        return;
      }

      const columnTasks = tasks
        .filter((t) => t.column === fromColumn)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

      const oldIndex = columnTasks.findIndex((t) => t.id === taskId);
      const newIndex = columnTasks.findIndex((t) => t.id === overTask.id);

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return;

      const reordered = arrayMove(columnTasks, oldIndex, newIndex);

      const payload = reordered.map((t, idx) => ({
        id: t.id,
        column: t.column,
        position: idx + 1,
      }));

      reorderTasks.mutate(payload);
    },
    [tasks, updateTask, reorderTasks]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive text-sm font-medium">
          Failed to load tasks. Make sure json-server is running on port 4000.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            KANBAN BOARD
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {tasks.length} tasks
          </p>
        </div>
        <SearchBar />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {COLUMNS_ORDER.map((col) => (
            <Column key={col} columnId={col} tasks={tasksByColumn[col]} />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
        </DragOverlay>
      </DndContext>

      <TaskFormModal />
    </>
  );
}
