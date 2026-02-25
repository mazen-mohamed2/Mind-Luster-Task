# Kanban Task Board (React + Vite)

A Kanban-style task board built with React and Vite.
It supports managing tasks across four workflow columns with drag & drop, task CRUD operations, search, and persistent storage through a mock REST API.

---

## Tech Stack

- React 18 + TypeScript
- Vite
- @dnd-kit (Drag & Drop)
- TanStack React Query (data fetching + caching)
- Zustand (UI state)
- Tailwind CSS + shadcn/ui (UI primitives/components)
- json-server (mock REST API)

---

## Features

- 4 columns: Backlog, In Progress, Review, Done
- Create / Edit / Delete tasks (modal form)
- Drag & drop tasks between columns
- Reorder tasks within the same column
- Search tasks by title or description
- Data persistence via REST API (json-server)
- Optimistic updates for smoother UX
- Confirmation dialog for delete

---

## Project Structure

src/
- api/        → API client + requests
- hooks/      → React Query hooks (queries/mutations)
- store/      → Zustand store (modal state, etc.)
- components/ → Board / Column / Task / Modals / UI
- types/      → TypeScript types (Task, Column, etc.)

---

## Getting Started

### 1) Install dependencies

npm install

### 2) Run the mock API (json-server)

npm run server

By default the server runs on:
http://localhost:4000

Tasks endpoint:
http://localhost:4000/tasks

### 3) Run the app

npm run dev

Open:
http://localhost:5173

---

## API Notes (json-server)

The app communicates with json-server using typical REST operations:

- GET /tasks
- POST /tasks
- PATCH /tasks/:id
- DELETE /tasks/:id

Each task includes:
- id
- title
- description
- column (backlog | in_progress | review | done)
- position (number used for ordering inside the column)

---

## Drag & Drop Behavior

- Implemented using @dnd-kit
- Supports:
  - Moving tasks between columns
  - Reordering inside the same column
- On drop:
  - The UI updates optimistically
  - The new column and/or position are persisted to the API via PATCH

---

## Search

- Search input filters tasks by title or description
- Search is applied across all columns
- Uses json-server full-text search (q) and a small client-side filter for consistent UX

---

## Tests

Run unit tests with:

npm test

---

## Production Build

npm run build
npm run preview

---

## Notes

- json-server is used for quick local mocking. In real production, the backend would usually manage ordering rules and validations.
- UI primitives are based on shadcn components and customized for the Kanban layout.
