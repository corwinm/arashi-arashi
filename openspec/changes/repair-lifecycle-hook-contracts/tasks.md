## 1. CLI Contract Tests (RED)

- [ ] 1.1 Add command-level configured-create tests that activate generated workspace pre/post examples and prove real `ARASHI_BRANCH_NAME`, timing, cwd, failure, and rollback behavior
- [ ] 1.2 Add command-level tests for repository-specific pre/post-create timing, target-consistent environment values, and parent/worktree paths
- [ ] 1.3 Replace the low-level continuation sentinel test with command-level configured workspace/repository and standalone global hook success, nonzero, timeout, and rollback assertions
- [ ] 1.4 Add create human/JSON tests requiring complete configured workspace/repository and standalone global hook outcome ledgers, `data.hookOutcomes` success placement, `error.details.hookOutcomes` failure placement, and stdout isolation
- [ ] 1.5 Add lifecycle matrix tests covering exact cwd, explicit targets, compatibility-alias values, reserved-metadata overwrite rejection, and ambiguous scalar omission for every configured/standalone scope
- [ ] 1.6 Add multi-repository remove tests proving per-scope invocation multiplicity and deterministic ordered/deduplicated/null-safe `ARASHI_REMOVE_TARGETS_JSON`
- [ ] 1.7 Add remove human/JSON tests requiring per-hook validation/timeout/nonzero records, success/failure envelope placement, stable target/scope order, removal-error preservation, and aggregate summaries derived from the ledger
- [ ] 1.8 Add timeout tests requiring one 300000ms default and one configured override across create/remove scopes without real-time waits
- [ ] 1.9 Add init behavior tests for one-to-one lifecycle activation, inert examples, executable POSIX activation, repository-specific examples, POSIX `.arashi/setup.sh.example`, and honest Windows setup-example omission
- [ ] 1.10 Add POSIX `.sh` discovery and standalone linked-worktree targeting tests plus platform-gated Windows `.ps1`, `.cmd`, `.bat`, ambiguity, context, and lifecycle-boundary tests
- [ ] 1.11 Add a failing meta-repository semantic contract fixture/check that compares CLI producers, docs consumers, generated exports, and packaged skill claims before editing consumers
- [ ] 1.12 Run each focused new test before implementation and record the expected RED failure caused by the audited contract defect

## 2. CLI Runtime and Template Implementation (GREEN)

- [ ] 2.1 Centralize the 300000ms lifecycle timeout default and apply positive configured overrides consistently to create/remove/global scopes
- [ ] 2.2 Make executor-owned hook name, scope, source, execution path, workspace mode, main root, and explicit `ARASHI_HOOK_TARGET_*` fields authoritative while preserving documented legacy aliases
- [ ] 2.3 Build configured-create workspace and repository-specific contexts from the normative lifecycle matrix without invented child target values for workspace hooks
- [ ] 2.4 Build remove context per current repository target and serialize deterministic structured aggregate targets without cross-target scalar borrowing
- [ ] 2.5 Preserve and document legacy comma-separated remove aggregates as lossy compatibility fields while using JSON for canonical aggregate consumers
- [ ] 2.6 Add platform-native discovery for POSIX `.sh` and Windows `.ps1`/`.cmd`/`.bat`, rejecting multiple supported candidates before mutation
- [ ] 2.7 Execute native Windows hook extensions through matching interpreters with parity for environment, output routing, timeout, and failure status
- [ ] 2.8 Record configured workspace/repository and standalone global create skips/successes/failures/timeouts in the normative human/JSON outcome schema and recovery guidance
- [ ] 2.9 Record configured and standalone remove per-hook outcomes without last-failure collapse; derive compatibility summaries and aggregate command status from the complete ledger plus removal errors
- [ ] 2.10 Replace init create/remove examples with scope-correct platform-matched templates and remove stale aliases/failure claims
- [ ] 2.11 Move the POSIX setup example to `.arashi/setup.sh.example`, omit it on Windows, preserve setup discovery precedence, remove lifecycle-environment and `core.hooksPath` claims, and print valid activation commands
- [ ] 2.12 Run focused hook/init suites, then full CLI lint, typecheck, tests, and build; keep JSON stdout isolated and preserve dry-run previews without fabricating execution records

## 3. Canonical CLI Documentation

- [ ] 3.1 Add a failing CLI docs/content check for stale aliases, unsafe activation, lifecycle timing/failure claims, timeout omission, and unsupported Windows examples
- [ ] 3.2 Rewrite the CLI hook reference as the normative configured/standalone lifecycle and scope matrix
- [ ] 3.3 Document common, target, aggregate, and compatibility environment variables with exact availability and meanings
- [ ] 3.4 Update CLI README and create/remove/init/config references with safe activation, platform, timeout, rollback/finalization, and package provenance guidance
- [ ] 3.5 Verify CLI docs checks and full repository gates after the canonical contract is green

## 4. Website and Generated Agent Exports

- [ ] 4.1 Add a failing focused semantic checker covering canonical hook pages, generated Markdown routes, and `llms-full.txt`
- [ ] 4.2 Update hooks, create, remove, init, configuration, standalone, and troubleshooting pages from the normative matrix
- [ ] 4.3 Replace setup snippets with lockfile/packageManager-aware Node examples, ancestor-safe pinned pnpm, interpreter-bound pip, and scope-valid variables
- [ ] 4.4 Regenerate agent-readable Markdown and LLM exports from canonical sources rather than editing outputs directly
- [ ] 4.5 Run docs semantic/freshness tests, formatting, typecheck, full tests, and production build

## 5. Packaged Skill Guidance

- [ ] 5.1 Add a failing authored/extracted-package hook contract check while keeping semantic fixtures outside the installable skill directory
- [ ] 5.2 Update the smallest hook reference/tutorial files for activation, scope, timing, environment, timeout, failure, Windows, standalone, and package-manager behavior
- [ ] 5.3 Build and extract the skill package and verify package boundaries plus semantic parity with canonical docs/CLI help
- [ ] 5.4 Run all skill repository validation and packaging gates

## 6. Arashi Dogfood Configuration

- [ ] 6.1 Update and run the RED-first meta semantic contract fixture/check after CLI, docs, exports, and skill consumers are synchronized
- [ ] 6.2 Add fail-fast shell settings and pinned `corepack pnpm --ignore-workspace install --frozen-lockfile` to every required tracked post-create hook
- [ ] 6.3 Add an explicit automatic presentation provisioning hook and verify every configured pnpm child follows the same ready-after-create policy
- [ ] 6.4 Set an explicit configured hook timeout sufficient for dependency installation and CLI build
- [ ] 6.5 Rewrite pre-remove tmux cleanup to consume structured target JSON, match exact pane cwd paths, and remain idempotent across per-target invocations
- [ ] 6.6 Run ShellCheck, semantic contract checks, JSON/config schema validation, and a disposable coordinated create/remove dogfood workflow proving failures are no longer masked

## 7. Native Platform and End-to-End Validation

- [ ] 7.1 Run focused and full CLI validation on macOS and Linux with POSIX hooks
- [ ] 7.2 Run native Windows create/remove/init hook integration tests for PowerShell and command scripts on the Windows test host/CI
- [ ] 7.3 Verify conflicting Windows native extensions fail before Git/filesystem mutation and POSIX ignores unsupported extensions
- [ ] 7.4 Verify generated examples activate and execute successfully from clean initialized configured and standalone workspaces
- [ ] 7.5 Verify timeout, nonzero, partial-remove, rollback-warning, human-output, JSON-output, and dry-run behavior end to end

## 8. Coordinated Delivery

- [ ] 8.1 Commit and open separate CLI, docs, skills, and any presentation child PRs linked to corwinm/arashi-arashi#253
- [ ] 8.2 Cross-link every child PR, wait for CI, and merge child PRs before the meta PR without force-pushing
- [ ] 8.3 Update the meta branch to merged child SHAs, rerun cross-repository semantic and dogfood checks, and archive/sync the OpenSpec change
- [ ] 8.4 Commit the meta-repository hooks/config/spec changes and open the meta PR with child links, verified commands, risks, and issue closure
- [ ] 8.5 Confirm all coordinated repositories are clean/aligned and issue #253 acceptance criteria are represented by merged tests and documentation
