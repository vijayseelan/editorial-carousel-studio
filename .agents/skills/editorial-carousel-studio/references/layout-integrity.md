# Layout Integrity

Use this contract for every production carousel. Its purpose is to prevent text overflow, text–connector collisions and false QA passes caused by inspecting only reduced contact sheets.

## Build components from content geometry

For every text-bearing container, determine these values before drawing it:

- outer bounds: `x`, `y`, `width`, `height`;
- inner padding on all four sides;
- title and body font sizes and line heights;
- the exact wrapped lines that will be rendered;
- the required text height, including title/body separation.

The component is valid only when:

`required width <= inner width` and `required height <= inner height`.

Use measured font metrics when the renderer supports them. Otherwise use a conservative estimate and leave at least 12% horizontal slack beyond the estimate. Do not compress glyphs with SVG `textLength`, `lengthAdjust`, transforms or unusually tight tracking to force copy into a container. If the copy does not fit at the minimum font size, shorten it, add a line, enlarge the container or change the layout.

Annotate bounded SVG text with `data-box="x,y,width,height"`, using the inner text rectangle after padding. The rendered validator uses this metadata for a conservative width/height check. Custom components that place text inside a card, pill, node or callout must provide this annotation.

## Component contract

- Body text must wrap deliberately; never depend on browser or renderer clipping.
- Reserve at least one full line-height between the final text baseline and the bottom padding.
- For centred labels, verify both left and right extents. A centred `x` coordinate alone proves nothing.
- Multi-line labels must use explicit lines and known line height.
- Rounded cards and pills need more horizontal inset near their curved ends.
- Add a clip path as a last-resort visual guard, but treat any clipping as a failed build rather than an acceptable result.

## Connectors and diagrams

- Define a protected text rectangle inside every node or card.
- End arrowheads outside that protected rectangle. Prefer stopping 12–20 px outside the container border.
- Route connectors behind containers or through reserved gutters, never across body copy.
- Check the arrowhead, not only the shaft endpoint: the arrowhead wings occupy additional space.
- Keep introductory paragraphs and diagram bounds in separate vertical regions; do not derive a diagram from the title height while ignoring body lines.

## Required QA artifacts

Generate all of these after final rendering:

1. An ordered contact sheet for narrative and hierarchy.
2. A native-scale crop for every text-bearing container and every connector endpoint. Combine crops into labelled audit sheets when useful.
3. Five-frame strips for animations, plus native-scale crops from the most crowded frame and the final frame.
4. A layout-audit record listing every slide, the reviewer status, and any correction made.

The reviewer must inspect crops at 100% scale. Reduced contact sheets cannot clear container containment.

## Rejection conditions

Reject and re-render when any of these occurs:

- a glyph touches or crosses inner padding;
- copy is clipped, compressed, truncated or rendered below the minimum size;
- two text regions overlap;
- a connector or arrowhead enters a protected text rectangle;
- a paragraph overlaps a diagram or container;
- a card is technically within the canvas but its copy exceeds the card;
- the animation introduces a collision at any sampled state;
- the reviewer cannot confidently determine containment from the generated QA artifacts.

Automated bounds checks are necessary but not sufficient. A build passes only after both structural validation and native-scale rendered inspection succeed.
