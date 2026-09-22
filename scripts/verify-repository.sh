#!/bin/sh
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
SKILL="$ROOT/.agents/skills/editorial-carousel-studio"

python3 - "$SKILL/SKILL.md" <<'PY'
import pathlib
import sys
import yaml

path = pathlib.Path(sys.argv[1])
text = path.read_text(encoding="utf-8")
if not text.startswith("---\n"):
    raise SystemExit("SKILL.md is missing YAML frontmatter")
_, frontmatter, _ = text.split("---", 2)
data = yaml.safe_load(frontmatter)
for key in ("name", "description"):
    if not data.get(key):
        raise SystemExit(f"SKILL.md is missing {key}")
if data["name"] != "editorial-carousel-studio":
    raise SystemExit("Unexpected skill name")
print("Skill frontmatter: OK")
PY

zsh -n "$SKILL/scripts/new_project.sh"
zsh -n "$SKILL/assets/renderer-template/build.sh"
zsh -n "$SKILL/assets/renderer-template/build-theme-samples.sh"

find "$SKILL" -name '*.js' -type f -print | while IFS= read -r file; do
  node --check "$file"
done

if grep -R -n -E '/Users/|/home/[^/]+|Downloads/|Desktop/' "$SKILL"; then
  echo "Personal absolute path detected" >&2
  exit 1
fi

echo "Repository validation: OK"

