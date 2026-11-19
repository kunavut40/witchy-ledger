# 0.6.8 source update

## Current request

- Four lightweight theme-colored leaves and three subtle wind streaks accompany manual/Other entry and successful saves. Preset navigation has no entrance gust; saving uses the reverse direction. Cancel does not introduce a gust.
- Leaf sizes/delays finish before the shared 700ms cleanup. Retriggering cancels the prior timer. Reduced-motion skips the gust.
- Removed animated full-screen and modal blur. The transaction scrim uses a static wash; fade/slide uses opacity and transforms. Background decorative animation pauses briefly while the transition plays. Modal exit duration matches its 180ms removal timer.
- Lowered the shared head group to shorten the visible neck: Yui 3.8% (bun 4.1%), Momo 3.2% (bun 3.6%). Hair, facial layers and accessories follow the same anchor. Inspected all ten character/hair combinations with hats, and all 24 outfit/pose combinations.

## Included companion restoration

Includes the previously completed local work: Yui/Momo personality and 56 event banks, explicit coffee quantities, separate affinity/memories, persistent event priority/cooldowns/idempotency, wardrobe integration, three mouth drawings, 24 modular body pose sprites, 1.25-second top-positioned save notice, and permanent character documentation.

## Validation and practical limits

- 68 automated tests, TypeScript and production web build passed.
- Browser checks cover preset/manual event timing, six theme colors, cleanup/retriggering, reduced motion, coffee forms, dialogue persistence, offline interactions, and mobile widths 320/393/412.
- Three production-build samples before/after on headless Windows Edge at 393×852 with 4× CPU throttle: mean task duration 317.9→244.0ms per capture (~23% less), paint duration 63.5→39.6ms (~38% less), layout 18.0→1.3ms. These measure browser work during an ~850ms capture, not transaction latency.
- Both sets had zero sampled frames above 34ms. RAF p95 was 16.7ms before and 18.1ms after; this desktop trace does not prove improved phone frame rate. Phone/GPU behavior still needs device testing.
- This publication updates source and the build script for versionCode 14. It does not include a newly built APK. The repository's 0.6.7 APK predates these changes.
