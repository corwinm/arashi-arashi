#!/usr/bin/env bash
set -euo pipefail

# Corwin's Vite+ toolchain supplies the Node 24 runtime required by this child.
if [[ -x "$HOME/.vite-plus/bin/node" ]]; then
  export PATH="$HOME/.vite-plus/bin:$PATH"
fi

printf '%s\n' '***'
CI=true corepack pnpm install --frozen-lockfile --config.strict-dep-builds=false
corepack pnpm exec playwright install chromium
printf '%s\n' '***'
