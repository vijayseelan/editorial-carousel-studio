#!/bin/zsh
set -euo pipefail
ROOT=${0:A:h}
OUT="$ROOT/output"
SVG="$ROOT/build/svg"
FRAMES="$ROOT/build/frames"
PNG="$ROOT/build/png"
QA="$OUT/qa"
MOBILE="$QA/mobile"
NATIVE="$QA/native-scale"
THEME=${CAROUSEL_THEME:-midnight}
STORY=${CAROUSEL_STORY:-content/story.json}
export CAROUSEL_STORY="$STORY"
mkdir -p "$OUT" "$SVG" "$FRAMES" "$PNG" "$QA" "$MOBILE" "$NATIVE"
rm -f -- "$SVG"/*.svg(N) "$FRAMES"/*.svg(N) "$PNG"/*.png(N) "$OUT"/*.png(N) "$OUT"/*.mp4(N) "$QA"/*.png(N) "$MOBILE"/*.png(N) "$NATIVE"/*.png(N)
node "$ROOT/validate.js"
node "$ROOT/render.js" "$THEME"
node "$ROOT/validate-rendered.js"
STATIC_IDS=("${(@f)$(node -e "const s=require('$ROOT/$STORY'); console.log(s.slides.filter(x=>x.format==='png').map(x=>x.id).join('\\n'))")}")
ANIM_IDS=("${(@f)$(node -e "const s=require('$ROOT/$STORY'); console.log(s.slides.filter(x=>x.format==='mp4').map(x=>x.id).join('\\n'))")}")
for id in $STATIC_IDS; do rsvg-convert -w 1080 -h 1350 "$SVG/$id.svg" -o "$OUT/$id.png"; done
for id in $ANIM_IDS; do
  FPS=$(node -e "const d=require('$ROOT/config/design-system.json').motion,s=require('$ROOT/$STORY').slides.find(x=>x.id==='$id'); console.log(s.motion?.fps||d.fps)")
  for f in "$FRAMES"/$id-*.svg; do o="$PNG/${f:t:r}.png"; rsvg-convert -w 1080 -h 1350 "$f" -o "$o"; done
  ffmpeg -y -hide_banner -loglevel error -framerate "$FPS" -i "$PNG/$id-%03d.png" -c:v libx264 -pix_fmt yuv420p -movflags +faststart "$OUT/$id.mp4"
  FRAME_COUNT=$(find "$PNG" -maxdepth 1 -name "$id-*.png" | wc -l | tr -d ' ')
  LAST=$((FRAME_COUNT-1))
  cp "$PNG/$id-$(printf '%03d' $LAST).png" "$OUT/$id-poster.png"
  for pct in 0 25 50 75 100; do idx=$((LAST*pct/100)); cp "$PNG/$id-$(printf '%03d' $idx).png" "$QA/$id-$pct.png"; done
  magick montage "$QA/$id-0.png" "$QA/$id-25.png" "$QA/$id-50.png" "$QA/$id-75.png" "$QA/$id-100.png" -thumbnail 216x270 -tile 5x1 -geometry +8+8 -background '#C8C8C8' "$QA/$id-motion-strip.png"
done
PREVIEWS=()
ALL_IDS=("${(@f)$(node -e "const s=require('$ROOT/$STORY'); console.log(s.slides.map(x=>x.id).join('\\n'))")}")
for id in $ALL_IDS; do
  if (( ${STATIC_IDS[(Ie)$id]} )); then PREVIEWS+=("$OUT/$id.png"); else PREVIEWS+=("$OUT/$id-poster.png"); fi
done
for f in $PREVIEWS; do
  magick "$f" -resize 360x450 "$MOBILE/${f:t:r}-mobile.png"
  magick "$f" -crop 1080x190+0+1160 +repage "$QA/${f:t:r}-footer.png"
  # Native-scale overlapping bands expose overflow hidden by reduced contact sheets.
  magick "$f" -crop 1080x520+0+0 +repage "$NATIVE/${f:t:r}-top.png"
  magick "$f" -crop 1080x520+0+415 +repage "$NATIVE/${f:t:r}-middle.png"
  magick "$f" -crop 1080x520+0+830 +repage "$NATIVE/${f:t:r}-bottom.png"
done
magick montage $PREVIEWS -thumbnail 270x338 -tile 4x -geometry +12+12 -background '#D0D0D0' "$OUT/contact-sheet.png"
magick montage "$MOBILE"/*.png(N) -tile 4x -geometry +8+8 -background '#D0D0D0' "$QA/mobile-contact-sheet.png"
node -e "const fs=require('fs'),s=require('$ROOT/$STORY'); const h=['# Layout Audit','','Inspect native-scale crops at 100%. Replace every PENDING value with PASS or FAIL. Any FAIL or PENDING blocks delivery.','','| Slide | Text containment | Text collisions | Connector clearance | Safe area | Animation states |','|---|---|---|---|---|---|',...s.slides.map((x,i)=>'| '+String(i+1).padStart(2,'0')+' '+x.id+' | PENDING | PENDING | PENDING | PENDING | '+(x.format==='mp4'?'PENDING':'N/A')+' |'),'']; fs.writeFileSync('$QA/layout-audit.md',h.join('\\n'))"
echo "Built $OUT with theme: $THEME"
