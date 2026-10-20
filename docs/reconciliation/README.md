# Integrated local Fakhr candidate — 20 October 2026

Baseline: `dca65a2f27ad8e198cc84d1cd17f30ff1cd39f43`, from `codex/home-glass-experiment`.
Integration branch: `codex/fakhr-integrated-20261020`.
Canonical projects: `fakhr-Capstone-Frontend` and `fakhr-capstone-Backend`.
The misspelled `fakhr-Capstone-Fronend` is a legacy dependency/cache directory, not the application.

## Reconciliation

Source was backed up before integration. The original standalone candidate and dirty repository remain unchanged. All comparisons used the baseline plus both working copies; no remote was accessed.
`file-decisions.json` records 944 source comparisons, including 22 explicitly reviewed conflict files, 60 clean/newline-aware merges, and the professional-model union. Other repository work was retained. Candidate UI, chat, restaurant assets, Daily Companion, approved activity and Plan routes are included.

The professional model retains bilingual repository fields, the unique index and a Mongoose 9-compatible save hook. Cross-project test imports and Jest lookup now use the canonical folders. Metro no longer requires a hardcoded developer dependency directory. Six validated AI files are pinned byte-for-byte with `.gitattributes`; hashes are in `ai-safeguard-verification.json`.

Dependencies, Expo/Jest caches, generated builds, secrets and test databases are excluded from the Git tip. The vendored security dependency archive is intentionally included because the lockfile requires it. Historical baseline commits still contain formerly tracked dependencies; history was not rewritten. Legacy seed utilities remain preserved but are not called by startup or package scripts: do not run them against real data.

## Reproduce locally

Use Node 22 and npm. In each canonical project run `npm ci`. No versions were upgraded. The frontend postinstall applies five checksum-verified dependency backports. This reconciliation installed with `--ignore-scripts`, then ran `node security-backports/apply.cjs` explicitly.

Frontend isolated preview: from `fakhr-Capstone-Frontend`, run `powershell -File scripts/start-isolated-preview.ps1 -Port 8116`.
Open `http://localhost:8116/plan` or `http://localhost:8116/plan/ask?childId=synthetic-child-a&date=2026-10-20`.
These are explicit development fixtures with API transport blocked, not an authenticated production session.

TypeScript: `node node_modules/typescript/bin/tsc --noEmit` in both projects.
Backend local startup smoke: `npm run build`, set `MONGOMS_SYSTEM_BINARY` to your local MongoDB 8.0.34 executable and `MONGOMS_RUNTIME_DOWNLOAD=false`, then `node scripts/reconciliation-smoke.cjs`. It creates a disposable local replica set, strips inherited credentials, starts the compiled app on 8126, checks health/auth guards and shuts down. Do not point this at a real database.

Plan and Companion persistence tests: use that local binary and a synthetic test JWT secret, then run Jest with `jest.smart-plan.config.js` and `jest.companion.config.js`. Configuration tests use `jest.deployment.config.js` with only `productionConfiguration.test.ts`. No-network AI checks use `jest.reconciliation-ai.config.js`. Do not use the broad default backend test command against configured services.

## Verification and remaining gates

See `validation.json`: frontend/backend TypeScript passed, 167 frontend tests and 99 backend tests passed. API-blocked Metro compiled actual route components; local backend startup and route guards passed. This is not a fresh browser click-through or native-device validation.

No unresolved merge markers or missing statically imported assets remain. Before staging: approve a separate test API/database, provide environment configuration securely, validate authenticated end-to-end journeys and minimum-release feature gates, review legacy scripts, and rerun the broader native/release suites. The preserved frontend production URL policy remains unchanged and requires a separately approved staging configuration decision. Do not use a production build for local preview.

Live personalized AI remains blocked. The monthly budget, quotas, witness and privacy safeguards are unchanged. No OpenAI calls, Render access, production MongoDB access, deployment or push occurred.
