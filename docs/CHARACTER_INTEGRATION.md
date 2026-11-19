# Companion integration and data safety

## Modules

`CompanionWidget` listens to actual ledger/appearance/page changes. It sends causes to `runtime.ts`, which serializes reads and updates to companion settings. `engine.ts` is pure and testable with injected dates and randomness. It reuses `summary`, `balance`, `categorySpend`, `descendantIds`, and `progression`.

Only `db.settings` is written by the companion service. No new database table or database version is needed. Existing backup exports include these settings and the optional transaction metadata.

## Persisted schema

`companion.runtime.v1`:

- `version`, initialization baseline and immutable seen transaction IDs
- `consumed` stable event keys
- `characters.yui` / `.momo`: affinity, last credited local day, last three line IDs, per-event cooldown times, last 250 history records
- one priority queue with speaker, event, line ID, text, emotion and creation time
- source transaction ID + revision evidence for invalidating edited/deleted queued statements
- high-water snapshot for real rank/level/outfit/furniture; changing the test preview does not modify this snapshot
- last appearance, page and opened local date

Existing `fantasy.state` is retained. On first migration only the previously selected character receives the existing affinity and last interaction date; the other starts independently. `companion.legacyBackup.v1` retains the previous fantasy JSON once before migration. This is a companion-settings backup, not a copy of the user's entire financial database.

`fantasy.state.characterLooks` stores each person's selected hair/outfit/accessories. Switching saves the outgoing look and restores the incoming look. Favorites and existing financial/profile settings remain intact.

## Optional transaction metadata

- `coffee?: {cups: number, partnerCups: number | null}`
- `entrySource?: "quick" | "manual"`
- `incomeSource?: string` (explicit actual source, maximum 80 characters)

These do not change amounts, balances, XP, category IDs or rank formulas. Coffee form fields appear only in coffee expenses and are optional. Quick presets retain unknown quantity unless the user later records it explicitly. Partner cups require a total and cannot exceed it.

## Explicit preferences

- `fantasy.state.animations`
- `companion.salaryDay` (optional)
- `companion.birthdayConsent` and `companion.birthday` (MM-DD only)
- `companion.debtDueDates` (account ID → explicit ISO date)

No salary/debt dates, recipients or income sources are guessed. Credit due reminders require an active credit account, a configured upcoming date, and actual outstanding debt.

## Regression coverage

`engine.test.ts`: grounded coffee quantities/recipient/date, threshold warnings, no repeat, replay safety, edit/undo cancellation, priority, old-data baseline, affinity isolation/caps, appearance, bank coverage, birthday consent, and test-rank isolation.

`runtime.test.ts`: real IndexedDB adapter with isolated fake database; concurrent synchronization, migration backup, persistence after closing/reopening, backup round trip, no companion writes to accounting tables.

Browser QA uses a new isolated Edge context, never the existing user's IndexedDB. Verified manual coffee recording, three typewriter mouth frames, notice position/expiry, refresh history, appearance switching, motion toggle, reduced motion, offline switching, and widths 320/393/412 without horizontal overflow. Physical phone animation and audio still need device testing.
