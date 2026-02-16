# Quickstart: Fix child-repo create hook execution

## Goal

Verify that `arashi create <branch>` executes and reports hooks consistently from both workspace root and child repository invocation paths.

## Prerequisites

1. Workspace with:
   - one main repository,
   - at least one managed child repository under `repos/`,
   - post-create hooks configured in `.arashi/hooks/`.
2. Arashi CLI built and runnable in local environment.
3. A test branch name that does not conflict with existing worktrees.

## Validation Steps

1. From workspace root, run `arashi create feature-hook-root-baseline` and record hook outcomes.
2. Remove test worktrees or use a second branch name.
3. Change directory into `repos/arashi` (or another managed child repo) and run `arashi create feature-hook-child-run`.
4. Confirm the child-invoked run reports hook outcomes for every targeted repository.
5. Configure one repository hook to fail intentionally and re-run create from child repo.
6. Confirm output identifies failing repository/hook and provides actionable recovery guidance.
7. Configure one hook timeout scenario and re-run create.
8. Confirm timeout is reported explicitly and operation follows rollback policy.

## Expected Results

- Root and child invocations produce equivalent repository hook coverage.
- Each targeted repository has a visible terminal hook status: `success`, `failure`, or `skipped`.
- Hook failure or timeout includes repository-specific, actionable guidance.
- No repository executes the same post-create hook more than once per create command run.
- Failed create runs do not leave partial worktree state behind.
