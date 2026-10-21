# Approved witness integer timeout correction

Date: 2026-10-21. Local only. Parent candidate: 76e5de8e7be845e1eee26fe8c855925bdba2c87e.

## Exact change
Only the cursor timeout expression in ai.witness.ts changed:

Before: timeoutMS:Math.max(1,WITNESS_LIMITS.timeoutMs-(performance.now()-started))
After: timeoutMS:Math.max(1,Math.floor(WITNESS_LIMITS.timeoutMs-(performance.now()-started)))

Math.floor makes the remaining duration integral rather than passing fractional milliseconds to the MongoDB driver's server-side maxTimeMS. It rounds down, retains the existing minimum 1ms, and does not increase the configured 5000ms deadline. The existing abort controller, deadline checks, cursor cleanup, limits, signature/chain checks, exact privilege check, independent-host requirement and write concerns are unchanged.

The other five validated modules are byte-identical to their original hashes. The original safeguard manifest is retained as historical evidence; witness now has the expressly approved change.
Original witness SHA-256: 2f1f7d38ea60caaaf6e223efcaa2b2bd3df466453309b0543f7466cadfc42750
Corrected witness SHA-256: 6b878d850433e058dd20b0cee8bce00465762ddb271d269e6d7f271a9dd8c724

## Tests
Backend TypeScript build PASS. All 36 aiPortableBudget tests rerun against disposable local MongoDB with mocked OpenAI: 31 PASS / 5 FAIL. Related regression suites: 95 PASS. Total: 126 PASS / 5 FAIL, 7 suites. The fractional maxTimeMS error no longer occurs.

Remaining five failures (assertions left unchanged):
1. Provider request expectation still says gpt-5-mini; validated request uses gpt-6-luna.
2. Old test expects request 13 to be denied after 12 reservations, with a $0.25 ceiling; current policy is $20 per UTC month with $0.01 reservations.
3. Recovery test expects two entries in primary attempts; current primary ledger retains the latest attempt while witness holds signed revisions.
4. Old failed/recovered-request test expects 12 total provider attempts rather than monthly accounting.
5. Cost test expects conservative reserved amount to equal calculated maximum cost; configured calculation is 6000 micros versus reservation 10000 micros.

These are stale-policy assertions exposed after initialization became executable. They are not a passing monthly-budget validation. Do not change runtime policy to satisfy them. Reconcile tests to the approved policy with explicit independent ceiling, rollover, no-refund and witness-history assertions before release. This turn did not change tests or any other runtime file.

## Remaining mandatory gates
Deployment remains blocked pending complete passing monthly-policy security tests, authoritative trusted ingress proxy CIDRs, runtime database/primary-index permissions and configuration validation, exact source promotion to Render, and verified rollback artifact availability. Model metadata/current tariff checks, separately approved signed initialization and paid smoke test are activation gates. All runtime safety flags remain unchanged/off; test-process flags used only synthetic local storage and mocked dispatch. No production writes, deployments, push, budget initialization against existing infrastructure or paid API calls.
