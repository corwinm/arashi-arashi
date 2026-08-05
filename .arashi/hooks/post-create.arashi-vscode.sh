#!/usr/bin/env bash
set -euo pipefail

printf '%s\n' '***'
CI=true corepack pnpm --ignore-workspace install --frozen-lockfile
printf '%s\n' '***'
