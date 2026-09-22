#!/bin/zsh
set -euo pipefail
if [[ $# -ne 1 ]]; then
  echo "Usage: new_project.sh <destination>" >&2
  exit 2
fi
SCRIPT_DIR=${0:A:h}
SKILL_DIR=${SCRIPT_DIR:h}
DEST=$1
if [[ -e "$DEST" ]]; then
  echo "Destination already exists: $DEST" >&2
  exit 3
fi
mkdir -p "${DEST:h}"
cp -R "$SKILL_DIR/assets/renderer-template" "$DEST"
echo "Created carousel project: $DEST"
