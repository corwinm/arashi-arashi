## Context

Arashi coordinates a parent repository and child repositories through matching worktrees. Today, if a user edits files before creating a coordinated worktree, they must manually copy changes, use ad hoc Git stash commands in each repository, or abandon the normal Arashi flow. The issue asks for two related workflows:

- `arashi create` can create a worktree and take current uncommitted changes with it.
- `arashi move` can move uncommitted changes between existing coordinated workspaces, prompting for source or target when not provided.

The main technical constraint is that "uncommitted changes" are repository-local while an Arashi workspace spans multiple repositories. The implementation must coordinate parent and child repositories, include only repositories present in both source and target workspaces, and avoid losing work if a target cannot accept the changes.

## Goals / Non-Goals

**Goals:**

- Provide a safe `arashi move` command for moving uncommitted tracked and untracked changes between coordinated workspaces.
- Support explicit source/target arguments plus interactive source/target selection when needed.
- Add a create-time flag that moves compatible changes from the current workspace to the newly created workspace.
- Add helpful post-create guidance when the current workspace is dirty and the user did not request a move.
- Keep behavior consistent across the parent repository and matching child repositories.
- Prefer recoverable Git-native operations, with clear failures and rollback/recovery guidance.

**Non-Goals:**

- Moving committed changes or rewriting branch history.
- Moving ignored files by default.
- Automatically resolving merge conflicts when a patch cannot apply to the target worktree.
- Moving changes between unrelated Arashi workspaces or repositories with no shared configured identity.
- Replacing general-purpose Git stash/cherry-pick workflows outside coordinated Arashi workspaces.

## Decisions

### Use Git stash as the transfer primitive

For each matched repository, Arashi will create a named temporary stash from the source worktree with tracked and untracked changes, apply it in the target worktree with index restoration when possible, and drop the stash only after the target apply succeeds.

Rationale:

- Git already understands tracked modifications, staged state, deletions, renames, and untracked files.
- Worktrees for the same repository share the underlying Git repository, so a stash created in one worktree can be applied in another.
- Keeping the stash until apply succeeds gives users a recoverable handle if a move cannot complete.

Alternatives considered:

- Raw patch files: simpler to inspect but weaker for untracked files, staged state, binary content, and deletions.
- Filesystem copy/delete: unsafe for renames/deletions and bypasses Git conflict detection.
- Commit-and-cherry-pick: would create history artifacts for explicitly uncommitted work.

### Preflight before mutating

Before stashing anything, Arashi will resolve the source/target workspaces, discover matching repositories, detect dirty state, and check that target repositories are clean enough to receive changes. Repositories with no source changes are skipped. Repositories missing from either workspace are reported and skipped rather than treated as fatal when at least one repository can move.

Rationale:

- Users may have partial coordinated workspaces.
- A target that already has changes introduces ambiguity about ownership and conflict recovery.
- Preflight avoids partial moves when there is no viable work.

### Transaction-style rollback for multi-repo moves

A multi-repo move will preserve stash refs until all target applies succeed. If a later repository fails, Arashi will attempt to restore already-stashed changes back to their source worktrees and leave any unresolved stash refs with explicit recovery commands.

Rationale:

- The safest user expectation for "move" is that changes end up in exactly one place.
- Multi-repo moves can fail halfway due to branch divergence or filesystem conflicts.
- Full atomicity is not guaranteed by Git, but named stashes plus rollback attempts make failures recoverable.

### Source and target arguments identify coordinated workspaces

`arashi move` will accept source and target as branch names, worktree names, or paths using the same worktree resolution concepts as `arashi switch`/`arashi remove`. If run from a dirty workspace without arguments, the current workspace is the default source and the user selects the target. If run from a clean workspace without a source, the user selects the dirty source and then the target.

Rationale:

- This matches the issue's desired interactive behavior.
- It supports both "move from here to there" and "pull changes from another workspace into here" flows.
- Reusing existing worktree discovery keeps labels and branch/path matching consistent.

### Create-time movement is explicit

`arashi create <branch> --move-changes` will create the coordinated worktree and then move compatible uncommitted changes from the current workspace into the new worktree. Without the flag, dirty source workspaces will not be changed; instead, successful create output will include a concise follow-up command such as `arashi move --to <branch>`.

Rationale:

- Existing create behavior remains non-destructive by default.
- Users who forgot to create the worktree get immediate guidance.
- The explicit flag gives a one-command path when the user knows they want to carry changes forward.

## Risks / Trade-offs

- [Risk] Git stash apply can fail because target branch contents diverge from source. → Mitigation: preflight clean targets, keep named stash refs until success, print recovery commands, and avoid dropping stashes on failed applies.
- [Risk] Multi-repo moves can partially apply before an error. → Mitigation: transaction-style ordering, rollback attempts for previously moved repos, and a detailed final summary of moved/restored/manual-recovery repos.
- [Risk] Interactive source/target prompts can accidentally choose the wrong workspace. → Mitigation: display branch, path, dirty summary, and repository count in prompt labels; require explicit confirmation for destructive move plans.
- [Risk] Untracked files ignored by Git stash defaults may surprise users. → Mitigation: include untracked files by default and document that ignored files are excluded unless a future flag adds support.
- [Risk] Applying with `--index` can fail even when working-tree apply would succeed. → Mitigation: try `git stash apply --index` first to preserve staging, then fail with a clear message rather than silently changing staged/unstaged intent unless a deliberate fallback option is introduced.
