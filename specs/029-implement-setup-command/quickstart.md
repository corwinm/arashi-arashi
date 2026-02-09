# Quickstart: Setup Command

## Goal

Run setup tasks across the workspace in one command, with optional repository filtering and clear status reporting.

## Prerequisites

1. Workspace is initialized and has a valid `.arashi/config.json`.
2. One or more repositories define setup tasks.
3. You are at the workspace root.

## Steps

1. Run setup for the full workspace.
2. Confirm output shows progress and per-repository timing.
3. Run setup with repository filtering to execute only selected repositories.
4. Run setup in verbose mode to inspect full setup task output.
5. Introduce a controlled failing or slow setup task and confirm failure/timeout classification.

## Expected Results

- Main repository setup executes before sub-repository setup when both exist.
- Repositories without setup tasks are clearly reported as skipped.
- Verbose mode displays full setup task output.
- Summary includes counts for successful, skipped, failed, and timed-out repositories.
