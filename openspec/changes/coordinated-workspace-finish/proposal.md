## Why

Issue [#374](https://github.com/corwinm/arashi-arashi/issues/374) asks for a single answer to whether a coordinated feature workspace is finished across independently versioned repositories and may be removed. `remove` knows how to delete a coordinated worktree safely but does not establish completion; treating absence of a PR, a deleted remote branch, or a successful cleanup plan as proof of integration would lose work.

## What Changes

- Add configured-workspace-only `aw finish [target]`, with exact contextual selection or an interactive main-workspace picker, a repository-by-repository completion assessment, and an optional coordinated cleanup handoff.
- Refresh remote evidence in disposable Git storage and compare each participant with its **currently configured effective base** (not an inferred creation base). Omitted policy remains unknown in preview; interactive execution can name a per-repository target. Exact Git ancestry may prove integration. Attempt `gh` for verifiable correlation, but do not claim unavailable historical merge-time head proof; otherwise offer grouped manual completion.
- Separate main-workspace picker selection from nonmutating preview: the picker may select, but preview never asks cleanup/policy/completion questions or runs hooks. Require separate completion judgment and dirty/unpublished discard consent on execution. `--force` covers discard and ordinary remove confirmation only, never completion. JSON/non-TTY cannot manually confirm completion in v1.
- Preview exact remove operations and reuse existing remove behavior with a narrow finish-specific post-`pre-remove` pre-mutation gate and safe result projection. Do not introduce a universal cross-command lock or refactor create/prune/add/delete; document the residual external and concurrent-command race.
- Document the meaning and limits of completion in CLI docs, canonical docs and packaged skill guidance; update generated command contracts and shell completion as appropriate.

## Capabilities

### New Capabilities

- `coordinated-workspace-finish`: Selection, evidence, policy, preview, confirmations, report, revalidation and remove handoff.

### Modified Capabilities

- `coordinated-worktree-removal`: Minimal internal action/result exposure and finish-only pre-mutation callback; ordinary remove semantics stay unchanged.
- `machine-readable-cli-output`: Stable finish JSON report and error/exit contract.

## Impact

- `repos/arashi`: future CLI implementation, Git/GitHub evidence adapters, shared remove gate, tests and CLI command documentation (not implemented in this change).
- `repos/arashi-docs`, `repos/arashi-skills`: future workflow and evidence guidance; meta-repo command contracts/completion checks as needed. Changes in each child require separate commits/PRs referencing #374 and reciprocal cross-links. This proposal is **design only** and changes no child repository.

## Non-goals

No remote pushes, rebases, merges, PR creation/approval/merge, remote branch deletion, agent/session management, historical creation-base reconstruction, non-GitHub forge auto-proof, or replacement of general `status`, `remove`, or `prune`.
