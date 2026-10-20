FAKHR LOCAL SECURITY BACKPORTS — NOT AN UPSTREAM RELEASE

Approved scope: node-forge 1.4.0 and image-size 1.2.1 only.
No changes to Expo, React Native, Metro, package versions, application UI or authentication.

node-forge/lib/rsa.js
Source: https://github.com/digitalbazaar/forge/pull/1152/files
PR remains unmerged as reviewed on 2026-10-17. This is a locally reviewed backport, not a maintainer-approved release. Retain the existing outer DigestInfo validation; additionally require nested DigestAlgorithm to contain exactly OID plus optional NULL. Preserve valid SHA1/SHA256/SHA384/SHA512 signatures and Expo certificate/CSR signing APIs. Tests use ephemeral synthetic keys only.
Advisory: GHSA-86w9-cpqp-85rv.

image-size/dist/types/{utils,jxl,heif,icns}.js
Upstream security source: https://codeberg.org/image-size/image-size/commit/e6e83a5578961de81f6d5834d90fb7430d8f29a5
Advisories: GHSA-5p2g-fcmc-qvqq and GHSA-w3rx-r6r6-pgpr; published fix is in 2.0.3.
Backport only parser guards into the current 1.x compiled files. Preserve its callable CommonJS default export required by Metro and its current result types. Skip undersized boxes before matching names, enforce complete box headers and JXLP/ISPE minimum sizes, and reject short/zero ICNS entries. The 1.x ICNS parser parses the first entry separately; place the guard in shared readImageHeader so the first and later entries are protected. Do not transplant 2.x HEIF multi-image logic or API changes.

Installation and verification
npm ci executes the root postinstall script. It verifies exact package versions, original SHA-256 values, and replacement-file SHA-256 values before writing any dependency files. It is idempotent and aborts on unknown bytes. Run node security-backports/apply.cjs --verify to check without writing. Do not build with lifecycle scripts disabled unless this explicit verify succeeds. No install-time network calls, links, junctions, overrides, or audit suppression are introduced by the patcher.
The Linux validation runner includes the focused tests; no workflow has been executed for this candidate yet.

Audit caveat
Versions intentionally remain 1.4.0 and 1.2.1. npm audit cannot inspect local backported bytes and may continue reporting these three advisories and their parents. Do not hide them or claim an upstream patched version. Track mitigation by manifest hashes and regression tests until an official compatible release supersedes these patches.

Limitations
Local Expo/Metro and synthetic signing tests do not replace a real iOS/archive/OTA validation. No production signing keys or credentials are used. Separate Linux and real-device validation is required before release.
