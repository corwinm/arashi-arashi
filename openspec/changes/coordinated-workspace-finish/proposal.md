## Why

Issue [#374](https://github.com/corwinm/arashi-arashi/issues/374) asks for a single answer to whether a coordinated feature workspace is finished across independently versioned repositories and may be removed. `remove` knows how to delete a coordinated worktree safely but does not establish completion; treating absence of a PR, a deleted remote branch, or a successful cleanup plan as proof of integration would lose work.

## What Changes

- Add configured-workspace-only `aw finish [target]`, with exact contextual selection or an interactive main-workspace picker, a repository-by-repository completion assessment, and an optional coordinated cleanup handoff.
- Refresh remote evidence, compare each participant with its **currently configured effective base** (not an inferred creation base), and support exact Git ancestry or tightly correlated merged GitHub PR evidence. Report failed/unavailable evidence as unknown, not merged.
- Permit one interactive manual-completion confirmation for all unknown participants; require separate explicit discard consent for dirty/unpublished work. `--force` covers discard only, never completion. JSON and non-TTY callers cannot provide manual completion in v1.
- Preview assessment and the actual `remove` operation plan before any destructive mutation; preserve `remove` hooks, ordering, branch retention, concurrency and partial-failure behavior. Add a post-`pre-remove` finish evidence gate inside the remove boundary rather than assuming remove's existing descendant-only gate is sufficient.
- Document the meaning and limits of completion in CLI docs, canonical docs and packaged skill guidance; update generated command contracts and shell completion as appropriate.

## Capabilities

### New Capabilities

- `coordinated-workspace-finish`: Selection, evidence, policy, preview, confirmations, report, revalidation and remove handoff.

### Modified Capabilities

- `coordinated-worktree-removal`: A narrowly scoped caller-supplied pre-mutation validation gate; default remove semantics stay unchanged.
- `machine-readable-cli-output`: Stable finish JSON report and error/exit contract.

## Impact

- `repos/arashi`: future CLI implementation, Git/GitHub evidence adapters, shared remove gate, tests and CLI command documentation (not implemented in this change).
- `repos/arashi-docs`, `repos/arashi-skills`: future workflow and evidence guidance; meta-repo command contracts/completion checks as needed. Changes in each child require separate commits/PRs referencing #374 and reciprocal cross-links. This proposal is **design only** and changes no child repository.

## Non-goals

No remote pushes, rebases, merges, PR creation/approval/merge, remote branch deletion, agent/session management, historical creation-base reconstruction, non-GitHub forge auto-proof, or replacement of general `status`, `remove`, or `prune`.
