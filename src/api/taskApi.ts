import axios from 'axios';
import type { Task, CreateTaskPayload, UpdateTaskPayload } from '@/types/task';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:4000',
  timeout: 5000,
});

let mockTasks: Task[] = [
  { id: 1, title: 'API integration', description: 'Connect frontend to REST API endpoints', column: 'backlog', position: 1 },
  { id: 2, title: 'Unit tests', description: 'Write tests for utility functions and hooks', column: 'backlog', position: 2 },
  { id: 3, title: 'Performance audit', description: 'Lighthouse scores and bundle analysis', column: 'backlog', position: 3 },
  { id: 4, title: 'Notification system', description: 'Toast notifications and in-app alerts', column: 'backlog', position: 4 },
  { id: 5, title: 'User settings page', description: 'Profile editing, preferences, and account management', column: 'backlog', position: 5 },
  { id: 6, title: 'Authentication flow', description: 'Implement login, signup, and password reset screens', column: 'in_progress', position: 1 },
  { id: 7, title: 'File upload component', description: 'Drag and drop file upload with preview', column: 'in_progress', position: 2 },
  { id: 8, title: 'Dark mode support', description: 'Add theme toggle and CSS variable switching', column: 'review', position: 1 },
  { id: 9, title: 'Dashboard layout', description: 'Build responsive sidebar and main content area', column: 'review', position: 2 },
  { id: 10, title: 'Design system tokens', description: 'Set up color palette, typography, and spacing scales', column: 'done', position: 1 },
];
let mockIdCounter = 11;

let useMock: boolean | null = null;

async function shouldUseMock(): Promise<boolean> {
  if (useMock !== null) return useMock;
  try {
    await api.get('/tasks', { timeout: 1500 });
    useMock = false;
  } catch {
    console.info('[taskApi] json-server not available — using in-memory mock');
    useMock = true;
  }
  return useMock;
}

export async function fetchTasks(): Promise<Task[]> {
  const use = await shouldUseMock();
  const list = use ? [...mockTasks] : (await api.get<Task[]>('/tasks')).data;

  return list.sort((a, b) => {
    if (a.column !== b.column) return a.column.localeCompare(b.column);
    return (a.position ?? 0) - (b.position ?? 0);
  });
}

export async function createTask(payload: CreateTaskPayload): Promise<Task> {
  if (await shouldUseMock()) {
    const task: Task = { ...payload, id: mockIdCounter++ };
    mockTasks.push(task);
    return task;
  }
  const { data } = await api.post<Task>('/tasks', payload);
  return data;
}

export async function updateTask({ id, ...payload }: UpdateTaskPayload): Promise<Task> {
  if (await shouldUseMock()) {
    const idx = mockTasks.findIndex((t) => t.id === id);
    if (idx === -1) throw new Error('Task not found');
    mockTasks[idx] = { ...mockTasks[idx], ...payload } as Task;
    return mockTasks[idx];
  }
  const { data } = await api.patch<Task>(`/tasks/${id}`, payload);
  return data;
}

export async function deleteTask(id: number): Promise<void> {
  if (await shouldUseMock()) {
    mockTasks = mockTasks.filter((t) => t.id !== id);
    return;
  }
  await api.delete(`/tasks/${id}`);
}
