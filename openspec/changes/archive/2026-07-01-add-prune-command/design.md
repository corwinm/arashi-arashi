## Context

`arashi remove` discovers worktrees by running `git worktree list --porcelain` in each configured repository and parsing the result. Git can include prunable records in this output when the worktree path no longer exists or the metadata is otherwise stale. The current parser keeps the path and branch but ignores Git's `prunable` marker, so stale records can be offered as removable worktrees.

Git already owns the cleanup primitive via `git worktree prune`, so Arashi should expose a coordinated wrapper rather than asking users to run per-repository Git commands manually.

## Goals / Non-Goals

**Goals:**

- Provide a first-class `arashi prune` command for stale Git worktree metadata across the main repo and configured child repos.
- Keep `arashi remove` from presenting or acting on prunable worktree records.
- Make prune operations observable before mutation via dry-run output and scriptable via JSON.
- Preserve existing remove semantics for valid worktrees, including hooks, force behavior, branch deletion, and confirmation.
- Document the maintenance split: `remove` deletes real coordinated worktrees; `prune` cleans stale Git metadata.

**Non-Goals:**

- Automatically deleting real worktree directories that still exist.
- Pruning unrelated Git references, remote branches, or Arashi configuration entries.
- Changing the layout of coordinated worktrees or the `arashi create` flow.

## Decisions

### Use Git's worktree metadata as the source of truth

Arashi will continue to inspect `git worktree list --porcelain` for discovery. The parser should recognize `prunable <reason>` records and carry that state in the internal worktree model. This lets `remove` filter stale entries before presenting choices or matching branch/path targets, while allowing `prune` to report exactly what Git considers stale.

Alternative considered: infer stale entries solely with filesystem existence checks. That is insufficient because Git already provides a reason string and expiry behavior, and filesystem checks alone do not model Git's pruning rules.

### Implement prune as an explicit command with dry-run support

`arashi prune` should support a non-mutating dry run (for example `--dry-run`) and a mutating mode that runs `git worktree prune` for selected repositories. Human output should summarize per-repository prunable entries and cleanup results; JSON output should produce a single structured envelope for automation.

Alternative considered: silently run prune before `remove`. That would hide a maintenance action inside a destructive command, make automation less predictable, and obscure the issue user's original request calls out.

### Keep remove behavior conservative

`arashi remove` should not show or remove prunable entries. If a user explicitly targets a branch or path that resolves only to prunable entries, the command should explain that the target is stale/prunable and suggest `arashi prune` rather than attempting removal. This avoids confusing `git worktree remove` failures while preserving user intent.

### Update companion docs with implementation

Because this introduces a user-facing command and changes command selection behavior, implementation should include docs-site command reference updates and any relevant agent/workflow guidance.

## Risks / Trade-offs

- [Risk] Git prune output differs across Git versions. → Mitigation: base detection on `git worktree list --porcelain` prunable records where possible, and keep command execution tolerant of empty output.
- [Risk] A worktree could become valid or invalid between dry-run discovery and prune execution. → Mitigation: run Git's prune command at execution time and report per-repository results instead of assuming dry-run state is authoritative.
- [Risk] Filtering prunable entries from remove could surprise users who previously saw them there. → Mitigation: provide a clear message directing stale metadata cleanup to `arashi prune`.
