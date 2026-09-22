# Production QA

Run the project `build.sh`; do not bypass a failing validation step to obtain media.

## Evidence traceability

- `content/story.json` must bind each slide to real claim IDs.
- `content/claim-register.json` must be creator-approved and must not be the example register when `production` is true.
- Verified, qualified and disputed claims need sources.
- Qualified and disputed claims need approved safe wording.
- Removed or unresolved claims must not appear in a slide.
- New claims introduced while designing must return to the evidence gate.

## Storyboard fidelity

For each slide, record:

- `storyboardIntent.requiredStatements` for facts or qualifications that must survive editing;
- `storyboardIntent.requiredVisuals` for promised visual elements;
- `visualElements` for what the renderer actually implements;
- `visualSemantics` describing whether the graphic is a measurement, chronology, comparison, process, editorial device, conceptual model, argument map or unweighted factor map.

The build checks these fields. The reviewer must still compare the storyboard with the output and reject materially weaker substitutions. For example, three promised documentary symbols should not silently become three generic text cards.

## Visual inspection

Inspect all of the following in `output/qa/`:

- `mobile-contact-sheet.png` at ordinary viewing size;
- every footer crop for source legibility;
- every five-frame motion strip for sequence, pacing and final state;
- the full-resolution contact sheet for hierarchy and consistency.
- native-scale component crops for every text-bearing container, arrow endpoint and dense diagram;
- the most crowded frame and final frame of every animation at 100% scale.

Check titles, section labels and source notes against all four edges. Custom components must use the shared safe-area geometry. Never solve overflow by shrinking below the configured minimum text size.

The contact sheet cannot approve containment. It is deliberately too small to reveal many overflows. Use the component crops to verify all four inner edges of each container and the complete footprint of every arrowhead. Record the result in `output/qa/layout-audit.md` with one row per slide and explicit statuses for text containment, text-to-text collision, connector clearance, safe-area clearance and animation states. Any status other than `PASS` blocks delivery.

After correcting a failure, regenerate the affected media and its QA artifacts. Do not approve the correction from an SVG preview or code inspection alone.

## Semantic review

- Equal-sized nodes imply categories, not measured equality; label them as unweighted.
- Scales and balances are argument maps unless based on quantitative measures; label them accordingly.
- Bar, ring and area sizes require a stated scale, population, date and source.
- Scenario animations must distinguish observed, estimated and uncertain quantities; recalculate every total; and include sensitivity ranges whenever the changed variable is unknown.
- Timelines must say when they are selective rather than exhaustive.
- Icons must communicate the intended concept without reversing or moralising its meaning.

## Cover review

Compare the cover against the approved visual direction before rendering the remaining carousel. Confirm the promised illustration mode—ImageGen editorial art, code-native abstraction, archival collage or typography-led—and include disclosure when synthetic imagery could be mistaken for documentary evidence.

## Delivery gate

Deliver only when automated validation passes, `layout-audit.md` has no open findings, and the native-scale visual review finds no clipping, collision, misleading encoding, storyboard omission or unreadable text. Preserve the story manifest, claim register, creator decision and all QA sheets with the final PNG/MP4 package.
