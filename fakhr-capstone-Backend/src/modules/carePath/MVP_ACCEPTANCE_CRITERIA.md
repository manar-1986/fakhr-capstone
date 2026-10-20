# Care Path — MVP Acceptance Criteria Checklist

| # | Criterion | Status | Implementation |
|---|-----------|--------|----------------|
| 1 | **Parent can generate care path for a child (only owner)** | ✅ | `ensureChildOwnership(userId, childId)` in `generateCarePath` — `Child.findOne({ _id: childId, parentId: userId })`; routes use `authenticate` middleware. |
| 2 | **System prevents multiple active care paths for same child** | ✅ | `generateCarePath`: before creating, `CarePath.findOne({ childId, status: "active" })`; if exists, returns existing care path + tasks instead of creating duplicate. |
| 3 | **Tasks are created from template tasks** | ✅ | `generateCarePath`: `(template.tasks || []).map(...)` builds task docs (week, title, description, instructions, expectedOutcome, category, difficulty, frequency, status, dueDate); `Task.insertMany(tasksToInsert)`. |
| 4 | **Parent can view current care path + tasks** | ✅ | `getCurrentCarePath`: after ownership check, `CarePath.findOne({ childId, status: "active" }).populate("templateId")` and `Task.find({ carePathId })`; returns `{ carePath, tasks }` or `{ carePath: null, tasks: [] }`. |
| 5 | **Parent can mark task complete** | ✅ | `completeTask`: `ensureTaskOwnership(userId, taskId)`; then `task.status = "completed"`, `task.completedAt = new Date()`, `task.save()`. If no pending tasks left, care path set to `"completed"`. |
| 6 | **Parent can skip a task** | ✅ | `skipTask`: same ownership; `task.status = "skipped"`, `task.completedAt`, save; care path auto-completed when no pending tasks. |
| 7 | **Parent can submit weekly check-in feedback** | ✅ | `createCheckin`: `ensureChildOwnership(userId, childId)`; resolve active care path; `CarePathCheckin.create({ carePathId, difficulty, engagement, note, answers })`. |
| 8 | **Ownership enforced (parent cannot access others)** | ✅ | **Generate/Get current/Check-in:** `ensureChildOwnership` — child must have `parentId === userId`. **Complete/Skip:** `ensureTaskOwnership` — task → care path → child; child must have `parentId === userId`. All routes use `authenticate`. |

## Routes (all under `/api`, auth required)

- `POST /api/care-paths/generate` — body: `{ childId, templateId? }`
- `GET /api/care-paths/current?childId=...`
- `POST /api/care-path-tasks/:id/complete` — body: `{ note? }`
- `POST /api/care-path-tasks/:id/skip` — body: `{ note? }`
- `POST /api/care-paths/checkin` — body: `{ childId, difficulty?, engagement?, note?, answers? }`
