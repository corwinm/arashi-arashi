## Why

Arashi has two tracked specification systems: 326 completed or stale Spec Kit artifacts under `specs/` plus active OpenSpec capability baselines under `openspec/`. The duplication leaves durable early contracts scattered outside the maintained system while obsolete Spec Kit commands and docs still direct contributors toward a retired workflow.

## What Changes

- Audit all 39 numbered Spec Kit directories and port only durable, still-current behavior that lacks an OpenSpec owner.
- Add baseline OpenSpec capabilities for core behavior that later incremental changes assumed but never fully canonicalized.
- Remove the legacy `specs/` tree, `.specify/` toolkit, and `/speckit.*` OpenCode commands after coverage is recorded.
- Update root onboarding and process documentation so OpenSpec is the only active specification workflow.
- Align the CLI repository's canonical contribution pointer so it no longer advertises the removed Spec Kit process.
- Add a structural regression check that prevents the retired Spec Kit workflow from being reintroduced as an active tracked surface.

## Capabilities

### New Capabilities

- `cli-interaction-conventions`: Define shared terminal color/capability behavior and cancellation/interrupt semantics retained from the legacy logger and prompt contracts.
- `coordinated-create`: Define baseline repository selection, branch-conflict preflight, coordinated execution, rollback, and per-repository results for `aw create`.
- `documentation-site`: Define the public docs repository, canonical domain, validated default-branch publication, cross-surface branding, and resilient cross-browser landing-page media baseline.
- `list-command`: Define worktree discovery and the simple, table, verbose, and JSON output contracts for `aw list`.
- `project-ci`: Define pull-request/main quality gates, supported-platform build validation, and required CI reporting.
- `release-workflow`: Define semantic-release versioning, metadata, complete supported artifacts, GitHub release, and npm publication baselines.
- `setup-command`: Define setup target discovery, ordering, repository/group selection, timeout/failure continuation, and summary reporting for `aw setup`.
- `specification-workflow`: Define OpenSpec as the sole active meta-repository specification system and prohibit retired Spec Kit workflow assets.
- `sync-command`: Define parent-branch alignment, branch creation, repository/group selection, continuation, and results for `aw sync`.
- `workspace-configuration`: Define shared configuration loading, validation, unknown-field preservation, and human-readable persistence behavior.

### Modified Capabilities

- `coordinated-add-materialization`: Add the baseline URL/name validation, duplicate prevention, clone/default-branch discovery, configuration persistence, and failure cleanup contract that precedes topology-specific materialization.
- `meta-repo-readme-openspec-guidance`: Replace “legacy artifacts remain” framing with the post-consolidation OpenSpec-only repository layout and workflow.
- `status-command`: Preserve the baseline default, verbose, and compact status views and their aggregate/error behavior.

## Impact

- Meta-repository content: `openspec/`, `README.md`, `CONTRIBUTING.md`, `docs/`, `.gitignore`, `.opencode/command/`, `.specify/`, `specs/`, and focused structural tests.
- CLI repository companion content: `CONTRIBUTING.md` and a focused documentation regression test.
- No Arashi CLI runtime behavior changes are intended; new canonical requirements describe verified existing behavior.
- The deletion is a tracked-source cleanup, not history loss: all removed artifacts remain available through Git history.
- Tracks `corwinm/arashi-arashi#337`.
