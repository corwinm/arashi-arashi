#!/usr/bin/env bash

echo "***"

pnpm install --ignore-workspace --frozen-lockfile
pnpm --ignore-workspace run build

echo "***"
