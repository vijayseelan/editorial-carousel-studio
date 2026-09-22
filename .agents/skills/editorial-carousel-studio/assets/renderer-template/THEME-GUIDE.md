# Theme engine

The renderer uses semantic colour roles rather than fixed black/white values. Select a preset with:

```sh
CAROUSEL_THEME=cream ./build.sh
```

Available presets: `midnight`, `cream`, `campaign-red`, `sky`, and `white`.

## Colour roles

- `background`: page canvas
- `surface` / `surfaceStrong`: cards and icon containers
- `foreground`: primary text and figures
- `muted` / `source`: supporting copy and citations
- `divider` / `track` / `nodeSurface`: structural diagram colours
- `accent` / `gold`: emphasis, data and motion highlights
- `onAccent`: text placed on accent-filled shapes
- `coverOverlay`: image-cover tint
- `coverForeground` / `coverMuted`: text placed over cover artwork

Custom themes belong in `config/themes/<name>.json`. `validate.js` checks that every role exists and enforces WCAG-oriented contrast thresholds for primary text, supporting text, and accent buttons.

Run `./build-theme-samples.sh` to render four representative slides in every installed theme and create a combined comparison sheet.

## Content intake

Source documents are optional. A project may begin from Codex research, supplied documents, or a hybrid of both. All three routes must pass the mandatory evidence and creator-approval gate in `references/content-intake-and-validation.md` before slide production starts.
