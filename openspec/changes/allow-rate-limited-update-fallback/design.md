## Context

The direct-binary update path fetches GitHub's latest-release API before it constructs an installer plan. A failed response currently becomes an ordinary error, so the command never reaches its existing confirmation and installer execution path. The hosted POSIX and PowerShell installers already support an unpinned mode that resolves `releases/latest/download`; omitting `ARASHI_VERSION` is therefore the narrowest fallback.

## Goals / Non-Goals

**Goals:**

- Distinguish documented rate-limited 403 and 429 responses from generic authorization, permission, and unrelated throttling failures.
- Reuse the existing prompt, `--yes`, installer spawn, platform, deferred-Windows, and result-reporting paths.
- Make the uncertainty explicit: Arashi cannot report whether an update exists or which version will be installed.
- Preserve all inspection modes as non-mutating.

**Non-Goals:**

- Authenticate GitHub API requests or add token configuration.
- Retry, sleep until reset, scrape release pages, or infer a version from redirects.
- Change npm-managed updates, which use npm registry metadata.
- Continue after generic 403/429, network, malformed-response, or other release-check failures.

## Decisions

### Represent rate limiting as a typed release-check error

`fetchLatestRelease` will throw a dedicated error only for GitHub's documented 403 or 429 statuses when the response supplies corroborating evidence: `x-ratelimit-remaining: 0` identifies primary exhaustion, while `retry-after` or a JSON `message` that identifies a secondary rate limit identifies secondary throttling. The body-message fallback is required because GitHub documents secondary-limit responses where `retry-after` is absent. Generic 403/429 responses still fail closed. The error retains the actual status and signal for human and JSON reporting.

Alternative considered: match only `status === 403 || status === 429`. Rejected because permission/policy failures can use 403 and unrelated throttling can use 429; both statuses require GitHub rate-limit evidence.

### Allow installer plans without a pinned version

The installer-plan builder will accept an optional version. When absent, the execution boundary will remove `ARASHI_VERSION` from the spawned installer environment, including any value inherited from the caller; all other environment settings remain unchanged. This delegates latest-release selection to the official installer and its existing checksum verification rather than duplicating download logic.

Alternative considered: pass a sentinel such as `latest`. Rejected because the installers already define absence as their latest-release mode.

### Rejoin the existing confirmation boundary

After a rate-limit error, ordinary interactive update mode will print the uncertainty and fallback plan, then use the existing confirmation helper with rate-limit-specific wording. `--yes` bypasses that prompt. Decline, cancellation, and non-interactive execution without `--yes` skip mutation.

Human `--check` reports the failed check and exits non-zero. Human `--dry-run` reports the unpinned fallback plan and exits successfully without prompting or spawning. Bare `--json`, `--json --check`, and `--json --dry-run` each emit exactly one `ok: false` envelope, set exit status 1, and use code `GITHUB_RATE_LIMITED` with details containing the actual `status: 403 | 429`, `signal: "primary" | "secondary"`, `fallbackAvailable: true`, and `versionPinned: false`. `--json --yes` retains its existing pre-lookup `JSON_UNSUPPORTED_FOR_MODE` rejection. This keeps JSON deterministic and non-mutating while distinguishing a failed availability check from an approved installer attempt.

Fallback completion messages remain version-neutral. POSIX success reports that the latest-release installer attempt completed; Windows reports that it scheduled the latest-release installer attempt; neither claims a target version. Installer start failures and non-zero exits retain the existing non-zero error behavior.

## Risks / Trade-offs

- [Risk] The unversioned installer may encounter the same GitHub-side limit or another download failure. → The command labels the action as an attempt, keeps installer verification authoritative, and surfaces installer failure normally.
- [Risk] Secondary rate-limit message wording may evolve. → Classification is restricted to 403/429 responses and a narrow, case-insensitive `secondary rate limit` message signal; unrecognized responses fail closed.
- [Risk] Users may reinstall the same version. → The prompt states that availability could not be verified; explicit confirmation is required unless `--yes` is supplied.

## Migration Plan

No data or configuration migration is required. Ship the CLI behavior and tests in a normal release. Rollback is a source revert; existing pinned update behavior remains unchanged when release lookup succeeds.

## Open Questions

None.
