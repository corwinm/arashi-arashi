## Context

`arashi status` already resolves and refreshes the current branch's upstream tracking ref before parsing `git status`, then renders that divergence on the Branch line. It does not currently compute whether the checked-out branch has fallen behind the repository's default branch, even though Arashi users often work on coordinated feature branches that can quietly drift behind `main` (or another default branch) across multiple repos.

The CLI already has default-branch detection logic in `repos/arashi/src/lib/git.ts` and targeted remote-fetch logic in `repos/arashi/src/lib/git-remote.ts`. This change should build on those patterns instead of introducing an unrelated comparison path. The main constraint is that `arashi status` must remain useful when a repository has no resolvable default branch, is detached, or cannot refresh remote state.

## Goals / Non-Goals

**Goals:**
- Show when the current branch is behind the repository's default branch during `arashi status`.
- Keep the output concise and recognizable, matching the issue's requested `Default: 5 ↓` style.
- Refresh the default-branch ref before comparing so the reported count is not based on stale remote state when a remote target is available.
- Preserve existing repository status behavior when default-branch comparison is not possible.
- Add tests for behind-default output, no-op cases, and comparison fallback behavior.

**Non-Goals:**
- Implement the future bulk command that updates repositories from their default branch.
- Redesign the existing tracking-branch display on the Branch line.
- Add new user-facing flags or configuration for enabling/disabling default-branch comparison in this change.
- Surface a full ahead/behind matrix against both upstream and default branch in every output mode.

## Decisions

### 1. Model default-branch comparison separately from upstream tracking
- **Decision:** Add a dedicated default-branch comparison field to `RepoStatus` rather than overloading `BranchTrackingInfo`.
- **Rationale:** Upstream tracking and default-branch comparison answer different questions: one shows publish/sync state for the current branch, the other shows whether the branch has drifted behind the repo baseline. Keeping them separate avoids confusing the current Branch line and makes formatter logic clearer.
- **Alternatives considered:**
  - Reuse `BranchTrackingInfo` for both upstream and default branch data: rejected because it conflates two different refs and makes output ambiguous.
  - Compute default divergence only in formatters: rejected because fetch/compare failures need structured state from repository status collection.

### 2. Resolve a fetchable default-branch target, then compare `HEAD` against it
- **Decision:** Add or extract a helper that resolves the default branch name together with its compare target, refreshes that ref when possible, and returns a comparison result suitable for status rendering.
- **Rationale:** `getDefaultBranch()` already knows how to infer the branch name, while the remote helpers already know how to do targeted fetches. `arashi status` needs both pieces in one workflow so it can compare `HEAD` to an up-to-date default branch without duplicating resolution logic inside the command.
- **Alternatives considered:**
  - Compare only against the local default branch without fetching: rejected because it can silently report stale results.
  - Always assume `origin/<default-branch>` exists: rejected because some repos may lack `origin` or have incomplete remote refs.

### 3. Display default-branch drift on a dedicated `Default:` line
- **Decision:** Default and verbose output should render default-branch drift as its own line, e.g. `Default: main [↓5]`, instead of overloading the existing Branch line.
- **Rationale:** The Branch line already communicates the current branch and upstream tracking state. A separate line keeps the new signal readable, aligns with the issue's requested `Default:` wording, and leaves room for concise unavailable/warning states when needed.
- **Alternatives considered:**
  - Append default drift to the Branch line: rejected because it mixes two independent comparisons and makes warning states harder to read.
  - Show default drift only in short mode or only when verbose: rejected because the main value is in ordinary `arashi status` usage.

### 4. Show only behind-default counts by default
- **Decision:** The new output should focus on how many commits the current branch is behind the default branch. If the current branch is current with or ahead of the default branch, the `Default:` line can be omitted unless a warning/unavailable state must be shown.
- **Rationale:** Feature branches are usually ahead of the default branch by design, so showing both directions on every repo would create noise. The issue asks specifically for visibility into branches that are behind default.
- **Alternatives considered:**
  - Always show full ahead/behind counts: rejected as too noisy for routine status scans.
  - Show only the default branch name with no count: rejected because the actionable information is the behind count.

### 5. Treat default-branch comparison failures as non-fatal degradation
- **Decision:** If default-branch resolution, refresh, or comparison fails, keep the rest of the repository status intact and surface a concise unavailable/warning state separate from hard repository errors.
- **Rationale:** Users still need local file status and upstream-tracking info even when the extra default-branch comparison cannot be computed.
- **Alternatives considered:**
  - Fail the whole repository status when default comparison fails: rejected because it makes a supplemental signal too disruptive.
  - Omit failures silently: rejected because it can make `no Default line` look the same as `up to date`.

## Risks / Trade-offs

- [Risk] Another per-repository fetch/compare step could slow `arashi status` noticeably. → Mitigation: skip comparison when the repository is detached or already on the default branch, and use a targeted fetch for just the default branch ref.
- [Risk] Default-branch detection may not map cleanly to a remote ref in unusual repositories. → Mitigation: keep the comparison optional and model explicit unavailable states instead of forcing brittle assumptions.
- [Risk] Extra output could make status feel noisier. → Mitigation: only show the `Default:` line when the branch is behind default or when comparison is unavailable and worth surfacing.
- [Risk] Separate warning plumbing for upstream refresh and default comparison may complicate status rendering. → Mitigation: use structured status metadata so formatters branch on small, well-named states instead of parsing strings.

## Migration Plan

1. Add a shared helper for resolving and comparing the default branch target.
2. Extend `RepoStatus` with structured default-branch comparison data.
3. Update default, verbose, and short formatters to render behind-default indicators and unavailable states.
4. Add unit tests for resolution/comparison logic and formatter coverage for new output.
5. Run CLI validation in `repos/arashi` (`bun test`, `bun run lint`, `bun run build`).

Rollback is straightforward: remove the new default-comparison field and formatter output, then restore the prior status-only behavior.

## Open Questions

- Whether the unavailable state should include the default branch name when known (for example `Default: main (unavailable)`) or use a shorter generic warning.
- Whether short output should use `default↓5`, `main↓5`, or another compact token for the new signal.
