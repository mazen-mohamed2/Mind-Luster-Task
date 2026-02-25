export type ColumnId = 'backlog' | 'in_progress' | 'review' | 'done';

export interface Task {
  id: number;
  title: string;
  description: string;
  column: ColumnId;
  position: number;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  column: ColumnId;
  position: number;
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  id: number;
}

export const COLUMN_CONFIG: Record<ColumnId, { label: string; colorVar: string }> = {
  backlog: { label: 'TO DO', colorVar: '--column-backlog' },
  in_progress: { label: 'IN PROGRESS', colorVar: '--column-progress' },
  review: { label: 'IN REVIEW', colorVar: '--column-review' },
  done: { label: 'DONE', colorVar: '--column-done' },
};

export const COLUMNS_ORDER: ColumnId[] = ['backlog', 'in_progress', 'review', 'done'];
