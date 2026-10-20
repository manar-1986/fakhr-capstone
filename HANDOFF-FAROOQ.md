# Fakhr integration and release handoff

## Preserved functionality

- My Plan: child/date selection, progress, next activity and instructions,
  meals, appointments, suggestions and the two AI entry points.
- Ask Fakhr: seven existing question/response paths, free-text mock chat,
  child selection, Back and Smart Plan navigation.
- Smart Plan: mock proposals, alternatives/adjustments, parent review and approval.
- Daily Companion: chronological tasks/meals/appointments/parent tasks,
  in-screen reminders, quiet hours, snooze, participation and meal feedback.
- Restaurant preview, results, details and meal feedback screens; supplied local
  food assets, search/filter/favorite behavior, verification-gated external links.
- Professionals, centers, schools, Home entry points and RTL/LTR navigation.
- Approved Fakhr palette/layout preserved. No visual redesign in this handoff.

Key frontend implementations are `components/plan/SmartPlanDashboard.tsx`,
`MockPlanChat.tsx`, `MockPlanAI.tsx`, `DailyCompanion.tsx`,
`RestaurantScreens.tsx`, `FakhrSuggestions.tsx`, and
`app/(tabs)/directory/{professionals,centers,schools}.tsx`.
Route wrappers live under `app/(tabs)/plan/`; API adapters are under `api/`.

## Mock and release boundaries

Personalized AI remains MOCK ONLY. Production `/api/plan-ai` is blocked.
No live child context, parent notes or conversations may be dispatched.
Mock approval/save is not a production AI planning integration.
The six validated activation, budget, quotas, requests, transport and witness safeguards
must remain unchanged; exact verification is in docs/reconciliation.
Budget is $20 monthly with quotas, signed ledger/witness and fail-closed behavior.
Do not activate paid AI as part of backend connection work.

The local restaurant dataset/assets are not a live availability, ordering or
provider-booking service. Respect per-record verification and image rights;
do not invent ratings, distances, allergy safety or destinations.
Native/background push notifications and persistent meal-photo uploads are not
claimed. Daily Companion reminders operate while its screen is active.
The approved activity catalog is empty; preview draft content is not authorized
for publication. Actual plan generation needs reviewed bilingual catalog records.

## API map (application.ts and route modules remain authoritative)

- `/api/auth`, `/api/users`, `/api/children`: authentication/profile/child ownership.
- `/api/directory`, `/api/services`, `/api/centers`: directory resources.
- `/api/care-paths`, `/api/care-path-tasks`: template plans, participation/progress.
- `/api/plan-dashboard`: GET daily tasks/meals; POST `/generate`,
  `/add-activity`, `/tasks/:id`, `/meals`; PUT `/meals/:id`.
- `/api/plan-dashboard/suggestions`: GET/PUT saved/dismissed/preferences/feedback.
- `/api/plan-dashboard/companion`: GET/PUT reminder preferences/snoozes.
- `/api/daily-care`: read schedule; appointment/medication and participation routes.
- `/api/calendar-events`: legacy calendar endpoint; minimum profile blocks it.
  New dashboard/Companion appointments use daily-care routes instead.
- `/api/ai/ask`: separately gated Ask Fakhr infrastructure; live access stays off.
- `/api/plan-ai`: authenticated but explicitly blocked.
- Legacy favorites/community/support routes remain in source but are gated in
  the minimum release. Do not mistake source presence for enabled production UI.

## MongoDB requirements — NO migration has been run

Use the existing Atlas host/database only after owner approval. Required owner
keys, revisions, idempotency and transactions must not be bypassed.
Production autoCreate/autoIndex are disabled.

Add to existing `test_db`, after backup/approval:

- `planmeals`: unique `{parentId:1,requestId:1}` and
  `{parentId:1,childId:1,date:1,time:1}`.
- `plansuggestions`: unique `{parentId:1,childId:1,resourceId:1}`.
- `companionpreferences`: unique `{parentId:1,childId:1}`.

Existing requirements (besides MongoDB's `_id` index):
- `authlimits`, `revokedtokens`: TTL `{expiresAt:1}`, expireAfterSeconds 0.
- `carepathtemplates`: unique `{name:1}`, `{targetTags:1}`, `{targetDiagnoses:1}`.
- `carepaths`: `{childId:1,status:1}`.
- `tasks`: `{carePathId:1,week:1}`, `{status:1}`.
- `carepathcheckins`: `{carePathId:1,date:-1}`.
- `calendarevents`: unique `{parentId:1,requestId:1}` and
  `{parentId:1,childId:1,date:1,startTime:1}`.
- `medicationreminders`: unique `{parentId:1,requestId:1}` and
  `{parentId:1,childId:1,date:1}`.
- `medicationactions`: unique `{parentId:1,requestId:1}` and unique
  `{parentId:1,childId:1,reminderId:1,occurrence:1,sequence:1}`.
- `activityparticipations`: unique `{parentId:1,requestId:1}` and
  `{parentId:1,childId:1,createdAt:1}`.
- Existing users/children/centers/professionals/services remain required; preserve
  existing data and inspect their model indexes before any additive change.

The restricted runtime role needs find/insert/update/listIndexes on the three
new collections, preserving its existing scoped privileges. No runtime DDL or
database-wide administrative permissions should be added. Existing Render was
verified using an administrative identity; any least-privilege cutover needs
separate approval and secure credential handling.

## Environment variable names (no secret values supplied)

Backend core: NODE_ENV, PORT, MONGODB_URI, JWT_SECRET, JWT_EXPIRES_IN,
FAKHR_RELEASE_PROFILE, FAKHR_PLAN_DASHBOARD_ENABLED, FAKHR_DAILY_CARE_ENABLED,
FRONTEND_URL, CORS_ALLOWED_ORIGINS, TRUSTED_PROXY_CIDRS, SEED_CARE_PATH.
AI gates: FAKHR_AI_ENABLED, FAKHR_AI_ACCESS.
Future live AI only after separate review: FAKHR_AI_OPENAI_API_KEY,
FAKHR_AI_LEDGER_ANCHOR, FAKHR_AI_LEDGER_SIGNING_KEY,
FAKHR_AI_WITNESS_SIGNING_KEY, FAKHR_AI_WITNESS_URI.
Legacy OPENAI_API_KEY is not authorization for personalized AI.
Optional full-profile mail: EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER,
EMAIL_PASS, EMAIL_FROM.

Frontend: EXPO_PUBLIC_API_URL, EXPO_PUBLIC_API_STRICT,
EXPO_PUBLIC_FAKHR_RELEASE_PROFILE, EXPO_PUBLIC_SMART_PLAN_PREVIEW, EXPO_PUBLIC_SMART_PLAN_FIXTURES, EXPO_PUBLIC_DAILY_CARE_ENABLED,
EXPO_PUBLIC_FAKHR_AI_ACCESS.
Local tests only: MONGOMS_SYSTEM_BINARY, MONGOMS_RUNTIME_DOWNLOAD.
Never embed server secrets in EXPO_PUBLIC variables.

## Render and activation blockers

Existing service: fakhrCapstone, API `https://fakhrcapstone-36gs.onrender.com/api`.
It currently tracks farooq023/fakhrCapstone/main at 9a7f0dd5..., not this candidate.
If deploying this monorepo after approval, root is `fakhr-capstone-Backend`;
use lockfile install `npm ci --include=dev`, build `npm run build`,
start `node dist/app.js`, and verify `/health`.
Reconcile any subsequent remote work before promotion; never force-push.

Before production: verified database backup/recovery; authoritative Render proxy
trust configuration (still unresolved); exact HTTPS browser origins; least-
privilege runtime identity; additive storage; approved activity templates;
authenticated account/child isolation and end-to-end testing on the intended
environment; native/app-store release validation. Do not change JWT_SECRET.
Local HTTP browser origins are rejected by the production origin validator.
Keep AI off. Preserve the validated safeguards byte-for-byte.

## Safe test commands

Frontend: `npx tsc --noEmit`; run scoped Jest suites listed in the validation
receipt, and `npm run test:security-backports`.
Backend: `npm run build`; configuration tests via jest.deployment.config.js
with only productionConfiguration.test.ts; mock tests via
jest.reconciliation-ai.config.js.
Persistence: set a locally installed MongoDB 8.0.34 binary through
MONGOMS_SYSTEM_BINARY, disable runtime downloads, use a synthetic test JWT,
then run jest.smart-plan.config.js and jest.companion.config.js.
`node scripts/reconciliation-smoke.cjs` starts its own disposable local replica
set and strips inherited service secrets. Do not substitute a production URI.

Historical evidence: docs/reconciliation/validation.json. Fresh handoff evidence:
VALIDATION-HANDOFF.json. Neither constitutes production or native certification.

## Remaining local limitations

Expo web export succeeds but emits legacy favorites/messages layout-name warnings.
Dependency and ts-jest/Mongoose deprecation warnings remain; no dependency upgrade
was performed. Native Android/iOS builds and store submission are not certified.
The production backend connection and real account end-to-end flows remain pending.
The source package omits root scratch editing scripts, a stray pager file, the
misspelled duplicate frontend folder containing only an Expo declaration, and old
review screenshots. All application assets and code remain included.

## Final readiness corrections (version 2)

- Archived `/plan/legacy` redirects to the current Plan in release builds, preserving
  selected child/date. Archived demo `/discover` redirects to existing `/resources`.
- Local-care memory preview now requires development mode, even on localhost.
- The older `/professionals` search field now updates its existing API search.
  Unsupported sort and archived demo actions are explicitly disabled.
- Compatibility tests now respect the existing completed-task overwrite prohibition.
  No backend runtime, schema, UI theme, or AI safeguard was modified.
- See FINAL-READINESS.json for fresh tests, endpoint coverage and verification limits.

The current production restaurant list is deliberately empty, not the three preview
meals. Add approved verified records and image rights before promising restaurant
recommendations. Personalized AI remains blocked outside isolated development.
An automated source scan checks 403 primitive controls for missing handlers or
explicit disabled states; it is not exhaustive manual tapping on physical devices.