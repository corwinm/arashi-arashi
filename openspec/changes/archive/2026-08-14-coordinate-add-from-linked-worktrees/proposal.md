## Why

Running `arashi add` from a linked parent worktree currently clones the new child only into that feature workspace and leaves it on the child's default branch. This breaks the coordinated topology: the parent main checkout has no canonical child source clone, while the active parent worktree has a child on the wrong branch.

## What Changes

- Resolve the active parent execution root and its canonical main worktree through Git topology when `add` runs in a configured non-bare workspace.
- From a linked parent worktree, clone the new child under the canonical parent checkout on the child's default branch, then create a linked child worktree under the active parent on the coordinated parent branch.
- Persist the new repository entry only in the active parent worktree's `.arashi/config.json`, so the configuration change remains part of the current feature branch.
- Preserve current direct-main behavior, configured bare-workspace behavior, configured-only guards, duplicate-name clone fallback, and existing command options.
- Make canonical clone creation, coordinated branch/worktree creation, configuration persistence, setup detection, and scope-aware managed-ignore coverage one ownership-aware rollback transaction; tracked scope fails before mutation when the canonical checkout is not already protected.
- Extend human and JSON results to distinguish the canonical clone, active child worktree, default branch, and coordinated branch.
- Update canonical CLI/docs/skills guidance and deterministic cross-repository checks for the linked-worktree workflow.

## Capabilities

### New Capabilities

- `coordinated-add-materialization`: Defines topology resolution, canonical cloning, active child worktree creation, active-branch config persistence, branch behavior, safety, and rollback for `arashi add`.

### Modified Capabilities

- `managed-git-ignore-reconciliation`: Extends `add` reconciliation and rollback semantics across the canonical clone and active linked child worktree.
- `machine-readable-cli-output`: Defines the exact structured `add --json` path and branch roles while preserving the single-envelope, stdout-isolation contract.

## Impact

- CLI source: `repos/arashi/src/commands/add.ts`, shared workspace/Git/worktree helpers, add error classification, and output contracts.
- CLI tests: real non-bare main/linked/nested Git topologies, remote-tracking/create-from-default branch behavior, conflict and rollback fixtures, JSON/human output, duplicate fallback, and bare-workspace regression coverage.
- Companion surfaces: CLI docs, website workflow/command guidance and generated agent exports, packaged Arashi skill guidance, generated command contracts, and meta cross-repository semantic checks.
- No configuration-schema field or new CLI option is introduced.

Tracks #276.
