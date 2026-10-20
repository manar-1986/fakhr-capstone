# Fakhr developer handoff — 20 October 2026

Source: `codex/fakhr-integrated-20261020` at
`8b5e8aaf58bf9e1e7ff6094e511a2188dc7d3a0d`.
This handoff preserves the application source and adds handoff instructions plus a safe
environment-template correction (`FAKHR_AI_ACCESS=off`). See VALIDATION-HANDOFF.json
for checks actually run on this copy. Existing reconciliation reports are historical.

## Start here

Use Node 24 LTS and npm. In **each** project run `npm ci --no-audit --no-fund`.
Do not remove the frontend `vendor/` archive or `security-backports/`:
the lockfile and postinstall require them. Do not upgrade dependencies during setup.

Frontend (`fakhr-Capstone-Frontend`):

```sh
npx tsc --noEmit
npm run web -- --port 8115
```

For isolated visual review set `EXPO_PUBLIC_SMART_PLAN_PREVIEW=true` before starting
Metro. It deliberately blocks API transport. Preview examples:
`/plan?childId=synthetic-child-a&date=2026-10-20`,
`/plan/ask?childId=synthetic-child-a&date=2026-10-20`.
Never use synthetic IDs for real accounts.

Backend (`fakhr-capstone-Backend`):

```sh
npm run build
npm run start:prod
```

Before startup, create your own ignored local `.env` from `.env.example`; supply
only local development database/JWT settings. Plan writes require a replica set.
Use no existing production credentials for initial validation. For local
authenticated testing enable the dashboard/daily-care flags, disable frontend
preview mode, set `EXPO_PUBLIC_API_STRICT=1`, and select the local API URL.
Set `EXPO_PUBLIC_FAKHR_RELEASE_PROFILE=minimum-plan` to expose the Plan routes.

The frontend production build is pinned to the existing Render API. Do not
distribute a production build as an isolated preview. No deploy, backup, live AI,
database migration or remote push is authorized by this package.

Read `HANDOFF-FAROOQ.md` for feature boundaries, APIs, storage and deployment gates.
Do not run legacy seed/import scripts or the broad backend test suite against an
environment containing real service credentials.

Handoff fixes: enforce LF for the five checksum-protected dependency patch files;
update three stale frontend tests for the approved palette and explicit legacy
navigation isolation. Real minimum-release gate tests remain enabled and pass.
No application behavior or validated AI module was changed.
