## 1. CLI Contract Tests (RED)

- [x] 1.1 Add command-level configured-create tests that activate generated workspace pre/post examples and prove real `ARASHI_BRANCH_NAME`, timing, cwd, failure, and rollback behavior
- [x] 1.2 Add command-level tests for repository-specific pre/post-create timing, target-consistent environment values, and parent/worktree paths
- [x] 1.3 Replace the low-level continuation sentinel test with command-level configured workspace/repository and standalone global hook success, nonzero, timeout, and rollback assertions
- [x] 1.4 Add create human/JSON tests requiring complete configured workspace/repository and standalone global hook outcome ledgers, `data.hookOutcomes` success placement, `error.details.hookOutcomes` failure placement, and stdout isolation
- [x] 1.5 Add lifecycle matrix tests covering exact cwd, explicit targets, 1.x compatibility-alias retention, reserved-metadata overwrite rejection, and ambiguous scalar omission for every configured/standalone scope
- [x] 1.6 Add multi-repository remove tests proving per-scope invocation multiplicity, cross-platform absolute lexical path normalization, Unicode-scalar ordering, deduplication/null handling, and exact comma/count compatibility aggregate derivation
- [x] 1.7 Add remove human/JSON tests requiring per-hook validation/timeout/nonzero records, success/failure envelope placement, stable target/scope order, removal-error preservation, aggregate summaries, and dry-run non-spawn/no-fabricated-outcome behavior
- [x] 1.8 Add timeout tests requiring one 300000ms default, one configured override, and pre-mutation structured rejection of zero/negative/fractional/non-numeric/out-of-range values without real-time waits
- [x] 1.9 Add init behavior tests for one-to-one lifecycle activation, inert examples, executable POSIX activation, repository-specific examples, activated native Windows lifecycle templates, POSIX `.arashi/setup.sh.example`, and honest Windows setup-example omission
- [x] 1.10 Add POSIX `.sh` discovery and standalone linked-worktree targeting tests plus native Windows `.ps1`, `.cmd`, `.bat`, case-insensitive ambiguity, interpreter-unavailable, metacharacter-path, lifecycle-boundary, and doctor/runtime-parity tests
- [x] 1.11 Add a failing meta-repository semantic contract fixture/check that compares CLI producers, docs consumers, generated exports, and packaged skill claims before editing consumers
- [x] 1.12 Run each focused new test before implementation and record the expected RED failure caused by the audited contract defect

## 2. CLI Runtime and Template Implementation (GREEN)

- [x] 2.1 Centralize the 300000ms lifecycle timeout default; add generated schema/runtime validation for integer values from 1 through 2147483647; reject invalid values before discovery/mutation across human and JSON modes
- [x] 2.2 Make executor-owned hook name, scope, source, execution path, workspace mode, main root, and explicit `ARASHI_HOOK_TARGET_*` fields authoritative while preserving documented legacy aliases
- [x] 2.3 Build configured-create workspace and repository-specific contexts from the normative lifecycle matrix without invented child target values for workspace hooks
- [x] 2.4 Build remove context per current repository target; serialize the exact normalized/deduplicated/Unicode-sorted JSON records and named compatibility aggregates without cross-target scalar borrowing
- [x] 2.5 Preserve and document legacy comma-separated remove aggregates as lossy compatibility fields while using JSON for canonical aggregate consumers
- [x] 2.6 Add one shared runtime/doctor discovery and preflight path for POSIX `.sh` and case-insensitive Windows `.ps1`/`.cmd`/`.bat`, rejecting multiple supported candidates or unavailable interpreters before mutation
- [x] 2.7 Execute `.ps1` with the normative system PowerShell argv and `.cmd`/`.bat` through one metacharacter-safe `cmd.exe` encoder; preserve environment, output routing, timeout, and failure classification
- [x] 2.8 Record configured workspace/repository and standalone global create skips/successes/failures/timeouts in the normative human/JSON outcome schema and recovery guidance
- [x] 2.9 Record configured and standalone remove per-hook outcomes without last-failure collapse; derive compatibility summaries and aggregate command status from the complete ledger plus removal errors
- [x] 2.10 Replace init create/remove examples with scope-correct platform-matched templates and remove stale aliases/failure claims
- [x] 2.11 Move the POSIX setup example to `.arashi/setup.sh.example`, omit it on Windows, preserve setup discovery precedence, remove lifecycle-environment and `core.hooksPath` claims, and print valid activation commands
- [x] 2.12 Run focused hook/init suites, then full CLI lint, typecheck, tests, and build; keep JSON stdout isolated and preserve dry-run previews without fabricating execution records

## 3. Canonical CLI Documentation

- [x] 3.1 Add a failing CLI docs/content check for stale aliases, unsafe activation, lifecycle timing/failure claims, timeout omission, and unsupported Windows examples
- [x] 3.2 Rewrite the CLI hook reference as the normative configured/standalone lifecycle and scope matrix
- [x] 3.3 Document common, target, aggregate, and compatibility environment variables with exact availability, meanings, and the 1.x/no-earlier-than-2.0 compatibility boundary
- [x] 3.4 Update CLI README and create/remove/init/config references with safe activation, platform, timeout, rollback/finalization, and package provenance guidance
- [x] 3.5 Verify CLI docs checks and full repository gates after the canonical contract is green

## 4. Website and Generated Agent Exports

- [x] 4.1 Add a failing focused semantic checker covering canonical hook pages, generated Markdown routes, and `llms-full.txt`
- [x] 4.2 Update hooks, create, remove, init, configuration, standalone, and troubleshooting pages from the normative matrix
- [x] 4.3 Replace setup snippets with lockfile/packageManager-aware Node examples, ancestor-safe pinned pnpm, interpreter-bound pip, and scope-valid variables
- [x] 4.4 Regenerate agent-readable Markdown and LLM exports from canonical sources rather than editing outputs directly
- [x] 4.5 Run docs semantic/freshness tests, formatting, typecheck, full tests, and production build

## 5. Packaged Skill Guidance

- [x] 5.1 Add a failing authored/extracted-package hook contract check while keeping semantic fixtures outside the installable skill directory
- [x] 5.2 Update the smallest hook reference/tutorial files for activation, scope, timing, environment, timeout, failure, Windows, standalone, and package-manager behavior
- [x] 5.3 Build and extract the skill package and verify package boundaries plus semantic parity with canonical docs/CLI help
- [x] 5.4 Run all skill repository validation and packaging gates

## 6. Arashi Dogfood Configuration

- [x] 6.1 Update and run the RED-first meta semantic contract fixture/check after CLI, docs, exports, and skill consumers are synchronized
- [x] 6.2 Add fail-fast shell settings and pinned `corepack pnpm --ignore-workspace install --frozen-lockfile` to every required tracked post-create hook
- [x] 6.3 Add an explicit automatic presentation provisioning hook and verify every configured pnpm child follows the same ready-after-create policy
- [x] 6.4 Set an explicit configured hook timeout sufficient for dependency installation and CLI build
- [x] 6.5 Rewrite pre-remove tmux cleanup to consume structured target JSON, match exact pane cwd paths, and remain idempotent across per-target invocations
- [x] 6.6 Run ShellCheck, semantic contract checks, JSON/config schema validation, and a disposable coordinated create/remove dogfood workflow proving failures are no longer masked

## 7. Native Platform and End-to-End Validation

- [x] 7.1 Run focused and full CLI validation on macOS and Linux with POSIX hooks
- [x] 7.2 Run native Windows create/remove/init/doctor hook integration tests for PowerShell and command scripts, mixed-case extensions, missing interpreters, and metacharacter paths on the Windows test host/CI
- [x] 7.3 Verify conflicting Windows native extensions fail before Git/filesystem mutation and POSIX ignores unsupported extensions
- [x] 7.4 Verify init-generated examples activate and execute from clean configured workspaces and separately verify documentation-authored standalone global examples in isolated home directories
- [x] 7.5 Verify timeout, nonzero, partial-remove, rollback-warning, human-output, JSON-output, and dry-run behavior end to end

## 8. Coordinated Delivery

- [x] 8.1 Commit and open separate CLI, docs, skills, and any presentation child PRs linked to corwinm/arashi-arashi#253
- [x] 8.2 Cross-link every child PR, wait for CI, and merge the CLI/docs/skills/presentation child PRs before the existing meta proposal PR without force-pushing
- [x] 8.3 Release the supporting CLI, install/resolve that released version for dogfood, and verify it exposes `ARASHI_REMOVE_TARGETS_JSON`, native discovery, timeout validation, and the outcome schema before meta hooks can reach `main`
- [x] 8.4 Update the existing meta PR branch to merged child SHAs; rerun semantic, ShellCheck, dogfood create/remove, platform, and clean/aligned-state checks; confirm every #253 acceptance criterion is represented
- [x] 8.5 Complete all remaining implementation tasks, archive/sync the OpenSpec change, and commit the archive plus final child pointers to the existing meta PR as its final pre-merge update
