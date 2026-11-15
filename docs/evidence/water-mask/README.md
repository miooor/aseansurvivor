# WebGL water clipping evidence

Scope: [ticket #14](https://github.com/miooor/aseansurvivor/issues/14), correcting the terrain baseline while preserving collision, water scrolling and bridge geometry.

Run the development server in the repository container, open `/tests/water-mask.html`, keep the tab active and select **Run water checks**. Download the timestamped JSON report. **Preview river corner** stages the first Johor river at the same camera location used for the before/after screenshots; collapse Report before taking the screenshot.

`red.json` records the original WebGL failure before the renderer edit: one passing renderer assertion and one failing terrain assertion, with three forwarded unsupported-mask warnings. `before.jpg` visibly shows the rectangular top and sides of the first river.

`internal-mask-first.json` is a retained harness diagnostic, not clipping evidence. Its all-zero pixel reads came from subtracting camera scroll twice. Installed Phaser 4.2.1 `src/cameras/2d/Camera.js` already includes scroll in `camera.matrix`. The corrected harness transforms world coordinates directly and rejects out-of-viewport, lost-context, transparent or black-ground samples.

The pixel checks compare the same paused scene with a named water surface at alpha 1 and alpha 0, using the renderer's public `snapshotPixel` API after actual GPU frames. Known rounded-corner and outside-bank samples must match exposed ground within a summed RGB difference of 3; a point 100 units inside the water must differ by more than 15. This independently rejects a rectangular surface and an entirely missing surface. Every authored water rectangle is checked under two zoom settings, with the player/camera moved to each rectangle. The report retains world coordinates and both RGBA values.

Lifecycle checks use actual raid entry plus the **Play again** and **Choose hero** buttons, then three complete rendered six-world cycles. TextureManager counts are compared at the same final Johor view. Warnings are observed and forwarded, never suppressed.

`green.json` records **180/180 PASS**, with no captured warnings or errors. All 14 water rectangles across the five water-bearing worlds pass at both zooms; the sixth world is exercised by the stage and lifecycle transitions. All 56 corner/outside comparisons have zero difference, while all 28 body comparisons show visible water. TextureManager counts stay **21, 21, 21** across the three six-world cycles. `after.jpg` records the same river-corner preview with the rounded, irregular bank exposed instead of a rectangular water edge.

`corrected-pixels-first.json` records a valid pixel failure for the first filter attempt: opaque, nonblack body and ground pixels matched because the bank was captured through the wrong camera. `WebGLRenderer.currentViewCamera` remains the main camera during object filtering. Passing `surface.filterCamera` explicitly as the supported `viewCamera` argument aligns the world-coordinate bank with the internal water texture.

The supported API and ownership were checked against pinned installed Phaser 4.2.1 source: `gameobjects/components/{Mask,Filters,FilterList}.js`, `filters/Mask.js`, `cameras/2d/Camera.js`, and `gameobjects/GameObject.js`. `GameObject.destroy` destroys its filter camera, whose filter-list destruction releases the mask's DynamicTexture. OpenWorld then destroys the bank Graphics source. The bank and the internal object camera are static, so the mask captures once while the main camera and scrolling water texture remain independent. Official API references: [FilterList](https://phaser.io/oss/docs/api-documentation/class/gameobjects-components-filterlist), [Mask](https://www.phaser.io/oss/docs/api-documentation/class/filters-mask).

`checks.txt` records repository lint, focused fixture lint, and the normal production build (including strict TypeScript). The build retains the known large Phaser chunk and plugin callback timing diagnostics. Final combined performance, Astrocade and broader regressions belong to ticket #12; this focused check does not establish physical-phone performance or Canvas-renderer acceptance.
