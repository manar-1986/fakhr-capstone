# General Ask Fakhr deployment candidate — 2026-10-21

Status: LOCAL CANDIDATE, NOT APPROVED FOR DEPLOYMENT. Base v2: 8c81aeca87e0e3015eaa703ec3f6f6f4426816bf.
Branch: codex/fakhr-general-ai-integration-20261021. The final v2 handoff remains unchanged.

## Delivered connection
The existing /plan/ask layout now supports an authenticated general-question path using sendHelpMessage -> POST /api/ai/ask. EXPO_PUBLIC_FAKHR_AI_ACCESS remains off by default. The existing backend authenticate -> aiActivation -> quotas -> controller -> validated transport remains the only live path. No new AI service or model was added.

Classification occurs locally; only a fixed general topic prompt and locale cross the API boundary. Typed narrative, child ID/profile, notes and conversation history are never included. Unknown questions receive a local privacy explanation without a request. This is general topic guidance, not unrestricted conversational understanding or personalized planning. The seven existing questions and original mock handlers remain. Preview mode never uses the general API. Replies arriving after child change, navigation blur or unmount are discarded. Errors are sanitized; no automatic retry or mocked-success fallback.

The general API accepts authenticated users independently of selecting a child. The existing child selector remains display-only context for this path. Personalized Smart Plan remains mock-only and /api/plan-ai remains blocked. Design/style declarations are unchanged.

## Mandatory source blocker
The unmodified ai.witness.ts computes cursor timeoutMS from performance.now(), producing a fractional value. With locked mongoose 9.7.2 / mongodb 7.2.0 and isolated MongoDB 7.0.14, the driver sends a fractional maxTimeMS and MongoDB rejects it: maxTimeMS has non-integral value. Budget/witness initialization tests fail before any provider dispatch. All six safeguard SHA-256 hashes still match docs/reconciliation/ai-safeguard-verification.json.

A narrowly reviewed integer deadline correction in the protected witness module, followed by full budget/witness regression tests, needs explicit approval under the byte-for-byte preservation requirement. No workaround, dependency downgrade, clock override, or weakened test was introduced. Atlas 8 runtime behavior has not been tested and must not be assumed to resolve this.

Two stale test fixtures were corrected: activation now mocks consumeAIQuotas rather than the obsolete consumeAuthLimit; the authenticated quota test supplies its own synthetic signing key and checks stored counter IDs are hashed. Runtime quota code is unchanged.

## Deployment contract (not executed)
Existing Render service: srv-daa1g41srm7s73dkun10. Current linked repository: farooq023/fakhrCapstone main. Current live source: 9a7f0dd5a849a3256bfd9ca6a2379031d4581fd8. This integration checkout is a monorepo, so do not use Deploy latest commit against the unrelated live branch. An explicitly approved source publication/promotion and exact commit selection is required. If deploying this monorepo, root directory is fakhr-capstone-Backend; if promoting a backend-only tree, verify that tree against this candidate.
Node >=22; npm ci; npm run build; npm run start:prod. No migrations, seeds or budget initialization in the deployment/start command. Production database policy disables automatic collection/index creation.
FAKHR_AI_ENABLED=false, FAKHR_AI_ACCESS=off, FAKHR_RELEASE_PROFILE=minimum-plan, SEED_CARE_PATH=false. Keep JWT_SECRET unchanged. MONGODB_URI must explicitly identify the existing primary DB with TLS. Preserve reviewed dashboard/daily-care switches, not inferred defaults. Exact HTTPS frontend origins must be configured for browser access; native requests still require authentication.

TRUSTED_PROXY_CIDRS is mandatory for NODE_ENV=production with RENDER=true. Obtain authoritative ingress proxy CIDRs; Atlas outbound allowlist CIDRs are not substitutes. No verified ingress ranges are available in this candidate. Missing/invalid values intentionally block startup.

## Database requirements and pending read-only checks
- Primary ai_budget_ledgers: default unique _id index; runtime find/update; explicitly approved initialization also needs insert. No delete or reset. Check existence and existing state before initialization.
- Primary authlimits: default unique _id; expiresAt ascending TTL expireAfterSeconds=0; runtime find/insert/update (quota upserts). TTL cleanup is not authorization. Preserve authentication collections and their existing required indexes, including revokedtokens TTL.
- Witness fakhr_ai_witness.ai_budget_witness: verified empty ordinary collection with only unique _id. Runtime effective privileges must be exactly find and insert on that namespace. No createCollection/createIndex/update/delete; independent Mongo authority. Majority/journaled writes are required for future initialization, not run here.
- Saved Render secrets are not in the old running instance. Production runtime authentication, effective privileges, primary metadata and signing-configuration checks remain unverified. No production records or secret values were read for this preparation.
- Any primary collection/index/permission change requires separate approval and a recovery plan. Existing production backup was postponed; do not silently proceed with migrations or grants.

## Activation gates after a safe disabled deployment
Verify disabled flags and model metadata using an explicitly authorized server-side check. Existing scripts/check-ai-model.cjs is deliberately non-production scoped; do not falsely label production as non-production to bypass its gate. Production metadata checking needs a separately reviewed invocation. Confirm model availability and tariff against fixed policy assumptions before any paid request. Then separately approve signed ledger initialization only on a verified empty ledger/witness pair. It writes witness first, primary second; partial failure must stop, never blindly retry/delete/reset.
Only after these pass: separately approve a bounded paid test, frontend pilot build and backend pilot activation. This pilot gate applies to authenticated accounts generally, not an account allowlist; public pilot exposure needs an explicit rollout decision. No child-specific AI activation.

## Rollback
Before deployment verify the retained artifact for dep-danpfp0jo6nc739ndalg. Render Dashboard rollback restores its build and runtime environment, but not DB data or saved dashboard settings, and disables auto-deploys. It would also remove the new safety flags from that runtime because they were absent in the old deploy; this restores the old application, not a verified AI safety configuration. Recheck availability/authentication and keep AI launch halted. Do not initialize a ledger or run migrations as part of deployment, so rollback has no budget/data reversal. A rollback to older code cannot undo external API spend.

## Validation
See AI-CANDIDATE-VALIDATION.json for local results. No deployment approval should be requested until the witness defect and production configuration blockers are resolved. No paid inference, deployment, push, production write or budget initialization has occurred.
