# Tracks Reports Feature — Contract

**Branch:** `feat/issue-98`
**Scope:** Full-stack implementation of a Tracks Reports page (`/app/tracks`) embedded as a React iframe inside the AngularJS shell.

---

## 1. Overview

The Tracks Reports feature provides a dedicated page where users can view, filter, edit, and export their time-tracking records. It is role-aware: admins and PMs have broader access than regular developers, and clients are blocked entirely.

---

## 2. Architecture

The page follows the existing iframe-embed pattern:

```
AngularJS shell (app.tracks state)
  └── tracksView.html  →  <iframe iframe-resizer src="reactUrl/#/tracks">
        └── React app  →  /tracks route  →  TracksList.jsx
```

Session (user + JWT token) is injected from AngularJS into the iframe via `iFrameResizer.sendMessage`, received by `ResizerProvider`, and stored in Zustand `sessionStore`.

---

## 3. Files Produced

### 3.1 React App (`services/app-react/`)

| File | Description |
|------|-------------|
| `src/application/pages/tracks/list/TracksList.jsx` | Main page component. Orchestrates filters, data fetch, table, summary, export, and edit dialog. |
| `src/application/pages/tracks/components/FilterBar.jsx` | Date range pickers + optional Client/User/Project dropdowns (admin/pm only). Enforces max 1-month range. |
| `src/application/pages/tracks/components/GroupedTracksTable.jsx` | PrimeReact `DataTable` with row grouping by project, per-group subtotals (time + cost per currency), and an inline edit button per row. |
| `src/application/pages/tracks/components/TracksSummary.jsx` | Summary card below the table. Shows duration and cost per project, grouped by currency, with grand totals. |
| `src/application/pages/tracks/components/TrackEditDialog.jsx` | Modal dialog to edit task name, start time, and end time of a track. Cost/Hour and Cost are shown read-only. |
| `src/application/pages/tracks/form/TrackForm.jsx` | Full-page edit form (route `/tracks/edit/:trackId`). Accepts track via router `location.state`. |
| `src/application/pages/tracks/utils/exportTracks.js` | Client-side export utilities: `exportToPDF` (jsPDF + autoTable, landscape, with summary section) and `exportToCSV` (UTF-8 BOM, quoted fields). |
| `src/services/tracksService.js` | API client for tracks. Routes calls based on role: `GET /tracks/user/all` (admin/pm, no filter), `POST /tracks/user/:id` (admin/pm + user filter), `POST /tracks/user/current` (developer/employee). Also exposes `update` and `exportCsv`. |
| `src/services/projectService.js` | Thin API client: `GET /projects/all` — used to populate the Project filter dropdown. |

**Modified files:**

| File | Change |
|------|--------|
| `src/main.jsx` | Added `/tracks` route → `<TracksList />`. |
| `src/tests/mocks/handlers.js` | Added MSW handlers for `/tracks/user/all`, `/tracks/user/current`, `/tracks/user/:id`, `/tracks/export/csv`, and `/projects/all`. |
| `src/tests/e2e/helpers/session.js` | Extended with `clientUser` fixture used in tests. |

### 3.2 AngularJS Frontend (`services/frontend/`)

| File | Description |
|------|-------------|
| `src/js/app/components/tracks/controllers/tracks.controller.js` | `TracksCtrl` — sets `$scope.env_react_url` to `trackingReactUrl + '/#/tracks'`. |
| `src/js/app/components/tracks/views/tracksView.html` | iframe-resizer template pointing to the React `/tracks` route. |
| `src/js/app/components/tracks/services/tracks.service.js` | AngularJS `$http` wrapper (legacy, available if needed). |

**Modified files:**

| File | Change |
|------|--------|
| `src/js/routing.js` | Added `app.tracks` state: url `/tracks`, controller `TracksCtrl`, template `tracksView.html`. |
| `src/assets/languages/es.json` | Added Spanish translation keys for the Tracks section. |
| `src/js/app/shared/controllers/main.controller.js` | Added "Tracks" nav menu entry. |

### 3.3 Backend (`services/backend/app/`)

| File | Change |
|------|--------|
| `app/Http/Controllers/TracksController.php` | Added two new endpoints (see §4) plus private helpers `getExportTracks`, `formatDuration`, `minutesToHhmm`, `formatDatetimeExport`. Also updated `update()` to support a `trace=reports` flag that preserves the original `idWeeklyHour` instead of re-resolving it by date. |
| `routes/web.php` | Registered new routes: `POST /api/tracks/user/all`, `POST /api/tracks/user/current`, `PUT /api/tracks/user/current/update`, `POST /api/tracks/export/csv`. |

---

## 4. API Endpoints

All endpoints are prefixed `/api` and require JWT (`Authorization: Bearer <token>`).

### Fetch tracks

| Method | Path | Middleware | Description |
|--------|------|-----------|-------------|
| `POST` | `/tracks/user/all` | `pm:api` | All users' tracks (admin/pm). Accepts optional `idUser`, `idClient`, `idProject` in body. |
| `POST` | `/tracks/user/:id` | `pm:api` | Tracks for a specific user (admin/pm). Same optional filters. |
| `POST` | `/tracks/user/current` | `auth:api` | Tracks for the authenticated user. |

**Request body** (all fetch endpoints):
```json
{
  "startTime": "YYYY-MM-DD HH:mm:ss",
  "endTime":   "YYYY-MM-DD HH:mm:ss",
  "idUser":    1,       // optional
  "idClient":  2,       // optional
  "idProject": 3        // optional
}
```

**Response** (200):
```json
{
  "response": [
    {
      "id": 1,
      "name": "Implement login",
      "startTime": "2024-03-01 09:00:00",
      "endTime": "2024-03-01 10:00:00",
      "duration": "01:00:00",
      "idUser": 5,
      "idProyecto": 12,
      "currency": "USD",
      "costHour": "50.00",
      "trackCost": 50.00,
      "projectName": "Alpha Project",
      "clientName": "Acme Corp",
      "userName": "John Doe",
      "photo": "..."
    }
  ]
}
```

### Update track

| Method | Path | Middleware | Description |
|--------|------|-----------|-------------|
| `PUT` | `/tracks/update` | `pm:api` | Admin/pm update any track. |
| `PUT` | `/tracks/user/current/update` | `auth:api` | Developer updates their own track. |

**Request body:**
```json
{
  "id":        1,
  "idUser":    5,
  "startTime": "YYYY-MM-DD HH:mm:ss",
  "endTime":   "YYYY-MM-DD HH:mm:ss",
  "trace":     "reports"   // optional — preserves original idWeeklyHour
}
```

Cost (`trackCost`) is **recalculated server-side** from the new duration × `costHour`. When `trace=reports`, the WeeklyHour record attached to the original track is used; otherwise the record valid on the new start date is used.

### Export CSV

| Method | Path | Middleware | Description |
|--------|------|-----------|-------------|
| `POST` | `/tracks/export/csv` | `auth:api` | Returns a UTF-8 BOM CSV file. |

**Request body:** same shape as fetch endpoints.
**Response:** `Content-Type: text/csv; charset=utf-8`, `Content-Disposition: attachment; filename="tracks.csv"`.
**Columns (admin/pm):** User, Project, Client, Task, Start, End, Duration, Cost/Hour, Cost.
**Columns (developer):** Project, Client, Task, Start, End, Duration, Cost/Hour, Cost.

---

## 5. Role-Based Access Control

| Role | Tracks page | User/Client/Project filters | Edit any track | Export |
|------|------------|----------------------------|---------------|--------|
| `admin` | ✅ | ✅ | ✅ (`PUT /tracks/update`) | ✅ (with User column) |
| `pm` | ✅ | ✅ | ✅ (`PUT /tracks/update`) | ✅ (with User column) |
| `developer` / `employee` | ✅ | ❌ (own tracks only) | ✅ (own, `PUT /tracks/user/current/update`) | ✅ (no User column) |
| `client` | ❌ Access Denied | — | — | — |

---

## 6. UI Behaviour

- **Default date range:** last 7 days (`from` = today − 7 days, `to` = today).
- **Max date range:** 1 month. The `To` calendar is capped at `from + 1 month`; an error message is shown if violated.
- **Fetch is manual:** data only loads when the user clicks **Apply**.
- **Grouping:** rows are grouped by project. Each group has a footer row with subtotal duration and cost (per currency).
- **Summary card:** appears below the table once data is loaded. Lists each project's duration and cost, then a grand total per currency.
- **Edit:** inline pencil button opens `TrackEditDialog`. On save, the list auto-refreshes.
- **Export:** CSV and PDF buttons appear only when at least one track is loaded.
  - PDF is landscape, includes group headers, subtotals, and a Summary section.
  - CSV is UTF-8 BOM, double-quoted fields.
- **Loading state:** Apply button shows spinner; table shows PrimeReact loading overlay.
- **Error state:** red text message replaces the table on API failure.

---

## 7. Tests

### Unit tests (Vitest + Testing Library)

**`TracksList.test.jsx`** — 9 cases:
- Heading renders for admin.
- Access Denied for `client` role.
- Admin sees Client/User/Project filter labels.
- Developer does not see filter labels.
- Apply button is present.
- After Apply: project group header and CSV/PDF buttons appear.
- After Apply: track task names rendered.
- Empty state message when API returns `[]`.
- Error message when API returns 500.
- Developer sees own tracks.

**`tracksService.test.js`** — 6 cases:
- Admin without `idUser` calls `/tracks/user/all`.
- Admin with `idUser` calls `/tracks/user/:id`.
- Developer calls `/tracks/user/current`.
- `idClient` and `idProject` are forwarded in request body.
- `exportCsv` calls `/tracks/export/csv` and returns a Blob.
- `exportCsv` sends date params in body.

### E2E tests (Playwright)

**`tracksList.spec.js`** — 11 cases:
- Heading visible after session inject.
- Apply button present.
- Admin sees Client/User/Project filters.
- Developer does not see those filters.
- Client sees Access Denied.
- Admin Apply → track rows and project group header visible.
- Admin Apply → CSV and PDF buttons visible.
- Developer Apply → own tracks visible.
- Summary section visible after data loads.
- Edit pencil opens the dialog.

### Backend tests (PHPUnit)

**`TracksControllerTest.php`** — 13 cases across 3 groups:

*`POST /tracks/user/all`:*
- 401 without auth.
- 401 for developer (pm middleware).
- 422 when dates missing.
- 200 + JSON structure for admin.
- 200 for pm.
- Filters by `idUser` and returns only that user's tracks.

*`POST /tracks/user/current`:*
- 401 without auth.
- Returns only the authenticated user's own tracks.

*`PUT /tracks/update`:*
- 401 without auth.
- 401 for developer.
- 422 when required fields missing.
- 200 + response structure for admin.

*`POST /tracks/export/csv`:*
- 401 without auth.
- 422 when dates missing.
- Admin response includes `User` column.
- Developer response excludes `User` column from header.
- Response includes data rows for a matching date range.
- Only header row when no tracks exist in range.

---

## 8. Dependencies Added

| Package | Service | Purpose |
|---------|---------|---------|
| `jspdf` | app-react | PDF generation |
| `jspdf-autotable` | app-react | Table layout inside PDF |
