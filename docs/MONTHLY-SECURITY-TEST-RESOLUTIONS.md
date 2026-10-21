# Monthly security test reconciliation — 2026-10-21

Scope: test assertions and evidence only. No production configuration or runtime AI modules changed. The previously approved integer timeout correction remains unchanged.

## Five resolved failures

1. Request model: stale assertion expected gpt-5-mini; validated request builder sends gpt-6-luna. Expected model corrected. store:false, output cap, timeout, abort signal and no-retry checks retained. This proves configured behavior, not current model access or pricing.
2. Spending cap: stale test expected 12 attempts at $0.02 and a $0.25 ceiling; approved implementation reserves $0.01 against $20 per UTC month. Test now starts from a synthetic signed $19.98 checkpoint, permits two reservations and rejects the next before dispatch. Both primary and witness signatures remain unchanged on denial.
3. Partial-write recovery: stale assertion expected two attempts in the primary snapshot; actual primary retains one current attempt, while signed witness revisions preserve history. Test now verifies the current completed attempt, cumulative $0.02 charge, historical forfeited token, and primary/witness signature equality.
4. Failed-attempt cap: stale test expected exhaustion after 12 failed/recovered calls and 12 entries in the primary snapshot; monthly implementation continues charging $0.01 and keeps history in the witness. From a synthetic signed $19.98 checkpoint, two failures plus recovery reach $20 without refunds. The next request is denied before dispatch; both forfeited tokens remain in witness history.
5. Cost envelope: stale assertion expected calculated maximum cost to equal the reservation. Configured rates produce 6,000 micros ($0.006), while the conservative reservation is 10,000 micros ($0.01). Test asserts both exact values and cost <= reservation. Oversized-input rejection remains.

These are outdated assertions, not implementation defects under the validated monthly specification. No security behavior was changed or weakened. No tests were deleted or skipped.

## Additional regression coverage

- UTC month crossover preserves prior-month spend and charges completion in the new month; backwards server time fails closed.
- Exact per-account quotas: 3 per 15 minutes, 10 per day, 100 per month.
- Each quota permits its final allowed attempt and denies the next using the actual Mongo counter pipeline; a different synthetic account remains isolated.
- Existing tampering, missing ledger, witness independence/privilege, concurrency, recovery and fail-closed cases remain active.

Near-cap fixtures use a disposable local MongoDB replica set and synthetic signing material. They append a real signed witness revision; subsequent reservations, dispatch gating, recovery and signature verification run through production code. No production database is contacted. All provider calls are mocked.

## Validation

Backend: npm run build — PASS.

Command (NODE_ENV=test and a synthetic local JWT secret supplied):
npx --no-install jest --runInBand --silent --config jest.integration.config.js aiPortableBudget aiActivation aiBudgetAdapter planAIMock productionConfiguration compiledStartup

- Budget/witness: 37 PASS, 0 FAIL.
- Focused regressions: 99 PASS, 0 FAIL.
- Total: 7 suites, 136 PASS, 0 FAIL, 0 skipped.
- Non-failing ts-jest configuration and Mongoose deprecation warnings remain.
- All six runtime safeguard files match the approved post-timeout-fix state. Hashes recorded in AI-CANDIDATE-VALIDATION.json.

## Remaining mandatory gates

Before disabled deployment: verify authoritative ingress TRUSTED_PROXY_CIDRS, exact source promotion/Render root/build settings, required production database metadata and effective permissions, approved frontend origins, saved configuration application, and retained rollback artifact. Outbound Atlas CIDRs are not ingress proxy ranges. Any required database mutation needs separate approval and recovery readiness; the production backup remains postponed.

Before activation: verify runtime disabled flags and connections, model access/current tariff compatibility, separately approve ledger initialization and a bounded paid test, and decide authenticated pilot exposure. Keep FAKHR_AI_ENABLED=false, FAKHR_AI_ACCESS=off and frontend AI access off. Personalized child-context AI remains blocked.

No push, deployment, paid call, production write, permission change or production budget initialization was performed.
