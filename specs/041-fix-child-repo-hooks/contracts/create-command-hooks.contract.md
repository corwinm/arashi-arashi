# CLI Contract: `arashi create` hook behavior parity

## Command Syntax

```bash
arashi create <branch-name> [options]
```

## Relevant Options

- `--no-hooks`: Bypass lifecycle hook execution.
- `--json`: Emit machine-readable output.
- `--dry-run`: Preview actions without mutating repositories.
- `--conflict <strategy>`: Define conflict handling strategy for existing worktrees/branches.

## Behavioral Contract

1. Invocation from workspace root and managed child repository paths MUST use the same workspace context for hook lookup.
2. For each targeted repository hook evaluated in a create run, hook reporting MUST produce one terminal status: `success`, `failure`, or `skipped`.
3. Hook failures or timeouts MUST include repository-specific recovery guidance.
4. Any create run that fails after partial changes MUST indicate rollback status.
5. A repository MUST NOT execute the same post-create hook more than once per create command invocation.

## Expected Human-Readable Output (Shape)

```text
Creating coordinated worktrees for branch <branch-name>...
Hook results:
- <repo-a>: pre-create.repo-a -> success
- <repo-a>: post-create.repo-a -> success
- <repo-b>: pre-create.repo-b -> skipped (not_found)
- <repo-c>: post-create.repo-c -> failure (timeout)
Create result: failure (rollback applied)
```

## Expected JSON Output (Shape)

```json
{
  "branchName": "feature-x",
  "overallOutcome": "failure",
  "rollbackApplied": true,
  "repositoryResults": [
    {
      "repositoryId": "arashi",
      "hookName": "pre-create.arashi",
      "hookStatus": "skipped",
      "reasonCode": "not_found",
      "message": "Hook script not found"
    },
    {
      "repositoryId": "arashi",
      "hookName": "post-create.arashi",
      "hookStatus": "success",
      "reasonCode": "none",
      "message": "Hook completed"
    },
    {
      "repositoryId": "arashi-skills",
      "hookName": "post-create",
      "hookStatus": "failure",
      "reasonCode": "timeout",
      "message": "Hook timed out after configured limit"
    }
  ],
  "nextSteps": [
    "Inspect hook output for arashi-skills",
    "Re-run create after resolving timeout condition"
  ]
}
```
