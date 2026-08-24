## Why

`aw add <git-url>` registers and materializes a repository dependency, but Arashi has no first-class inverse. Deleting one currently requires coordinated manual edits and Git/filesystem cleanup that can leave orphaned worktrees, stale metadata, or unrelated hook/configuration damage.

## What Changes

- Add a distinct destructive `aw delete <repository>` command for configured repository dependencies; keep `aw remove` dedicated to branch/worktree removal.
- Add a reusable read-only deletion planner that resolves the active configuration authority, canonical child clone, every owned linked worktree and local branch, repository-targeted workspace hook files/templates, and preserved user-global hook guidance.
- Add interactive confirmation, fail-closed non-TTY behavior, `--force`, `--dry-run`, and stable one-document `--json` plans/results.
- Enforce canonical Git topology, containment, symlink, repository-identity, dirty/unpublished-work, hook-ambiguity, and concurrent-configuration safety before mutation; `--force` bypasses only confirmation and Git data-loss guards.
- Execute deterministic deepest-first removal with refreshed identity checks and a phase ledger that makes partial failure and retry state explicit; remove configuration only after repository/worktree deletion succeeds.
- Synchronize CLI help/contracts/completions, CLI and website command/workflow docs and generated exports, packaged agent guidance, and coordinated semantic validation.

## Capabilities

### New Capabilities

- `configured-repository-deletion`: Planning, confirmation, safety, execution ordering, partial failure, retry, and topology behavior for deleting one configured repository dependency.

### Modified Capabilities

- `machine-readable-cli-output`: Define the exact sanitized `delete` plan/result/error envelope and stdout-isolation behavior.
- `cross-repo-command-contracts`: Publish and enforce `delete` command semantics and companion coverage from the CLI-derived contract.
- `shell-completions`: Complete configured repository keys and the registered `delete` options without mutating or broadly probing the workspace.
- `docs-workflow-guidance-sections`: Add proportionate canonical deletion and recovery guidance and keep generated exports aligned.
- `arashi-skill-guidance`: Teach agents to preview and execute repository deletion safely from the smallest installed reference.

## Impact

- CLI repository: command registration, planner/executor, Git/config/hook safety helpers, typed contracts, generated command/completion artifacts, tests, README, and command docs.
- Docs repository: delete command/workflow pages, navigation/index coverage, generated Markdown/LLM exports, and semantic validation.
- Skills repository: focused configured-workspace guidance plus source/package semantic validation.
- Meta repository: OpenSpec artifacts and coordinated CLI/docs/skills contract enforcement.
- No remote repository or remote branch is deleted; no standalone/zero-config deletion is added; tracked configuration in other parent worktrees or historical branches remains unchanged.
