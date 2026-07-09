## 1. CLI Planning and Git Helpers

- [ ] 1.1 Audit existing `pull`, `sync`, `remove`, and JSON output patterns for reusable repository selection, command execution, summaries, and tests.
- [ ] 1.2 Add push planning helpers that discover selected repositories, current branches, remotes/upstreams, branch divergence, and skipped reasons without mutating remotes.
- [ ] 1.3 Add a Git push runner abstraction that records stdout, stderr, exit status, duration, upstream setup, and failure details per repository.

## 2. Push Command Implementation

- [ ] 2.1 Register `arashi push` with `--only <repos>`, `--set-upstream`, `--dry-run`, and `--json` options.
- [ ] 2.2 Implement default push behavior for eligible repositories with readable grouped human output and aggregate totals.
- [ ] 2.3 Implement `--set-upstream` behavior for new branches and skipped guidance when upstream setup is required but absent.
- [ ] 2.4 Implement non-mutating `--dry-run` previews that report planned pushes, skipped repositories, and effective options.
- [ ] 2.5 Implement `--json` success/error envelopes for mutating and dry-run push modes with stdout isolation.

## 3. Tests

- [ ] 3.1 Add unit coverage for push planning, repository filtering, skipped untouched repos, missing upstream guidance, and failure classification.
- [ ] 3.2 Add integration coverage for all-repo push, filtered push, upstream setup, untouched child repo skips, push failures, and dry-run non-mutation.
- [ ] 3.3 Add JSON tests proving single-document stdout, per-repo results, aggregate totals, dry-run fields, and non-interactive error/skip behavior.

## 4. Documentation and Skill Guidance

- [ ] 4.1 Update `repos/arashi` command documentation or README guidance for `arashi push` usage and options.
- [ ] 4.2 Add `repos/arashi-docs/docs/commands/push.md` and cross-link it from related command/workflow pages.
- [ ] 4.3 Update generated/agent-readable docs routes if required by the docs generator.
- [ ] 4.4 Update `repos/arashi-skills` Arashi workflow guidance to use `arashi push` before opening cross-repo PRs and to avoid publishing untouched child branches.

## 5. Validation and PR Choreography

- [ ] 5.1 Validate `repos/arashi` with `bun run lint`, `bun run test`, and `bun run build`.
- [ ] 5.2 Validate `repos/arashi-docs` with `bun run validate` and smoke-check the new command page and generated Markdown exports if they change.
- [ ] 5.3 Validate `repos/arashi-skills` according to its repository checks after guidance updates.
- [ ] 5.4 Open cross-linked implementation PRs for each changed child repository and update the meta/OpenSpec PR with related links before archive/merge.
