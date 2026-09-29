#!/usr/bin/env bash
set -euo pipefail

printf '%s\n' '***'
CI=true pnpm install --frozen-lockfile
printf '%s\n' '***'
