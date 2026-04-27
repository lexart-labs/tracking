# Tasks Feature — Contract

**Branch:** `feat/issues-76`
**Scope:** Full-stack implementation of a Tasks page (`/app/tasks`) embedded as a React iframe inside the AngularJS shell, replacing the legacy tasks module.

---

## 1. Overview

The Tasks feature provides a dedicated page where users can view, filter, create, and edit project tasks. It is role-aware: admins and PMs have broader access (can create tasks for any project and create projects on the fly) than regular developers (who can only interact with their assigned projects and tasks). Clients are blocked entirely.

---

## 2. Architecture

The page follows the existing iframe-embed pattern established by the Tracks module:

```text
AngularJS shell (app.tasks state)
  └── tasksView.html  →  <iframe iframe-resizer src="reactUrl/#/tasks">
        └── React app  →  /tasks route  →  TasksList.jsx
```

Session (user + JWT token) is injected from AngularJS into the iframe via `iFrameResizer.sendMessage`, received by `ResizerProvider`, and stored in Zustand `sessionStore`.

---

## 3. Files Produced

### 3.1 React App (`services/app-react/`)

| File | Description |
|------|-------------|
| `src/application/pages/tasks/list/TasksList.jsx` | Main page component. Orchestrates filters, data fetch, table view, and creation/edit dialogs. |
| `src/application/pages/tasks/components/FilterBar.jsx` | Status filter (`Active`, `Inactive`, `All`). |
| `src/application/pages/tasks/components/TasksTable.jsx` | PrimeReact `DataTable` to display tasks with columns: ID, Project, Task Name, Start Date, End Date, Duration, Status, Progress, and Assignees. |
| `src/application/pages/tasks/components/TaskFormDialog.jsx` | Modal dialog to create/edit tasks. Includes Project selection, Task Name, Duration, Start Date, End Date, Progress Status, and Assignee selection table. |
| `src/application/pages/tasks/components/ProjectCreateDialog.jsx` | Sub-modal for Admin/PM to create a new project on the fly and associate it with a client. |
| `src/services/tasksService.js` | API client for tasks. Handles routing calls based on role (`POST /tasks/all`, `POST /tasks/user/current`, `POST /tasks/new`, `PUT /tasks/update`, etc.). |
| `src/services/projectService.js` | Extended to support creating projects (`POST /projects/new`) for Admin/PM. |

**Modified files:**

| File | Change |
|------|--------|
| `src/main.jsx` | Added `/tasks` route → `<TasksList />`. |
| `src/tests/mocks/handlers.js` | Added MSW handlers for `/tasks/all`, `/tasks/user/current`, `/tasks/new`, `/tasks/update`, `/projects/new`. |

### 3.2 AngularJS Frontend (`services/frontend/`)

| File | Description |
|------|-------------|
| `src/js/app/components/tasks/controllers/tasks.controller.js` | `TasksCtrl` — sets `$scope.env_react_url` to `trackingReactUrl + '/#/tasks'`. |
| `src/js/app/components/tasks/views/tasksView.html` | iframe-resizer template pointing to the React `/tasks` route. |

**Modified files:**

| File | Change |
|------|--------|
| `src/js/routing.js` | Redirect the existing `app.tasks` state to use the new `TasksCtrl` and iframe `tasksView.html`. |
| `src/js/app/shared/controllers/main.controller.js` | Ensure "Tasks" nav menu entry correctly routes to the new state. |

### 3.3 Backend (`services/backend/app/`)

*Note: The APIs are already existing. Minimal to no backend changes are expected. This section serves as documentation of the integration points.*

| File | Change |
|------|--------|
| `routes/web.php` | The routes `POST /api/tasks/all`, `POST /api/tasks/user/current`, `POST /api/tasks/new`, `PUT /api/tasks/update`, `DELETE /api/tasks/delete`, `POST /api/tasks/undelete` are already implemented and will be consumed by the new frontend. |

---

## 4. API Endpoints

All endpoints are prefixed `/api` and require JWT (`Authorization: Bearer <token>`).

### Fetch Tasks

| Method | Path | Middleware | Description |
|--------|------|-----------|-------------|
| `POST` | `/tasks/all` | `pm:api` | All tasks (admin/pm). |
| `POST` | `/tasks/user/current` | `auth:api` | Tasks assigned to the authenticated user. |

### Create / Update Task

| Method | Path | Middleware | Description |
|--------|------|-----------|-------------|
| `POST` | `/tasks/new` | `pm:api` | Admin/PM creates a new task. |
| `PUT` | `/tasks/update` | `pm:api` | Admin/PM updates a task. |
| `PUT` | `/tasks/update` (or custom) | `auth:api` | Regular user updates description of their own task. *(Needs verification on existing route availability for regular users).* |
| `POST` | `/projects/new` | `pm:api` | Admin/PM creates a new project on the fly. |

### Task Deletion (Status Toggle)

| Method | Path | Middleware | Description |
|--------|------|-----------|-------------|
| `DELETE` | `/tasks/delete` | `auth:api` | Marks a task as Inactive (soft delete). |
| `POST` | `/tasks/undelete` | `auth:api` | Marks a task as Active. |

---

## 5. Role-Based Access Control

| Role | Tasks Page | Create Task | Project Selection (Create) | Create New Project | Edit Task | Filter Tasks |
|------|------------|-------------|----------------------------|--------------------|-----------|--------------|
| `admin` | ✅ | ✅ | Any existing project | ✅ | Full | All Tasks |
| `pm` | ✅ | ✅ | Any existing project | ✅ | Full | All Tasks |
| `developer` / `employee` | ✅ | ✅ | Only assigned projects | ❌ | Description & Status only | Only assigned Tasks |
| `client` | ❌ Access Denied | — | — | — | — | — |

---

## 6. UI Behaviour

- **Default View:** Active tasks only.
- **Filter Bar:** Status dropdown (`Active`, `Inactive`, `All`). Visible to all users, but result scope depends on role.
- **Task Form Details:**
  - Project (Select or create new if Admin/PM)
  - Task Name
  - Duration (Estimated hours)
  - Start Date (`Fecha Inicio`)
  - End Date (`Fecha Fin`)
  - Progress (`To-do`, `Done`, `In-Progress`, `In-Review`)
  - Assignees Table (Select users to assign to the task)
  - Description / Comments
- **Play (Start Tracking):** Integrated with the global header. Limits project selector to assigned projects. Admins/PMs can bypass assignment restrictions.
- **Pause Tracking:** Triggers a modal requiring a description of work completed during the session.

---

## 7. Tests

### Unit tests (Vitest + Testing Library)

**`TasksList.test.jsx`** — Target coverage:
- Heading renders correctly.
- Access Denied for `client` role.
- Status filter applies correctly.
- Admin sees "New Project" option in task creation.
- Developer does not see "New Project" option.
- Create/Edit dialog opens with correct fields.
- Empty state message when API returns `[]`.

**`tasksService.test.js`** — Target coverage:
- Admin calls `/tasks/all`.
- Developer calls `/tasks/user/current`.
- Create task payload formatting.
- Update task payload formatting.

### E2E tests (Playwright)

**`tasksList.spec.js`** — Target coverage:
- Page loads successfully after session inject.
- Admin can open task creation dialog and see "Create Project" button.
- Developer can open task creation dialog but only sees their assigned projects.
- Task status toggle (Active/Inactive) works.
- Form validation (required fields: Project, Name, Dates).
