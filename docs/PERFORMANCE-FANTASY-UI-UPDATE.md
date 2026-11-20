# Performance, UI consistency & companion dialogue — 0.6.12-local-test

Updated 20 November 2026. Work branch: `feature/performance-fantasy-ui`.

## Audit and restore point

Project: `C:/Users/USER/Documents/Codex/2026-11-16/files-pasted-by-the-user-master/outputs/witchy-ledger-069`.
Before: `afc41aa4fbc102349192cd55427e4e7cdce7666b`, branch `feature/grand-fantasy-v0.6.11`, version `0.6.11-local-test`. Working tree and untracked list were empty. Read-only GitHub main inspection matched this commit. No pull, merge, reset, clean or force operation was used.

Before editing, source ZIP, verified Git history bundle, staged/unstaged patches and restore metadata were saved to:

`../backups/pre-performance-fantasy-update-2026-11-20-130131/`

The backup is outside the repository. It excludes dependencies/build output and signing secrets. `restore-point.json` records the clean base. This is **not an IndexedDB/database backup**. No financial JSON backup was found in the searched output folders. Personal financial records were not imported, read or published. Before installing on a real phone, export its JSON through the existing Backup screen and retain that file privately.

Baseline: TypeScript passed, 72 tests passed, production build passed. Existing Vite chunk-size warning was present before this work.

## Changes and reasons

| Files | Result |
| --- | --- |
| `src/ui/InteractionController.tsx`, `interaction.css` | Icons and rank ornaments remain still at rest. Delegated pointer feedback starts immediately, runs once on tap, loops only after a 350ms hold, stops on release/cancel/background/removed element/unmount. It never invokes business actions or synthesizes clicks. Reduced motion and app animation preference disable the effect. |
| `src/ui/overlayStore.ts`, `SharedBackdrop.tsx`, `overlays.css` | One shared dim/blur surface. Existing values were hardcoded, with no persisted blur preference: defaults stay at 50% dim and 3px blur via shared CSS variables. No duplicate setting was invented. Layers: dialogue 200, ordinary modal 300, period manager 400, calendar/category orbit 500, confirmation 700. The central radial X remains accessible. |
| `src/MagicDatePicker.tsx`, `calendarBounds.ts` | Existing calendar now supports controlled values, optional clearing, labels, and inclusive bounds. ISO storage and local-noon display remain unchanged. All former native date fields now reuse it: period start/end, debt payment, optional birthday and credit due date. Month navigation, BE year selector and six calendar palettes remain. |
| `src/PeriodManager.tsx`, `ui/consistency.css`, `App.tsx` | Dashboard/transactions/reports/budget period trigger opens cards showing actual names and date ranges. Select, edit and add reuse existing functions. Period names remain editable text; salary/calendar/custom kinds and overlap confirmation are preserved. |
| `src/fantasy/CompanionWidget.tsx`, `dialoguePlayback.ts` | Half-body existing layered character on the left, cream/theme/gold frame and attached nameplate. No dedicated palace image in dialogue. Dashboard GrandFantasyScene remains. Queue lines or a manual summon show the widget; no permanent large idle widget. Original 27ms typewriter; exactly 1250ms from completed text to dismissal. Skip completes text then starts the same delay. One timer owner per presentation, cleaned on close/replacement/page/unmount and paused under higher overlays/background. |
| `src/motion.ts`, `SceneTransition.tsx` | Existing short transitions respect reduced motion, app animation switch and background state. Active scene animation is cancelled when backgrounded. |
| `src/main.tsx`, modal/portal consumers | Shared overlay host retains theme inheritance and keeps calendar/confirmation above their parent form without duplicate blur. |
| `package.json`, `android/build-apk.ps1` | Local test 0.6.12, Android versionCode 18; existing package and signing key retained. |

No asset files, dependencies, schema, backup format, domain formulas, debt repository, progression rules, dialogue bank, affinity/memory rules or queue engine were changed. No backend, cloud call or telemetry was added. Existing notice duration remains independent.

## Verification

Final TypeScript: passed. Final Vitest: **79 tests across 16 files passed**. This includes existing accounting, debt persistence, backup/restore/domain checks, period calculations, progression, radial helpers, event engine/queue and new overlay ordering/date-bound/dialogue lifecycle tests. Production build and signed APK build passed.

New lifecycle tests use fake timers to verify the complete-text +1250ms boundary, skip/reduced-motion behavior and cancellation before or after typing. Overlay tests cover nested ownership cleanup and stale cleanup; calendar tests cover leap-day validation and inclusive year-boundary ranges.

Browser tests used isolated localhost origins `5215` and `5216`, never the user's working app database:

- 320, 393, 412px and desktop: document width equals scroll width; no horizontal overflow in inspected views. Final dialogue also checked at 320px.
- Classic/Fantasy switch checked; all six app palettes selected and saved, then confirmed against rendered palette. All six calendar palettes checked.
- Period manager selection, edit and add paths checked. Created a fictional custom period 20–25 November 2026; preserved overlap warning, confirmed it, and verified actual range and selection in manager.
- Nested calendar over period editor: one backdrop at z499; confirmation z699; period manager z399. Closing returns to the correct surface.
- Held expense gesture, coffee price choice, one quick save: resulting transaction list showed exactly one 20-baht test entry.
- Central plus/X open/close and backdrop cleanup checked. Yui and Momo dialogue rendered with original wardrobe assets, manual skip and auto-dismiss checked; no image element in dialogue overlay. Motion preference off checked.
- Final idle DOM scan: 523 elements, **zero infinite CSS animations**. Initial baseline sampled 31 relevant elements and found 20 infinite loops. This is a CSS-animation count, **not an FPS, battery or GPU benchmark**.
- Stopped preview server on 5216; opened a new cached URL on the same origin and opened period manager successfully. This verifies cached browser offline operation, not physical-phone airplane mode.

Evidence outside repository: `../performance-browser-qa.json`, `performance-after.json`, `performance-offline-qa.json`, `performance-apk-verification.json`, and `performance-*.jpg`. Logs are under `../../work/performance-*.log`.

## Android artifact

`../WitchyLedger-S25-v0.6.12.apk`

- Package: `app.witchyledger.offline`
- Version: `0.6.12-local-test`, versionCode **18** (previous local APK: 17).
- Minimum API 30, target API 35.
- Signature verified with apksigner. Certificate SHA256 matches local 0.6.11:
  `a6f10620eec48117cba37ea542c66dc975a843ed7fe5242e1ed5d267b8cd9ba3`.
- APK SHA256: `20ed1d7a0a651aeeef370b6c16edb56dcaffdd9f07acd3d8e19acf59501fd6da`.
- All 41 packaged web files compared with checked `dist`; matched, allowing the existing builder's documented removal of registerSW registration and trailing newline in index.html.

Package, certificate and increased versionCode support an update over the checked local 0.6.11 APK. The older Preview line uses a different package/signature. No S25 was connected; installation, Android gesture cancellation, full drag navigation, every optional date field and physical performance still need a phone smoke test. OS-level reduced-motion behavior is guarded in code/unit tests; only the app switch was exercised in browser. No physical-device/FPS claim is made.

## Commits and handoff

- `8ef12eb`: static interaction motion.
- `e121d96`: shared backdrop/overlay host.
- `d0de7fc`: shared date fields.
- `af0a235`: period manager.
- `a180e67f29fef841b960c5fe484b8fc918d07056`: complete implementation and local version 0.6.12.
- Subsequent documentation-only commit contains this report and updated handoff; see `git log -1` for its SHA.

No GitHub push, merge or release was performed, per the current task instruction. Continue from this local branch. Do not replace it with another GitHub tree.

## Safe source restore

Keep this branch and APK. To inspect the original source without overwriting current work, from this repository run:

```powershell
git worktree add -b restore/pre-performance ../witchy-ledger-before-performance afc41aa4fbc102349192cd55427e4e7cdce7666b
```

Alternatively clone the verified bundle into a **new** folder, then switch there to the recorded base commit. The `source.zip` is another clean source copy. Do not extract over a folder containing current edits. Neither method restores or modifies IndexedDB.

Phone data restore uses the application's existing JSON import, after retaining the current JSON export. Do not uninstall the live app to perform a source rollback. Android downgrade installation may be refused because versionCode 18 is newer; reverting source alone is not a phone-data recovery procedure.

## Build continuation

Use existing installed dependencies, TypeScript/Vitest/Vite commands from package scripts. APK builder requires existing local Android tools and private signing key; do not publish the key or create a replacement. Retain `app.witchyledger.offline`, certificate and increasing versionCode for subsequent local APK updates.
