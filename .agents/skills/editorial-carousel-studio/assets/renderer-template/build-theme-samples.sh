#!/bin/zsh
set -euo pipefail
ROOT=${0:A:h}
SVG="$ROOT/build/theme-samples"
OUT="$ROOT/output/theme-samples"
node "$ROOT/validate.js"
node "$ROOT/render-theme-samples.js"
mkdir -p "$OUT"
for f in "$SVG"/*.svg; do rsvg-convert -w 1080 -h 1350 "$f" -o "$OUT/${f:t:r}.png"; done
for theme in campaign-red cream midnight sky white; do
  magick montage "$OUT/$theme-01-cover.png" "$OUT/$theme-02-timeline.png" "$OUT/$theme-03-factors.png" "$OUT/$theme-04-data.png" -thumbnail 270x338 -tile 4x1 -geometry +10+10 -background '#D9D9D9' "$OUT/$theme-contact-sheet.png"
done
magick montage "$OUT"/*-contact-sheet.png -tile 1x5 -geometry +8+8 -background '#BDBDBD' "$OUT/all-themes-contact-sheet.png"
echo "Built $OUT"
