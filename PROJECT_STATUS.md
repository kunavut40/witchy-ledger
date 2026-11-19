# Character restoration

Scope: restore the attached Character Bible on the existing app, preserving the completed 1.25-second notice and Yui face fixes.

## Stage 1 — audit complete

- Existing Thai banks survive in `src/fantasy/model.ts`, including separate Yui and Momo lines. The save handler bypasses them with a generic status message.
- Git history includes the same simple banks; no recoverable quantity-based coffee engine was found in the current base.
- Existing modular head/body/accessory renderer and typewriter are retained. Current talking moves the head but does not animate the mouth.
- Existing affinity is a daily interaction counter shared by both characters. It needs additive migration to per-character state.
- Rank uses `progression.ts`; its formulas and tests will remain unchanged. Wardrobe test unlock must not produce earned rewards.
- Accounting data remains in IndexedDB. No user database is opened by automated browser tests; fresh browser contexts are used.
- Uncommitted visual fixes are preserved; a source backup and diff are in ignored `.local-backups/character-restoration/`.

## Stage 2 — personality restored

Yui's tsundere voice and Momo's playful voice are separate. Generic bank-like save text no longer replaces their actual reactions. Old usable dialogue is retained in the canonical bank.

## Stage 3 — dialogue expanded

56 registered events (E01–E51, C01–C05), at least five lines per speaker per event; separate five-tier affinity conversation banks. The old model export is a compatibility adapter to the same source.

## Stage 4 — coffee logic implemented

Optional explicit cup and partner quantities, strict validation, local dates, unknown-data handling, first/second/third-cup reactions, coffee-specific budget thresholds, closed-period comparisons. Quick preset prices do not imply quantity.

## Stage 5 — event lifecycle repaired

Stable durable keys, per-event cooldowns, nonrepeating randomization, one priority queue, edit/undo evidence cancellation, first-install baseline, and serialized settings persistence. Companion events never write to financial tables.

## Stage 6 — layered animation and pose artwork implemented

Existing rig retained. Three mouth drawings follow typewriter ticks; automatic multi-step blink, stepped breathing/nod, blush, puffed cheeks, surprise/celebration and emotion marks support all ten state names. Added 24 headless body sprites: hands on hips / hands clasped / sleepy hand raised, each for all eight actual outfits. Room pose uses the active dialogue emotion. Motion toggle and reduced-motion work. Inspected the normalized sprite sheet and all 24 outfit/pose combinations in the live app. See ANIMATION_SPEC.md for the precise layered approach; not every intermediate full-body frame is newly drawn.

## Stage 7 — affinity, wardrobe and progression integrated

Separate daily-capped affinity and memories, additive legacy migration and legacy settings backup, each character's appearance retained. Real existing progression triggers rank/level/wardrobe/furniture reactions. Test unlock/preview does not create earned progression. Formulas in progression.ts are unchanged.

## Stage 8 — second character integrated

Momo retains name, pink-haired artwork, skull accessory identity, distinct dialogue, and independent affinity/history. Switching restores each character's saved look.

## Stage 9 — permanent documentation complete

CHARACTER_BIBLE.md, DIALOGUE_EVENT_SPEC.md, ANIMATION_SPEC.md and CHARACTER_INTEGRATION.md are the project references. No existing AGENTS.md was found to amend. Original user brief is retained as CHARACTER_RESTORATION_REQUEST.md.

## Stage 10 — verification

- 68 automated tests passed, including existing financial/rank tests and new event/IndexedDB persistence tests.
- TypeScript and production build checked.
- Isolated browser: explicit second-cup manual entry, three talking frames, notice expiry/position, history after refresh, wardrobe switching, animation toggle, reduced motion, offline interactions, mobile widths 320/393/412.
- Physical-phone testing remains. The prior APK 0.6.7 is unchanged; this task's current output is source and web build, not a newly packaged APK.

## Follow-up — minimal wind transition and short neck

Added four theme-colored leaves and three thin wind streaks, retained preset/manual save rules, removed animated blur, and briefly paused background decoration. Verified all six palettes, reverse save direction, timer cleanup/retriggering and reduced motion. Shortened neck exposure using the shared head/accessory anchor; inspected ten hairstyle/hat combinations. See RELEASE-0.6.8.md for measured browser performance and its phone-testing limits. Source and future APK build metadata now identify 0.6.8 (14); no new APK is included in this source update.
