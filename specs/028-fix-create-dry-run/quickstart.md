# Quickstart: Fix create --dry-run

## Goal

Validate that `create --dry-run` previews planned worktrees and conflicts without making changes.

## Steps

1. From a configured workspace, run the dry-run command with the same inputs you would use for create.
2. Review the output to confirm it lists planned worktrees/branches, conflicts, and the actionable/blocked status.
3. Verify no worktrees or branches were created by checking the workspace state.
4. Optionally run a real create in a disposable test workspace and confirm the plan matches the dry-run output.

## Expected Results

- The output clearly indicates whether the plan is actionable or blocked.
- No filesystem or git state changes occur during dry-run.
