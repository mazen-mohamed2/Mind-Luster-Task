import { create } from 'zustand';

interface BoardState {
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  modalOpen: boolean;
  editingTaskId: number | null;
  modalColumn: string | null;
  openCreateModal: (column: string) => void;
  openEditModal: (taskId: number) => void;
  closeModal: () => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  modalOpen: false,
  editingTaskId: null,
  modalColumn: null,

  openCreateModal: (column) =>
    set({ modalOpen: true, editingTaskId: null, modalColumn: column }),

  openEditModal: (taskId) =>
    set({ modalOpen: true, editingTaskId: taskId, modalColumn: null }),

  closeModal: () =>
    set({ modalOpen: false, editingTaskId: null, modalColumn: null }),
}));
