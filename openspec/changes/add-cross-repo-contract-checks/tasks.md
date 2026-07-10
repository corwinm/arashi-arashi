## 1. CLI Command Contract

- [ ] 1.1 Add failing CLI tests for reusable Commander program construction and exact registered command-path discovery.
- [ ] 1.2 Extract side-effect-free CLI program construction and keep the runtime entrypoint behavior unchanged.
- [ ] 1.3 Add failing tests for complete semantic annotations, reasoned exclusions, JSON support classifications, stale metadata, and deterministic serialization.
- [ ] 1.4 Implement typed command annotations and deterministic contract generation from the Commander tree.
- [ ] 1.5 Add the versioned generated contract artifact plus `contract:generate` and `contract:check` scripts.
- [ ] 1.6 Add contract freshness to CLI CI and document the standalone CLI maintenance workflow.
- [ ] 1.7 Run CLI lint, focused tests, full tests, build, and contract freshness validation.

## 2. Cross-Repository Checker

- [ ] 2.1 Add a minimal pinned meta-repo script/test toolchain without publishing a package.
- [ ] 2.2 Add failing fixture-driven tests for missing docs pages/index entries, stale skills references, unresolved VS Code parity, invalid mappings, explicit exclusions, and deterministic diagnostics.
- [ ] 2.3 Implement contract and policy parsing with schema/version validation and mandatory exclusion reasons.
- [ ] 2.4 Implement canonical docs-page/index checks and avoid treating generated exports or curated `llms.txt` as exhaustive catalogs.
- [ ] 2.5 Implement structured skills coverage and constrained stale command-reference checks.
- [ ] 2.6 Implement VS Code CLI mapping, represented-flow, exclusion, and extension-only command checks.
- [ ] 2.7 Add deterministic categorized human output, non-zero failure behavior, and structured JSON output if retained for the initial scope.
- [ ] 2.8 Document local execution, contract regeneration, policy updates, and troubleshooting.

## 3. Companion Repository Baseline

- [ ] 3.1 Fix the docs command index to include `push` and align agent-export ordering where appropriate.
- [ ] 3.2 Add structured skills coverage metadata while preserving curated workflow guidance and the bootstrap-only `install` rationale.
- [ ] 3.3 Add explicit VS Code mappings, represented flows, extension-only commands, and reasoned decisions for current CLI gaps.
- [ ] 3.4 Add failing VS Code tests for mismatches among manifest contributions, activation events, `COMMAND_IDS`, and runtime handlers.
- [ ] 3.5 Implement or correct VS Code declarations until the local consistency test passes.
- [ ] 3.6 Run docs validation, skills validation/security checks, and VS Code lint, unit tests, build, and extension-host smoke tests.

## 4. CI Integration and Verification

- [ ] 4.1 Add a meta-repo workflow that checks out all four child repositories at explicit revisions and reports their SHAs.
- [ ] 4.2 Run the same local cross-repository validation command in CI and add manual workflow dispatch support.
- [ ] 4.3 Decide and document whether child repositories trigger the authoritative workflow now or in a follow-up.
- [ ] 4.4 Verify known intentional exclusions are informational while missing, stale, and invalid findings fail the check.
- [ ] 4.5 Run the complete cross-repository contract check against the coordinated workspace and record validation evidence.
- [ ] 4.6 Open focused, cross-linked child PRs and update the meta/OpenSpec PR with all related links and validation results.
