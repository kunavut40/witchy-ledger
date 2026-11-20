# 0.6.13-local-test — Month presets, category ordering and companion layout

20 November 2026. Branch `feature/month-presets-companion-v0613`.

## What changed

- Companion uses the existing layered wardrobe/face rig, cropped closer to the upper body on the left, adjoining a cream frame with a dark/gold nameplate. No companion dim/blur registration. Other modals retain the shared backdrop. Existing typewriter, emotion mapping, queue and completed-text +1250ms dismiss behavior remain.
- Removed the bottom-left summon control. The small Yui app logo at the top right summons the selected companion. The header brand also supports summoning. Selected outfits/hair/accessories are retained; no image assets were replaced.
- `PeriodNamePicker` provides twelve themed rectangular month-name choices and a manual-name option. Blank names are rejected. Picking a name does not silently change existing dates.
- `PeriodManager` shows twelve months in a 3-column/4-row grid, with year navigation. Tap selects a period; hold 420ms or use the pencil to edit. Existing named/monthly records and edited ranges are reused. Missing monthly records are created only when selected, using calendar boundaries and existing overlap warnings. Custom/other records remain accessible in a separate expandable list. It does not pre-create twelve records or overwrite existing records.
- Actual selected start/end dates stay beside the month trigger on phones. Monthly date editing keeps the existing salary/calendar/custom type validation; choose custom when defining a non-calendar range.
- Coffee/fuel price stage omits both income/expense type circles instead of hiding an overlapping duplicate. Category, prices, manual entry and the central X remain.
- `SortableCategories` is reused for main and subcategory grids. Hold 420ms and drag to reorder; normal tap selects. A swipe before the hold scrolls the form. Release persists only sibling `Category.order` values atomically. Cancel/background/unmount cancels the pending hold; category IDs and transaction references are unchanged. Alt+arrow is an accessible reorder alternative. Errors are surfaced.
- `ActiveMotion` supersedes the 0.6.12 static-only policy at the user's request. Intersection/DOM/overlay observers mark visible icons in the current page or topmost menu. Background pages/hidden icons remain still. Dashboard ambient sparkle only runs while dashboard is the foreground surface. Visible rank/glint/ring effects are restored. Selected and held controls get eight themed stars, a rotating light trail and breathing sparkle. Reduced motion, app motion off and document background disable/pause this work. No frame-by-frame React animation loop is used.

## Files

New: `src/monthPresets.ts`, `PeriodNamePicker.tsx`, `categoryOrder.ts`, `SortableCategories.tsx`, `ui/ActiveMotion.tsx`, `ui/refinements-v0613.css` and two focused test files.

Extended: `PeriodManager.tsx`, `EntryCategories.tsx`, `RadialEntry.tsx`, `CompanionWidget.tsx`, `InteractionController.tsx`, `Pixel.tsx`, `App.tsx`, `main.tsx`, package version and APK build version.

No dependency, database schema, financial formula, progression rule, dialogue bank, signing key or artwork changes. Existing category order and period tables are reused.

## Verification

- TypeScript passed; **83 tests across 18 files passed**; production build passed. Existing chunk-size warning remains.
- New tests cover twelve months, leap/non-leap February, December boundaries, custom range reuse, stable preset identities, atomic sibling reordering and cross-group rejection. Existing accounting, persistence/backup, debt, progression, event queue and dialogue lifecycle tests still pass.
- Browser QA used isolated localhost 5217/5218 databases. Selected December, held it to open the existing editor, selected the manual-name option, changed the end date to 25 December under custom type, saved and verified the displayed 1–25 December range.
- Month-name popup and 3×4 month manager inspected; keyboard reorder persisted and appeared in a reopened income form. An immediate drag is treated as a swipe; the automation API did not expose a continuous held-then-drag input, so physical long-hold dragging still requires a phone smoke test. The drag handlers and shared reorder persistence are implemented.
- Final price-stage DOM had zero type circles; foreground overlay had live icon markers and the background content had zero live markers. Companion visible with shared backdrop inactive. App motion-off switch checked.
- Inspected 320/393/412px and desktop: document and scroll widths matched. Preview images and logs are outside Git under the sibling output/work folders.
- No physical S25 installation, FPS, GPU or battery measurement was performed. Active animation behavior is intentionally different from 0.6.12; do not cite its zero-loop result for this version.

## APK

`../WitchyLedger-S25-v0.6.13.apk`, package `app.witchyledger.offline`, versionCode **19**, min API 30, target API 35.

Signature verified; certificate SHA256 matches 0.6.12:
`a6f10620eec48117cba37ea542c66dc975a843ed7fe5242e1ed5d267b8cd9ba3`.

APK SHA256: `a828b59e0d84d30dc53132ecde4c21083192f478de4ae3fdce312ebfebf946c5`.
41 packaged web files match production dist, accounting for the existing APK builder's registerSW removal/newline transform. See `../v0613-apk-verification.json` and `../../work/android-tools/v0613-build.log`.

Export private JSON from the real app before installing. Package/certificate/version checks support an update over the checked 0.6.12 local line; installation has not been exercised on a phone.

## Restore and handoff

Base: `2babff7d7bac089477d82e6c7ce59a209af3cf9f` (0.6.12); working tree was clean before work. Before-edit source ZIP, history bundle and base commit are outside Git at `../backups/pre-v0613-20261120/`. This is not a database backup and contains no signing key. No personal database was used for testing.

Keep current work intact; inspect the base safely in a separate worktree:

```powershell
git worktree add -b restore/pre-v0613 ../witchy-ledger-before-v0613 2babff7d7bac089477d82e6c7ce59a209af3cf9f
```

Use Git log for implementation and documentation commit hashes on `feature/month-presets-companion-v0613`.

After local verification, the user authorized GitHub publication on 20 November 2026. Publication uses a fast-forward update of `main`, retaining this feature branch and the previous history, plus the test APK in pre-release `v0.6.13-local-test`. Earlier no-push statements in historical reports describe the state before this authorization.

Release: https://github.com/kunavut40/witchy-ledger/releases/tag/v0.6.13-local-test
