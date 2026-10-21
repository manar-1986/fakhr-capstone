# General educational AI: local integration preparation

Base: 8c81aeca87e0e3015eaa703ec3f6f6f4426816bf. No live activation or provisioning has been performed.

## Remaining operator setup

1. Identify and authorize an existing non-production backend, primary database and independent witness host. None is confirmed by this checkout. Do not reuse production credentials or production records. A local disposable environment is suitable for synthetic tests, but is not evidence of a provisioned persistent witness.
2. Use that server's secret manager to set FAKHR_AI_OPENAI_API_KEY from the intended OpenAI API project. Never place it in frontend EXPO_PUBLIC variables, committed files, commands, chat or logs. OPENAI_API_KEY is not used by the validated transport.
3. Configure MONGODB_URI for the authorized test database; retain its existing secure JWT_SECRET and authentication setup. Set FAKHR_AI_ENABLED=false and FAKHR_AI_ACCESS=off throughout preparation.
4. Securely provision FAKHR_AI_LEDGER_ANCHOR (64 hexadecimal characters), FAKHR_AI_LEDGER_SIGNING_KEY (64 hexadecimal characters), and a different FAKHR_AI_WITNESS_SIGNING_KEY (64 hexadecimal characters). Preserve them across restarts. Do not regenerate these values to reset expenditure.
5. Configure FAKHR_AI_WITNESS_URI with an explicit witness database. Its MongoDB authority must differ from MONGODB_URI. There is no FAKHR_AI_WITNESS_DB variable. The witness runtime identity must have exactly find and insert permissions on that database's ai_budget_witness collection, with no additional privileges. Provision collections and permissions separately through an authorized operator; never grant runtime role-management privileges. The primary identity needs the reviewed read/update access to ai_budget_ledgers and authlimits; index setup must be reviewed separately. Preserve authlimits TTL cleanup and unique _id indexes. Do not give witness credentials update/delete permission.
6. After authorization of the environment, set FAKHR_AI_ENVIRONMENT=authorized-nonproduction for the metadata helper. From the backend directory run `node scripts/check-ai-model.cjs` with secrets injected by the server secret manager. It issues only GET /v1/models/gpt-6-luna, rejects redirects and prints a fixed status. Successful metadata access does not prove inference works or billing is configured. No Responses API call is made.
7. With explicit approval for non-production database writes, build using `npm run build`. On an empty reviewed ledger/witness pair only, set FAKHR_AI_PROVISION_APPROVED=monthly-USD20 in the operator environment and run `node dist/scripts/provisionAiBudget.js --initialize-empty-budget`. Keep AI disabled. Remove the provisioning approval variable afterward. Existing or inconsistent ledgers must be inspected/recovered, never reinitialized. This writes the witness and primary ledger and has NOT been executed.
8. Separately approve a bounded paid smoke test before temporarily enabling FAKHR_AI_ENABLED=true and FAKHR_AI_ACCESS=pilot on the non-production server. Restore false/off after testing. All existing authentication, quota, budget, witness and output checks remain in force.

## Smallest integration: reuse the existing route

Use authenticated POST /api/ai/ask with the existing session handling and a reviewed general topic. Example request (no child data):

```json
{"question":"Suggest general educational activities","schoolContext":{"category":"general","topic":"activities","language":"en"},"locale":"en"}
```

Arabic equivalent:

```json
{"question":"اقتراح نشاط تعليمي عام","schoolContext":{"category":"general","topic":"activities","language":"ar"},"locale":"ar"}
```

Existing flow: frontend sendHelpMessage -> /api/ai/ask -> authentication/aiActivation -> askFakhrAI -> runBudgetedAI -> reviewed buildAIRequest. No duplicate service is needed. Only reviewed topic constants and locale reach OpenAI. Supported general topics: development, activities, plans, products, sessions, parenting. Do not attach child ID, names, notes, diagnoses, medication, previous messages or a plan object. Keep initial testing to fixed topic questions rather than collecting free-text personal narratives.

The My Plan chat now includes a separately gated general-topic API path; see AI-DEPLOYMENT-CANDIDATE.md. The isolated preview remains mock-only. No real provider response has been tested. Personalized /api/plan-ai remains blocked. General weekly examples are not personalized proposals or saved care plans.

## Local verification

`node --test scripts/check-ai-model.test.cjs` uses only synthetic mocked HTTP responses. `npm run build` compiles the backend. Six safeguard hashes must continue matching docs/reconciliation/ai-safeguard-verification.json. No inference, database provisioning or production connections are part of these checks.

The provisioning launcher approval token was corrected from the obsolete 12-attempt/$0.25 wording to monthly-USD20. None of the six validated modules changed. This branch is preparation only; the v2 ZIP/manifest and remote handoff branch remain unchanged.
