## Context

`repos/arashi/src/commands/status.ts` currently derives ahead/behind information from `git status --porcelain=v1 --branch`, which only reflects whatever remote-tracking refs are already present locally. That keeps the command fast, but it means `arashi status` can report stale branch divergence until the user runs a separate fetch.

The CLI already has targeted remote refresh logic in `repos/arashi/src/lib/git-remote.ts` for comparing a branch with its upstream. This change can reuse the same remote/branch resolution pattern instead of introducing a second fetch strategy. The main constraint is that `status` must stay useful in offline or partially authenticated environments; a failed fetch should not erase otherwise valid local file-status information.

Constraints:
- Keep the change scoped to `repos/arashi` unless follow-up review shows docs or skills need command-behavior notes.
- Preserve the existing missing-repository behavior and exit semantics for true repository errors.
- Avoid broad `git fetch --all` behavior that adds unnecessary latency or side effects for every configured remote.

## Goals / Non-Goals

**Goals:**
- Refresh tracked remote refs before calculating branch ahead/behind information during `arashi status`.
- Keep refresh behavior targeted to the repository's resolved tracking remote and branch.
- Preserve local status output when remote refresh fails, while making the stale-remote condition visible to the user.
- Add tests that cover successful fetch refresh, skip behavior for repositories without a usable remote target, and fetch-failure fallback.

**Non-Goals:**
- Changing `arashi status` flags or adding a user-configurable fetch policy in this change.
- Reworking unrelated status formatting or summary behavior.
- Converting all git operations in the CLI to a new abstraction beyond the fetch helper reuse needed here.

## Decisions

1. Reuse targeted remote-resolution and fetch behavior
- Decision: Extract or share a helper that resolves the repository's remote-tracking target and performs a targeted `git fetch --prune <remote> +refs/heads/<branch>:refs/remotes/<remote>/<branch>` before status parsing.
- Rationale: The targeted fetch pattern already exists in `git-remote.ts`, avoids the cost of fetching every remote, and keeps branch-tracking refresh consistent across command paths.
- Alternatives considered:
- Run plain `git fetch` for every repository: simpler, but slower and broader than necessary.
- Keep status read-only and document stale tracking: lowest effort, but does not solve the issue.

2. Treat fetch failures as degradations, not repository status failures
- Decision: Record fetch problems separately from `RepoStatus.error` so `arashi status` can still show local dirty/clean state and any currently available branch data.
- Rationale: Network or credential issues are common and should not make the command unusable when local repository inspection still works.
- Alternatives considered:
- Fail the entire repository status on fetch error: easier to wire into current error handling, but too disruptive.
- Ignore fetch errors silently: keeps output clean, but hides that ahead/behind data may be stale.

3. Skip refresh when no remote-tracking target can be resolved
- Decision: Do not attempt a fetch for missing repositories, detached HEAD states without a resolvable branch target, or repositories with no configured remotes.
- Rationale: These cases cannot produce a meaningful remote refresh and should preserve current local-only behavior.
- Alternatives considered:
- Force a generic remote lookup and fail if none is found: adds noise without improving correctness.

4. Surface warnings in all status output modes without changing exit-on-error semantics
- Decision: Extend status formatting so fetch degradation is visible in default, verbose, and short output, but do not count warnings as hard errors for exit-code purposes.
- Rationale: Users need to know when divergence data may be stale, but automation should only fail on real repository inspection errors.
- Alternatives considered:
- Show warnings only in verbose mode: simpler, but easy to miss in common usage.
- Exit non-zero on warnings: too strict for transient network problems.

## Risks / Trade-offs

- [Risk] Targeted fetch adds network latency to `arashi status` -> Mitigation: fetch only the resolved tracking ref and continue checking repositories in parallel.
- [Risk] Warning display can clutter short output -> Mitigation: keep the warning concise and only show it when refresh actually fails.
- [Risk] Shared fetch logic between `status` and `git-remote` can drift if copied instead of extracted -> Mitigation: prefer a small shared helper in git utilities over duplicating resolution rules.
- [Risk] Remote resolution edge cases (custom upstreams, detached HEAD, unusual remotes) could cause false warnings -> Mitigation: add tests for upstream-present, upstream-missing, no-remote, and detached cases.

## Migration Plan

1. Extract or add a shared git helper for resolving the status fetch target and performing the targeted fetch.
2. Update `status` command flow to run the refresh before parsing status output for each eligible repository.
3. Extend `RepoStatus` formatting to carry non-fatal fetch warnings separately from hard errors.
4. Add unit and integration coverage for refreshed tracking info and degraded fetch behavior.
5. Roll back by removing the pre-status fetch step and warning plumbing if the added network dependency proves too disruptive.

## Open Questions

- Should short output show a compact warning token inline, or append a short text note when refresh fails?
- Should the main repository and child repositories use identical fetch behavior even when one has no upstream configured?
- Do we want a follow-up change to make remote refresh optional for users who prefer the fastest possible status checks?
