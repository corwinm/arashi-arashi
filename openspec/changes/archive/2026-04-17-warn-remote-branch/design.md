## Context

`arashi status` currently refreshes each repository's remote-tracking branch before reading `git status`, then stores any fetch failure as a generic `refreshWarning`. The default and verbose renderers always print branch information first and append that warning as a separate yellow line afterward. For a missing remote branch, this produces noisy output even though the local branch state is still valid and the warning is really about the branch mapping itself.

This change affects the status command flow in `repos/arashi/src/commands/status.ts` and the remote refresh helper in `repos/arashi/src/lib/git-remote.ts`. The implementation should preserve the existing behavior for missing repositories, detached HEADs, and generic remote refresh failures.

## Goals / Non-Goals

**Goals:**
- Detect the specific fetch failure that means the expected remote branch does not exist.
- Preserve local status collection and parsing when that remote branch is missing.
- Render the missing-remote condition inline on the Branch line for human-readable status output.
- Keep generic stale-remote warnings for authentication, network, and other fetch failures.
- Cover the new behavior with unit tests around detection and formatting.

**Non-Goals:**
- Changing how upstream branches are resolved.
- Changing branch divergence calculations for successfully refreshed remotes.
- Redesigning the short status format beyond what is needed to keep warning output accurate.
- Adding new configuration or CLI flags.

## Decisions

### 1. Classify remote refresh failures instead of storing only a generic warning string
Add structured metadata for remote refresh outcomes so rendering logic does not need to infer behavior from a free-form error string. The status path should distinguish at least:
- generic refresh failure where remote tracking may be stale
- missing remote branch/ref for the resolved target

This can be implemented either by returning a typed failure from `fetchRemoteTrackingTarget` or by normalizing the result in `checkRepoStatus`. The preferred approach is to classify the error near `fetchRemoteTrackingTarget`, because that helper has the fetch target information and already owns remote-refresh semantics.

**Alternative considered:** keep a single warning string and match on it in the formatters. Rejected because it would couple rendering to raw git error text and make tests brittle.

### 2. Render missing remote branches on the Branch line in default and verbose output
When the refresh classifier reports that the remote branch is missing, the default and verbose renderers should replace the usual remote-tracking display with an inline warning in the remote position, for example:

`Branch: feat/my-branch → couldn't find remote ref refs/heads/feat/my-branch`

The full Branch line should be yellow to communicate warning severity while still showing the local branch. Generic refresh failures should continue using the existing separate warning line.

**Alternative considered:** keep the separate warning line and shorten the message. Rejected because the issue specifically requests the missing remote to appear where the remote branch would normally be shown.

### 3. Preserve local branch parsing from `git status`
The command should still run `getGitStatus`, parse the local branch name, and collect file status even when remote refresh reports a missing ref. The missing-remote state is a display concern layered on top of valid local status data, not a repository failure.

**Alternative considered:** clear `remoteBranch` and treat the repository as having no remote. Rejected because the local repository may still be configured to track a remote branch that simply has not been pushed yet.

### 4. Keep short output semantically accurate with minimal change
Short output has no dedicated Branch line, so it should continue to summarize repository status compactly. If warning metadata is shown there, it should use a concise missing-remote marker distinct from the generic stale-remote marker.

**Alternative considered:** leave short output unchanged. Accepted only if the new metadata is not exposed there; otherwise the output would silently lose warning information.

## Risks / Trade-offs

- **Git error text varies across environments** → Match the missing-ref case narrowly and normalize the displayed message so tests do not rely on unrelated prefixes such as `Git command failed:` or `fatal:`.
- **Renderer complexity increases** → Use structured warning metadata so each formatter can branch on a small enum-like state.
- **Potential overlap with repositories that truly have no remote** → Continue treating “no remote/upstream can be resolved” as the existing no-refresh path rather than the missing-remote-branch warning case.
- **Short-format expectations may shift** → Keep short output changes minimal and test only the new warning marker behavior.

## Migration Plan

- No data migration required.
- Ship as a normal CLI behavior change.
- Rollback is limited to restoring the prior warning classification and formatting if users prefer the previous output.

## Open Questions

- Whether the inline message should preserve the raw git wording exactly or use a friendlier normalized phrase. The initial implementation should favor a normalized message that still identifies the missing ref path.
