## Context

The switch executor already carries the selected candidate's branch, repository name, and absolute worktree path through both successful behavior paths. The defect is limited to how those values are ordered and labeled in human output.

## Goals / Non-Goals

**Goals:**

- Put the selected branch first in every successful switch message.
- Retain repository identity with an explicit `repository` label.
- Use one shared target formatter for launch and parent-shell directory-switch output.
- Pin the exact messages with focused tests.

**Non-Goals:**

- Change candidate discovery, selection, launch resolution, shell directives, or paths.
- Change JSON behavior, CLI options, configuration, or launcher-specific behavior.
- Rename repository identities or infer a new workspace name.

## Decisions

### Format switch targets once

Add a small formatter that renders a candidate as:

```text
<branch> in repository <repository> at <absolute-path>
```

Launch output prefixes that target with `Opened <mode> context for`. Parent-shell output prefixes it with `Prepared shell directory switch to`.

This keeps the selected branch primary while preserving repository disambiguation for coordinated workspaces. Explicitly labeling the repository is preferred over retaining parentheses because parentheses do not explain what the leading value represents. Omitting repository identity entirely was rejected because branches can overlap across child repositories.

### Test through the switch executor

Focused tests will invoke `executeSwitch` with existing injected discovery/launch dependencies and capture human output. This verifies the public message at the call sites rather than testing a formatter in isolation.

## Risks / Trade-offs

- [Exact output changes may affect scripts parsing human text] → Human output is not a structured interface; `switch --json` remains unsupported and unchanged. Keep the change limited to the success line.
- [Repository labels remain surprising in unusual workspace layouts] → The explicit `repository` label prevents them from being mistaken for the selected worktree, while the selected branch and absolute path remain authoritative.
