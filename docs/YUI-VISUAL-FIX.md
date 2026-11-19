# Save notice and Yui visual correction

Scope confirmed by the user: fix save feedback and Yui's face first. The attached character restoration document is reference for later work; its dialogue, affinity, and event expansion is deferred.

- Save notices expire after 1,250 ms and sit near the top of the viewport, above the companion chat. Existing undo remains available while the notice is visible.
- Yui's five hairstyles now share a dark-haired, dark-eyed face based on the app icon, turned slightly toward screen-right.
- Atlas chin anchor: (256, 205) in each 512px cell. Existing body and head accessory layers are retained. Momo's decoded sprite row is identical to the original atlas.
- Browser verification at widths 320, 393, and 412: no horizontal overflow. At 393x852 the notice occupies y84–130 and the companion y664–784. Notice disappears after its timeout.
- Visually inspected all five heads with and without the existing hat in the live app.
- 41 tests, TypeScript check, and production build passed. No accounting calculations, financial records, rank rules, or character dialogue were changed.

Asset provenance and technical checks: `asset-manifest-yui-v2.json`.
