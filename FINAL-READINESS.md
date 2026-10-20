# Farooq final source readiness — version 2

Parent: 3ed65da74831ec4c3b1d03413f54dcec30516aba.

- PASS: fresh npm ci in both projects; frontend and backend TypeScript; web export.
- PASS: 327 frontend tests / 44 suites; 189 backend tests; 23 dependency-security checks.
- PASS: isolated compiled backend startup and authentication guards; ten local frontend routes.
- PASS: Arabic/English component and navigation tests, child ownership and session revocation tests.
- PASS: 45 legacy API operations plus 20 newer Plan/Daily Care route contracts. Disabled legacy features retain explicit gates.
- PASS: 164 release HTML files have no identified visible synthetic child/sample restaurant content; explicit development-only gates tested.
- PASS: all six validated AI safeguard files match their approved hashes.
- FAIL: no outstanding failure in the scoped final checks.
- BLOCKED: live backend integration, approved activity/restaurant catalog, database readiness, proxy configuration, privacy-approved live AI, native/store certification.

## Actual corrections

Archived Plan/Explore previews cannot render in production. The old professionals search is connected to its existing query. Unsupported legacy actions are explicitly disabled. Normal approved screens and brand tokens were not redesigned. Backend runtime and AI modules are unchanged.

## Verification limits

403 primitive controls were checked for action handlers or explicit disabled states, supplemented by navigation/chat/search tests. This does not claim every control was manually tapped on a physical device. HTTP checks establish local route delivery; test suites establish covered interactions. No real account, production database, external ordering availability, paid AI or mobile-store workflow was exercised. The full historical test suite was not run.

## Reproduce

Follow README-FAROOQ.md and the environment templates. FINAL-READINESS.json names all frontend suites. Backend test groups are completeCompatibility, mountedOperations, minimumIntegration and readinessRoutes with jest.integration.config.js; smartPlan, companion, suggestions and dailyCare with their matching local configs; productionConfiguration with jest.deployment.config.js; mock AI with jest.reconciliation-ai.config.js. Use only disposable local MongoDB with MONGOMS_SYSTEM_BINARY and downloads disabled, plus a synthetic JWT secret. Never point tests at Atlas.

Known nonfatal warnings: legacy favorites/messages layout names and dependency/test-tool deprecations. Review these before native release. Production restaurant records are intentionally empty and personalized AI is disabled; previews are not production readiness.
