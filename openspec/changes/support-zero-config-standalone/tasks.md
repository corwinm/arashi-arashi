## 1. Workspace Resolution and Policy

- [x] 1.1 Add failing unit and Git-backed tests for typed configured, implicit standalone, and unavailable workspace resolution from repository roots, nested directories, external linked worktrees, relative common-dir output, and separate-git-dir layouts.
- [x] 1.2 Add failing precedence tests proving valid config wins and malformed, unreadable, invalid, and unsupported existing config errors never fall back to `.worktrees/` mode from main roots, linked-worktree roots, enclosing configured meta-worktrees, or managed child invocations.
- [x] 1.3 Add failing eligibility tests for missing `.worktrees/`, non-Git paths, bare repositories, configured child repositories, and nested configured workspace discovery.
- [x] 1.4 Implement Git main-worktree resolution and a typed workspace context with an in-memory standalone config and no implicit persistence.
- [x] 1.5 Add failing command-policy tests by auditing every command that calls `findWorkspaceRoot`, `loadConfig`, or repository filtering and pin configured-only, supported standalone, and invalid-config behavior without empty-config no-ops or scope broadening.
- [x] 1.6 Implement an explicit command capability/policy helper that satisfies the audited classifications.

## 2. Zero-Config Initialization

- [x] 2.1 Add failing CLI option/contract tests proving `init --zero-config` accepts only `--dry-run`, `--verbose`, and `--json` while rejecting `--repos-dir`, `--worktrees-dir`, `--ignore-scope`, `--force`, and `--no-discover` before mutation.
- [x] 2.2 Add failing real-Git tests for creating `.worktrees/`, deterministic descendant probes with `git check-ignore --no-index`, tracked/local/global and negated effective rules, post-write effectiveness verification, common `info/exclude` resolution, and avoiding `.gitignore`, global config, `.arashi/`, or config writes.
- [x] 2.3 Add failing preservation and idempotency tests for empty/missing local exclude files, symlink refusal, existing content with LF/CRLF/no trailing newline, literal `.worktrees/` formatting rather than configured anchored/managed-block output, duplicate-equivalent rules, negated/effective Git rules, and repeated runs.
- [x] 2.4 Add failing dry-run and JSON stdout-isolation tests for planned directory/rule actions, effective source details, eligibility errors, and unchanged final state.
- [x] 2.5 Add failing transaction tests for directory-write and exclude-write failures, exact content restoration, newly created directory cleanup, retained pre-existing directories, and restoration-failure reporting.
- [x] 2.6 Implement zero-config bootstrap with preflight option/state validation, reversible directory/local-exclude actions, dry-run planning, human output, and structured JSON results.
- [x] 2.7 Regenerate and verify CLI command metadata, schema/contracts, help snapshots, and package artifacts affected by the new init option.

## 3. Standalone Creation and Path Safety

- [x] 3.1 Add failing path-strategy tests proving simple and slash-containing branches resolve to `<main-root>/.worktrees/<branch>` without a repository-name prefix from main and linked worktrees.
- [x] 3.2 Add failing create and create-dry-run tests proving `git check-ignore --no-index` checks the exact normalized destination before branch, directory, worktree, hook, or config mutation, including contents-only, branch-selective, and negated rules.
- [x] 3.3 Add failing create tests for tracked/local/global effective rules, branch/path conflicts, remote branch reuse, nested parent directories, preservation of pre-existing slash-branch parents, removal of only invocation-created empty directories, user-global shared/targeted hook ordering and failures, partial failure, rollback, and no implicit `.arashi/` writes.
- [x] 3.4 Add failing filter/selection tests proving `--only`, `--group`, meaningless interactive multi-repository selection, and switch `--repos`/`--all` fail clearly before mutation or launch in standalone mode.
- [x] 3.5 Implement the explicit standalone worktree path strategy, sole-repository orchestration, pre-mutation ignore gate, human/JSON mode metadata, and final-state rollback.

## 4. Single-Repository Lifecycle Support

- [x] 4.1 Add failing `list` and `status` tests for implicit discovery, main/linked-worktree invocation, invalid-config precedence, explicit human and JSON mode/path reporting, dirty/divergent state, JSON stdout isolation, and preservation of list's broader config-optional behavior when `.worktrees/` is absent.
- [x] 4.2 Add failing `switch` tests for standalone target discovery and selection from main and linked worktrees without configured defaults or repository prefixes.
- [x] 4.3 Add failing `remove` tests for standalone previews, dirty blockers, branch/worktree options, user-global pre/post hook targeting/gating/finalization/context, local hook non-activation, nested branch paths, rollback, and JSON results where supported.
- [x] 4.4 Add failing `prune` tests for standalone dry-run/mutation, stale metadata, partial failure, linked-worktree invocation, and JSON results.
- [x] 4.5 Add failing `doctor` tests for healthy standalone state, unignored `.worktrees/`, no synthetic `./repos` ignore finding, stale metadata, invalid-config precedence, stable human/JSON mode reporting, strict non-mutation, and JSON results.
- [x] 4.6 Add failing `move` tests for standalone source/target discovery, single-repository scope, dirty/conflict handling, nested paths, rollback, and no config writes.
- [x] 4.7 Add failing `handoff` Markdown and JSON tests for main/linked-worktree context, workspace mode, repository/worktree status, caller context, invalid-config precedence, stdout isolation, and non-mutation.
- [x] 4.8 Migrate list, status, switch, remove, prune, doctor, move, and handoff to typed workspace context while preserving configured workspace behavior.
- [x] 4.9 Add a real temporary-repository integration test covering zero-config init plus create/list/status/switch/remove lifecycle and asserting final Git/filesystem state and absence of `.arashi/`.

## 5. Configured-Only Command Boundaries

- [x] 5.1 Add failing human and JSON tests proving `add`, `clone`, and `sync` reject implicit standalone mode with ordinary `arashi init` guidance before mutation.
- [x] 5.2 Audit pull, push, exec, setup, shell/configuration, and other coordinated command surfaces and encode each as supported standalone behavior or configured-only with a tested reason.
- [x] 5.3 Add configured workspace regression tests proving custom locations, repositories, groups, hooks, defaults, managed-ignore scopes, JSON results, and existing path naming remain unchanged.
- [x] 5.4 Implement centralized configured-workspace assertions and replace broad missing-config catches that could hide invalid config or emit misleading guidance.

## 6. Documentation, Skills, and Generated Exports

- [x] 6.1 Add failing source/generated-content tests proving standalone workflow, `init --zero-config`, lifecycle scope, configured-only guidance, required routes, and prioritized export ordering remain aligned across CLI, docs, and skills.
- [x] 6.2 Update CLI-owned init/help and relevant command documentation with zero-config eligibility, ignore safety, paths, supported/unsupported commands, dry-run/JSON behavior, and configured-mode upgrade guidance.
- [x] 6.3 Add a dedicated `arashi-docs` standalone workflow showing explicit CLI bootstrap, create/list/status/switch/remove lifecycle, `.worktrees/<branch>` layout, and configured-mode contrast.
- [x] 6.4 Link standalone guidance from Getting Started, workflow indexes, supported lifecycle pages, and configured-only add/clone/sync/pull/push/exec/setup pages without duplicating long procedures.
- [x] 6.5 Update `arashi-skills` routing and workflow/command/troubleshooting references so agents choose the correct mode and never auto-edit global or tracked ignore state for zero-config bootstrap.
- [x] 6.6 Regenerate CLI command contracts, docs indexes, `coreOrder`/`requiredRoutes`, Markdown routes, `llms.txt`/`llms-full.txt`, packaged skill outputs, and cross-repository coverage fixtures until the tests pass.

## 7. Validation and Delivery

- [x] 7.1 Run focused resolver, init, managed-ignore, create, lifecycle, linked-worktree, Windows/path, rollback, JSON, and contract tests in `corwinm/arashi`.
- [x] 7.2 Run full CLI validation with `pnpm run lint`, `pnpm run test`, `pnpm run build`, contract/schema freshness, package smoke tests, and Git diff checks.
- [x] 7.3 Run `pnpm validate` plus generated route, Markdown, link, and standalone-content checks in `corwinm/arashi-docs`.
- [x] 7.4 Run `arashi-skills` security, self-test, packaging-boundary, and cross-repository contract validation.
- [x] 7.5 Perform real-repository smoke tests from both main and linked worktrees for explicit bootstrap, ignored/unignored create, lifecycle cleanup, invalid-config precedence, and no implicit config writes.
- [x] 7.6 Open focused cross-linked CLI, docs, and skills PRs plus the meta/OpenSpec PR, record exact validation evidence, and keep the meta PR as the sole eventual closing-keyword owner for issue #212.
