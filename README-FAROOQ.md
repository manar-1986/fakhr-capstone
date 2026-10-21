# Fakhr final v2 developer handoff — updated 21 October 2026

GitHub handoff branch: handoff/fakhr-final-v2 in manar-1986/fakhr-capstone.
Includes approved v2 source 8c81aeca87e0e3015eaa703ec3f6f6f4426816bf and validated general-AI integration through 232478ffeb30cb6bf9caccde34f13c48c3ddf9be.

The approved frontend, backend, assets, My Plan, Daily Companion, meals, directory and navigation are retained. General Ask Fakhr now has an authenticated API connection gated off by default; it sends fixed educational topic prompts and locale, not typed narratives, child data or history. This is not unrestricted chat. Personalized Plan AI remains mock-only.

Keep FAKHR_AI_ENABLED=false, FAKHR_AI_ACCESS=off and EXPO_PUBLIC_FAKHR_AI_ACCESS=off. No live activation or deployment is authorized by this handoff. The only approved runtime safeguard correction is integer rounding of the witness cursor timeout. The $20 UTC-month ceiling, $0.01 reservation, quotas and signed witness protections are preserved.

Latest validation: backend build passed; 37 budget/witness tests and 99 focused regressions passed, zero failures or skips. See docs/AI-CANDIDATE-VALIDATION.json and docs/MONTHLY-SECURITY-TEST-RESOLUTIONS.md. Earlier root readiness/manifests describe the historical v2 snapshot, not the newer AI integration.

Remaining release gates: authoritative Render ingress trust configuration (support inquiry pending), source promotion approval, saved environment application, witness runtime authentication/privilege verification, model metadata/access and tariff verification, production backup/recovery approval as required, empty primary ledger collection creation and separately approved signed initialization. Read-only preflight found primary ai_budget_ledgers absent; authlimits and its TTL index exist. No production mutations were made. See docs/AI-DEPLOYMENT-CANDIDATE.md for deployment and rollback constraints. Do not deploy this handoff branch automatically.

## Start here

Use Node 24 LTS and npm. In **each** project run `npm ci --no-audit --no-fund`.
Do not remove the frontend `vendor/` archive or `security-backports/`:
the lockfile and postinstall require them. Do not upgrade dependencies during setup.

Frontend (`fakhr-Capstone-Frontend`):

```sh
npx tsc --noEmit
npm run web -- --port 8115
```

For isolated visual review set both `EXPO_PUBLIC_SMART_PLAN_PREVIEW=true` and
`EXPO_PUBLIC_SMART_PLAN_FIXTURES=true` before starting
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
Version 1 preserved application behavior. Version 2 closes archived preview routes in production, repairs the existing professionals search, and marks unsupported legacy actions disabled. The v2 baseline retained validated AI modules; the later explicitly approved witness integer-timeout correction is documented above.

For local authenticated daily-care testing also set EXPO_PUBLIC_DAILY_CARE_ENABLED=true
in the frontend, alongside FAKHR_DAILY_CARE_ENABLED=true in the local backend.
Keep both preview flags false for authenticated testing. Never test a real account
against the isolated fixture preview. The production restaurant catalog is empty
until verified, licensed records are approved; the three supplied meals remain
local preview records.
