## ล่าสุด 0.6.13-local-test — Month presets / sortable categories / active motion

อ่าน RELEASE-0.6.13.md ก่อน Branch feature/month-presets-companion-v0613, implementation 5ea5db7. เดือน12ช่อง3x4, แตะเลือก/ค้างแก้ช่วงวัน, ชื่อเดือนหรือระบุเอง, แสดงวันเริ่ม–สิ้นสุดบนมือถือ; หมวดหลัก/ย่อยลากเรียงและpersist order; ลบวงรายจ่ายซ้ำหน้าprice; ผู้ช่วยเรียกจากโลโก้บนขวา ไม่blurฉาก; animationเฉพาะforeground/ไอคอนที่เห็น พร้อมดาวขณะเลือก/ค้าง เปลี่ยนนโยบายstatic-onlyของ0.6.12ตามผู้ใช้ Tests83ผ่าน APK offline code19/certเดิม ตรวจ41assetsตรงdist ยังไม่ทดสอบติดตั้ง/hold-dragบนS25จริง ไม่pushGitHub

## ล่าสุด 0.6.12-local-test — Performance / calendar / dialogue

อ่าน docs/PERFORMANCE-FANTASY-UI-UPDATE.md ก่อนทำต่อ branch feature/performance-fantasy-ui, implementation commit a180e67; ไอคอนนิ่งตอนว่าง ใช้ shared backdrop/calendar, period manager, บทพูดครึ่งตัวและปิดหลังข้อความครบ 1250ms Tests79ผ่าน APK Offline versionCode18/certเดิม ตรวจไฟล์เว็บ41รายการตรงกับdistแล้ว Browser393/320/412/desktop,6สี,Classic/Fantasy,offline cacheตรวจแล้ว ยังไม่ทดสอบS25จริงหรือวัดFPS ไม่ push/merge/release ตามคำสั่งงานนี้ สำรองซอร์สก่อนแก้ไว้แยก ไม่ใช่สำรองฐานข้อมูล

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
- Physical-phone testing remains. APK 0.6.8 was subsequently built and verified; see the packaging follow-up below.

## Follow-up — minimal wind transition and short neck

Added four theme-colored leaves and three thin wind streaks, retained preset/manual save rules, removed animated blur, and briefly paused background decoration. Verified all six palettes, reverse save direction, timer cleanup/retriggering and reduced motion. Shortened neck exposure using the shared head/accessory anchor; inspected ten hairstyle/hat combinations. See RELEASE-0.6.8.md for measured browser performance and its phone-testing limits. Source and APK metadata identify 0.6.8 (14).

## Follow-up — APK packaged for phone testing

Built `WitchyLedger-0.6.8.apk` from the current production web build. Verified APK signature, application ID/version, matching certificate with 0.6.7, and byte-matching packaged web/character assets. Uses the existing local signing key; no key or build tools are published. APK and SHA-256 checksum are included for GitHub download. Physical-phone testing remains for the user.


