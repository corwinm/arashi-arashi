#!/usr/bin/env bash
set -euo pipefail

printf '%s\n' '***'
CI=true corepack pnpm install --frozen-lockfile
printf '%s\n' '***'
