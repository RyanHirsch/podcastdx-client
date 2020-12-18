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

yarn typescript-json-schema ./tsconfig.json --noExtraProps \
  ApiResponse.Categories \
  -o src/schemas/v1/categories-list.json

yarn typescript-json-schema ./tsconfig.json --noExtraProps \
  ApiResponse.Search \
  -o src/schemas/v1/search-byterm.json
