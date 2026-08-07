## Context

The direct-binary update path fetches GitHub's latest-release API before it constructs an installer plan. A failed response currently becomes an ordinary error, so the command never reaches its existing confirmation and installer execution path. The hosted POSIX and PowerShell installers already support an unpinned mode that resolves `releases/latest/download`; omitting `ARASHI_VERSION` is therefore the narrowest fallback.

## Goals / Non-Goals

**Goals:**

- Distinguish rate-limited 403 responses from generic authorization/permission failures.
- Reuse the existing prompt, `--yes`, installer spawn, platform, deferred-Windows, and result-reporting paths.
- Make the uncertainty explicit: Arashi cannot report whether an update exists or which version will be installed.
- Preserve all inspection modes as non-mutating.

**Non-Goals:**

- Authenticate GitHub API requests or add token configuration.
- Retry, sleep until reset, scrape release pages, or infer a version from redirects.
- Change npm-managed updates, which use npm registry metadata.
- Continue after generic 403, network, malformed-response, or other release-check failures.

## Decisions

### Represent rate limiting as a typed release-check error

`fetchLatestRelease` will throw a dedicated error only when the response status is 403 and either `x-ratelimit-remaining` is `0` or `retry-after` is present. This uses GitHub's primary and secondary rate-limit response signals without treating every 403 as safe to bypass. The error retains status details for human and JSON reporting.

Alternative considered: match only `status === 403`. Rejected because permission and policy failures can also use 403 and should keep failing closed.

### Allow installer plans without a pinned version

The installer-plan builder will accept an optional version. When absent, the execution boundary will remove `ARASHI_VERSION` from the spawned installer environment, including any value inherited from the caller; all other environment settings remain unchanged. This delegates latest-release selection to the official installer and its existing checksum verification rather than duplicating download logic.

Alternative considered: pass a sentinel such as `latest`. Rejected because the installers already define absence as their latest-release mode.

### Rejoin the existing confirmation boundary

After a rate-limit error, ordinary interactive update mode will print the uncertainty and fallback plan, then use the existing confirmation helper with rate-limit-specific wording. `--yes` bypasses that prompt. Decline, cancellation, and non-interactive execution without `--yes` skip mutation.

Human `--check` reports the failed check and exits non-zero. Human `--dry-run` reports the unpinned fallback plan and exits successfully without prompting or spawning. Bare `--json`, `--json --check`, and `--json --dry-run` each emit exactly one `ok: false` envelope, set exit status 1, and use code `GITHUB_RATE_LIMITED` with details containing `status: 403`, `signal: "primary" | "secondary"`, `fallbackAvailable: true`, and `versionPinned: false`. `--json --yes` retains its existing pre-lookup `JSON_UNSUPPORTED_FOR_MODE` rejection. This keeps JSON deterministic and non-mutating while distinguishing a failed availability check from an approved installer attempt.

Fallback completion messages remain version-neutral. POSIX success reports that the latest-release installer attempt completed; Windows reports that it scheduled the latest-release installer attempt; neither claims a target version. Installer start failures and non-zero exits retain the existing non-zero error behavior.

## Risks / Trade-offs

- [Risk] The unversioned installer may encounter the same GitHub-side limit or another download failure. → The command labels the action as an attempt, keeps installer verification authoritative, and surfaces installer failure normally.
- [Risk] Secondary rate limiting may evolve. → Classification uses documented response headers and fails closed when they are absent.
- [Risk] Users may reinstall the same version. → The prompt states that availability could not be verified; explicit confirmation is required unless `--yes` is supplied.

## Migration Plan

No data or configuration migration is required. Ship the CLI behavior and tests in a normal release. Rollback is a source revert; existing pinned update behavior remains unchanged when release lookup succeeds.

## Open Questions

None.
