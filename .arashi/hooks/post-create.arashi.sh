#!/usr/bin/env bash
set -euo pipefail

printf '%s\n' '***'
CI=true corepack pnpm --ignore-workspace install --frozen-lockfile
corepack pnpm --ignore-workspace run build
printf '%s\n' '***'
