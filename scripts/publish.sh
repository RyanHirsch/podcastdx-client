#!/usr/bin/env bash
set -euo pipefail

SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
PROJECT_DIR="$( cd "${SCRIPTS_DIR}" && cd .. && pwd )"

if [[ -f "${PROJECT_DIR}/.env" ]]; then
  set -o allexport
  source "${PROJECT_DIR}/.env"
  set +o allexport
fi

cd $PROJECT_DIR
PACKAGE_VERSION=$(cat package.json | grep \\\"version\\\" | head -1 | awk -F: '{ print $2 }' | sed 's/[\",]//g' | tr -d '[[:space:]]')

if [ -z "$(git diff --exit-code src/ && git diff --exit-code --cached src/ )" ]; then
  yarn typedoc -out docs src
  git add docs/
  git add package.json
  git commit -m "documentation update for $PACKAGE_VERSION"
  git push
else
  echo "Please ensure everything is checked in before doing a publish"
  exit 1
fi
