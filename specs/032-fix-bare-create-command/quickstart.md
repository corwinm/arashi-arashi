# Quickstart: Fix create command in bare repositories

## Goal

Verify that `arashi create <branch>` works from both bare repository roots and regular worktree directories, with clear guidance for missing setup.

## Prerequisites

1. A test workspace containing:
   - one bare main repository,
   - at least one non-bare worktree attached to that bare repository,
   - `.arashi/config.json` available through workspace configuration.
2. Arashi CLI built and runnable locally.

## Validation Steps

1. Run create from a regular worktree directory and capture baseline behavior/output.
2. Run the same create request from the bare repository root.
3. Confirm the bare-root run succeeds and creates equivalent worktree results.
4. Run create from a bare repository where workspace configuration is not available.
5. Confirm the command fails with actionable recovery guidance rather than an ambiguous internal error.
6. Run a conflict case (existing branch/worktree name) from bare root and verify conflict reporting remains consistent.

## Expected Results

- Bare-root invocation no longer fails with a false local config-not-found error.
- Non-bare invocation behavior remains unchanged.
- Missing setup errors include specific next actions (for example, run `arashi init` from a checked-out worktree).
- Conflict errors include a concrete retry path (for example, `--conflict REUSE_EXISTING` or using a new branch name).
- Failure paths do not leave partial worktree artifacts.
