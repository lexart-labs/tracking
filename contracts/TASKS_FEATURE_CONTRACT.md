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
| `src/application/pages/tasks/list/TasksList.jsx` | Main page component. Orchestrates filters, data fetch, table view, and creation/edit dialogs. Correctly handles role-based data fetching and coordinates tracking synchronization with the global header. |
| `src/application/pages/tasks/components/FilterBar.jsx` | Dual filtering: Status (`Active`, `Inactive`, `All`) and Progress Status (`To-do`, `In-Progress`, `In-Review`, `Done`). |
| `src/application/pages/tasks/components/TasksTable.jsx` | PrimeReact `DataTable` to display tasks. Includes reactive "Play/Pause" buttons with single-active-track enforcement (disables other tasks when one is running). |
| `src/application/pages/tasks/components/TaskFormDialog.jsx` | Modal dialog to create/edit tasks. Uses a dynamic `key` pattern for clean state initialization. Includes Project selection, Task Name, Duration, Start Date, End Date, Progress Status, and Assignee selection table. |
| `src/application/pages/tasks/components/ProjectCreateDialog.jsx` | Sub-modal for Admin/PM to create a new project. Automatically sends mandatory fields (`active`, `duration`, `description`) to satisfy backend validation. |
| `src/services/tasksService.js` | API client for tasks. Normalizes dates to local `YYYY-MM-DD` and maps `assignees` to `users` payload. |
| `src/services/tracksService.js` | API client for tracking. Includes cache-busting (`?t=...`) for the `getCurrentUserLastTrack` call to ensure fresh UI state. |

**Modified files:**

| File | Change |
|------|--------|
| `src/main.jsx` | Added `/tasks` route → `<TasksList />`. |
| `src/tests/mocks/handlers.js` | Added MSW handlers for `/projects/tasks/all`, `/projects/tasks/user/current`, `/projects/tasks/new`, `/projects/tasks/update`, `/projects/new`, and `/user/all-admin`. |

### 3.2 AngularJS Frontend (`services/frontend/`)

| File | Description |
|------|-------------|
| `src/js/app/components/tasks/tasks/controllers/tasks_react.controller.js` | `TasksReactCtrl` — sets `$scope.env_react_url` to `trackingReactUrl + '/#/tasks'`. |
| `src/js/app/components/tasks/tasks/views/tasks_react.html` | iframe-resizer template pointing to the React `/tasks` route. |

**Modified files:**

| File | Change |
|------|--------|
| `src/js/routing.js` | Redirect the existing `app.tasks` state to use the new `TasksReactCtrl` and iframe `tasks_react.html`. |
| `src/js/app/shared/controllers/main.controller.js` | Ensure "Tasks" nav menu entry correctly routes to the new state. |

### 3.3 Backend (`services/backend/app/`)

*Note: The APIs are already existing. Minimal to no backend changes are expected. This section serves as documentation of the integration points.*

| File | Change |
|------|--------|
| `routes/web.php` | The routes `POST /api/projects/tasks/all`, `POST /api/projects/tasks/user/current`, `POST /api/projects/tasks/new`, `PUT /api/projects/tasks/update`, `DELETE /api/projects/tasks/delete`, `POST /api/projects/tasks/undelete`, and `GET /api/user/all-admin` are already implemented and will be consumed by the new frontend. |

---

## 4. API Endpoints

All endpoints are prefixed `/api` and require JWT (`Authorization: Bearer <token>`).

### Fetch Tasks

| Method | Path | Middleware | Description |
|--------|------|-----------|-------------|
| `POST` | `/projects/tasks/all` | `pm:api` | All tasks (admin/pm). |
| `POST` | `/projects/tasks/user/current` | `auth:api` | Tasks assigned to the authenticated user. |
| `GET` | `/projects/all` | `auth:api` | All active projects for admin/pm. Non-admin see only projects with assigned tasks. |
| `GET` | `/projects/tasks/project/{id}` | `auth:api` | All tasks of a project for admin/pm. Non-admin see only assigned tasks. |

### Fetch Users

| Method | Path | Middleware | Description |
|--------|------|-----------|-------------|
| `GET` | `/user/all-admin` | `pm:api` | All users (for admin/pm selection). |
| `GET` | `/user/all` | `auth:api` | Basic user list. |

### Create / Update Task

| Method | Path | Middleware | Description |
|--------|------|-----------|-------------|
| `POST` | `/projects/tasks/new` | `pm:api` | Admin/PM creates a new task. Requires `startDate` and `endDate` in `Y-m-d`. |
| `PUT` | `/projects/tasks/update` | `pm:api` | Admin/PM updates a task. |
| `POST` | `/projects/new` | `pm:api` | Admin/PM creates a new project. Requires `active`, `duration`, `description`, `idClient`, `name`. |
| `PUT` | `/tracks/update` | `auth:api` | Updates/Stops a track. The `duracion` field MUST be omitted to allow backend auto-calculation. |

---

## 5. Role-Based Access Control

| Role | Tasks Page | Create Task | Project Selection (Create) | Create New Project | Edit Task | Filter Tasks |
|------|------------|-------------|----------------------------|--------------------|-----------|--------------|
| `admin` | ✅ | ✅ | Any existing project | ✅ | Full | All Tasks |
| `pm` | ✅ | ✅ | Any existing project | ✅ | Full | All Tasks |
| `developer` / `employee` | ✅ | ✅ | Only projects with assigned tasks | ❌ | Description & Status only | Only assigned Tasks |
| `client` | ❌ Access Denied | — | — | — | — | — |

---

## 6. UI Behaviour

- **Default View:** Active tasks only.
- **Filter Bar:**
  - Status dropdown (`Active`, `Inactive`, `All`).
  - Progress dropdown (`To-do`, `In-Progress`, `In-Review`, `Done`).
- **Task Form Details:**
  - Project (Select or create new if Admin/PM)
  - Task Name
  - Duration (Estimated hours)
  - Start Date (`Fecha Inicio`)
  - End Date (`Fecha Fin`)
  - Progress (`To-do`, `Done`, `In-Progress`, `In-Review`)
  - Assignees Table (Select users to assign to the task)
  - Description / Comments
- **Play (Start Tracking):** Integrated with the global header. 
  - Only one task can be active at a time for the current user.
  - When a task is running, other tasks' "Play" buttons are disabled (grayscale, 40% opacity).
  - Tooltips provide feedback: "Another task is running" or "Start Tracking".
- **Tracking Sync:**
  - On every start/stop action, React sends `window.parent.postMessage({ action: 'refresh-timer' }, '*')` to AngularJS.
  - This ensures the top bar timer and the legacy dashboard stay in sync without page reloads.
- **Task Form Details:**
  - Project: Disabled on edit to maintain data integrity. Normalizes IDs to `Number` for matching.
  - Dates: Formatted to local `YYYY-MM-DD` before sending to avoid timezone shifts.
  - End Date: Must be strictly after Start Date (backend validation).
  - Assignees: Managed via a sub-table within the dialog.
- **Table View:** Removed "Assignees" column from the main table to reduce clutter (still available in edit dialog).

---

## 7. Tests

### Unit tests (Vitest + Testing Library)

**`TasksList.test.jsx`** — Target coverage:
- Heading renders correctly.
- Access Denied for `client` role.
- Status and Progress filters apply correctly.
- Admin sees "New Project" option in task creation.
- Developer does not see "New Project" option.
- Create/Edit dialog opens with correct fields.
- Empty state message when API returns `[]`.

**`tasksService.test.js`** — Target coverage:
- Admin calls `/projects/tasks/all`.
- Developer calls `/projects/tasks/user/current`.
- Create task payload formatting.
- Update task payload formatting.

### E2E tests (Playwright)

**`tasksList.spec.js`** — Target coverage:
- Page loads successfully after session inject.
- Admin can open task creation dialog and see "Create Project" button.
- Developer can open task creation dialog but only sees their assigned projects.
- Task status toggle (Active/Inactive) works.
- Form validation (required fields: Project, Name, Dates).
