# Fakhr institution directory

This frontend reference catalog replaces the positional joins between `BILINGUAL_SCHOOLS` / `BILINGUAL_CENTERS` and API centers. It does not seed, overwrite or migrate the database. Read [REVIEW.md](REVIEW.md) for every institution, source reference and specific review note.

## Source and update rules

- The reviewed pipe-delimited transcriptions in `build_catalog.py` are the source of truth. Each row contains a permanent slug, PDF page/row, Arabic name, governorate, area, address, phone list, needs, stages, classroom type, capacity and ages. Empty values mean not stated.
- Run `python data/institutions/build_catalog.py` from the frontend, or invoke the script by its absolute path. It regenerates `catalog.json` and `REVIEW.md` using only Python's standard library.
- Never change an existing slug when correcting a name or address. Give new institutions a new slug, and retain separate branches and boys/girls divisions. Repeated appearances of the same institution share a slug and retain separate observations.
- Source dates, page counts and SHA-256 hashes are in the catalog. The two `menwhm` filenames are identical copies, not two independent confirmations.
- The dated source is from 2023; the other source has no stated date. Neither establishes current operation. Contradictory observations are displayed independently instead of selecting a supposedly current value.
- Filter tags are conservative aids derived from explicit wording. “All disabilities” and “all stages” have their own tags rather than asserting specific eligibility. Raw Arabic always remains available.
- No English institution name, map coordinates, photo, rating, review, admission availability or booking is invented. English UI labels are provided; unverified source text remains Arabic. Any future verified English name or location should be added to the generator with evidence, not only to the generated JSON. Map links additionally require `mapVerification` evidence and date.
- Capacity shared between divisions remains marked as shared and must not be summed twice. Kuwait Autism Center is one institution listed in both school and rehabilitation categories because the sources classify it differently.

## Existing records and backend architecture

The existing API (`api/directory.api.ts`) uses `/directory/centers`, backed by the project's center model and MongoDB IDs. Its center records are not PDF institution identities. A read-only check of the configured API returned an empty centers array during this update. No database records were changed.

All five previous local schools and seven local centers remain in `constants/directoryBilingual.ts`, unchanged. They can be opened using the “Existing records for review” switch. The old schools are مدرسة النور للتربية الخاصة، مدرسة الأمل الشاملة، مدرسة البيان الخاصة، مدرسة التميز العالمية، مدرسة الكويت للصم. The old centers are مركز خطوة للتأهيل، مركز كيان، مركز فنون، مركز تنمية الطفل، مركز الأمل للتنمية، مركز نور الحياة، مركز بداية.

The old Noor/Bayan names resemble source records, but the available old data does not establish that they are the same legal institution/branch. Amal also has multiple possible namesakes. None was merged on name resemblance. Other old records have no established source match. Their previous English names and substantive local details are retained as unverified information; synthetic ratings/photos and unsupported booking claims are not carried into the new institution pages.

Actual API records remain available in the review section with `backend:<MongoDB ID>` identities and their own details. Source identities use `kw-...`; old local identities remain unchanged. There is no automatic join by index, fuzzy name, phone or category. A future verified database relationship must explicitly connect the institution ID to the correct backend ID with evidence.

Older detail links prefer a recognized serialized local identity over an unrelated backend ID. Unknown or malformed links show “not found,” never the first item. Standalone backend center links can still load their own MongoDB record.

## Implementation files

- Data and provenance: `data/institutions/{build_catalog.py,catalog.json,README.md,REVIEW.md}`.
- Typed model: `types/institution.ts`.
- Search, filtering, phone/map validation, legacy preservation and actual backend identities: `utils/institutionDirectory.ts`.
- Old-link compatibility: `utils/legacyInstitutionRoute.ts`.
- Arabic/English labels: `constants/institutionLabels.ts`.
- Shared list/filter UI: `components/directory/InstitutionDirectoryScreen.tsx`.
- Evidence-aware details and phone/map actions: `components/directory/InstitutionDetailsScreen.tsx`.
- Routes: `app/(tabs)/directory/{_layout,schools,nurseries,centers,institution-details,school-details,center-details}.tsx`.
- Regression coverage: `__tests__/institutionDirectory.test.ts` and `__tests__/institutionScreens.test.tsx`.

Home and service entry points continue to work without Home design changes. Schools opens only Schools and Nurseries tabs; Centers opens a centers-only list with no education tabs. `institutionDirectoryCategory` assigns each record to exactly one navigation category while retaining every original source category and observation. The dual-classified Kuwait Autism Center appears only in Centers. Visible reference totals are 39 schools, 39 nurseries and 12 centers (90 unique records). Source-category totals in REVIEW.md describe the PDFs, not duplicated navigation listings. Details use stable IDs and category-appropriate back-navigation fallbacks. Doctor/professional screens and their bookings are unchanged. Earlier floating AI button changes and unrelated local files were preserved.

## Validation

- Jest: source coverage, unique IDs, duplicate consolidation, retained branches/shared capacity, conflicts, legacy routing, backend identity isolation, combined filters, Arabic search normalization and safe links.
- Component tests: Arabic RTL and English LTR search/filter/navigation flows; phone actions under iOS, Android and Web platform branches; invalid identities.
- Expo: iOS and Android production bundles exported locally, without publishing.
- Internal Web preview: Arabic and English directory layouts, categories, source details, search/filter navigation and phone hrefs checked. No real phone calls placed.
- Targeted ESLint passed. Full-project TypeScript checking remains blocked by existing errors outside this directory implementation.
- Native platform branch tests and bundles are not physical-device tests. iOS/Android emulator/device interaction remains to be verified on suitable devices; no Android `adb` was available and this Windows host cannot run an iOS simulator.
