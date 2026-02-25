import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTasks, createTask, updateTask, deleteTask } from '@/api/taskApi';
import type { Task, CreateTaskPayload, UpdateTaskPayload } from '@/types/task';

const TASKS_KEY = ['tasks'] as const;

export function useTasksQuery() {
  return useQuery({
    queryKey: TASKS_KEY,
    queryFn: fetchTasks,
    staleTime: 30_000,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTask(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateTaskPayload) => updateTask(payload),
    onMutate: async (updated) => {
      await qc.cancelQueries({ queryKey: TASKS_KEY });
      const previous = qc.getQueryData<Task[]>(TASKS_KEY);
      qc.setQueryData<Task[]>(TASKS_KEY, (old = []) =>
        old.map((t) => (t.id === updated.id ? { ...t, ...updated } as Task : t))
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(TASKS_KEY, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: TASKS_KEY });
      const previous = qc.getQueryData<Task[]>(TASKS_KEY);
      qc.setQueryData<Task[]>(TASKS_KEY, (old = []) => old.filter((t) => t.id !== id));
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(TASKS_KEY, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}

/**
 * Reorders tasks inside a single column by updating their `position`.
 * We batch the API calls and invalidate once.
 */
export function useReorderTasks() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Array<Pick<Task, 'id' | 'column' | 'position'>>) => {
      await Promise.all(payload.map((p) => updateTask({ id: p.id, column: p.column, position: p.position })));
      return payload;
    },
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: TASKS_KEY });
      const previous = qc.getQueryData<Task[]>(TASKS_KEY);

      qc.setQueryData<Task[]>(TASKS_KEY, (old = []) =>
        old.map((t) => {
          const hit = payload.find((p) => p.id === t.id);
          return hit ? ({ ...t, position: hit.position, column: hit.column } as Task) : t;
        })
      );

      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(TASKS_KEY, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  });
}
