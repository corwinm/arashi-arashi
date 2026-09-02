## Context

Both `arashi` and `arashi-vscode` use semantic-release with the `conventionalcommits` preset. Squash merge subjects derive from pull request titles, but their CI workflows currently run only on `opened`, `synchronize`, and `reopened`, and neither validates title syntax. A title can therefore be invalid from creation or become invalid after an edit without a new check.

The requested scope is CI checks only. Repository rulesets and required-check configuration remain unchanged.

## Goals / Non-Goals

**Goals:**

- Give contributors immediate, deterministic feedback when a pull request title would not be classified by the release process.
- Keep each release-bearing repository's accepted title grammar and recognized types aligned with its own semantic-release configuration.
- Prove syntax and workflow wiring with local tests.

**Non-Goals:**

- Infer whether a change semantically deserves `fix`, `feat`, or another type.
- Change semantic-release rules, merge strategy, repository rulesets, or branch protection.
- Validate commit messages inside feature branches.

## Decisions

### Use a repository-local Node validator with no new dependency

Each release-bearing repository will expose a small script that validates one title supplied through the `PR_TITLE` environment variable. The accepted grammar is:

`<type>[optional scope][optional !]: <single-line subject>`

Recognized types match the semantic-release configuration: `feat`, `fix`, `perf`, `revert`, `docs`, `style`, `chore`, `refactor`, `test`, `build`, and `ci`. Scope, when present, must be non-empty and cannot contain parentheses or line breaks. The subject must be non-empty and single-line.

A repository-local validator is directly testable, avoids an additional action/dependency, and keeps the failure message under project control. The same behavior is copied intentionally into each independently versioned release repository so either repository remains self-contained.

### Use a dedicated pull-request title workflow

Each repository will add a small workflow triggered by `pull_request_target` activity types `opened`, `edited`, `reopened`, and `synchronize`. GitHub loads the workflow definition from the base branch. The job checks out the exact `github.event.pull_request.base.sha` with persisted credentials disabled, passes `${{ github.event.pull_request.title }}` through an environment variable rather than interpolating it into shell source, and executes the validator from that trusted base revision. The workflow has only `contents: read` permission and never checks out or executes pull-request code.

A dedicated workflow avoids rerunning the full build/test matrix on title-only edits and makes the check's purpose visible. Because the requested scope excludes rulesets, this check supplies deterministic status but is not made a GitHub-required check by this change; the maintained merge gate must still reject non-green PRs.

### Test syntax and workflow wiring locally

Unit tests will cover every recognized type, optional scope/breaking syntax, and malformed/plain/multiline/unrecognized titles. A workflow contract test will parse or inspect the maintained YAML to verify the exact activity types, least-privilege permissions, safe environment transport, and validator invocation.

## Risks / Trade-offs

- CI-only enforcement can still be bypassed by an administrator because no required-check ruleset is added. This is an explicit scope choice, mitigated by the maintained no-red-check merge gate.
- The recognized-type list is duplicated with semantic-release configuration. Contract tests must compare it to release rules so future configuration changes cannot silently drift.
- GitHub expression data must never be interpolated directly into executable shell text; environment transport prevents title contents from becoming commands.

## Migration Plan

No migration is required. Existing open pull requests receive the check on their next synchronization, reopen, or title edit. New pull requests receive it on creation.
