## 1. CLI Design and Plumbing

- [ ] 1.1 Add an `exec` command module and register it in the CLI entrypoint.
- [ ] 1.2 Parse Arashi options before the child command delimiter and preserve child command arguments after `--` without reinterpreting them.
- [ ] 1.3 Reuse existing workspace configuration and repository filtering helpers for selected repository resolution.
- [ ] 1.4 Add dirty-repository selection that detects local changes before execution and handles clean/no-match cases.

## 2. Execution Engine

- [ ] 2.1 Implement serial per-repository child process execution with each selected repository as `cwd`.
- [ ] 2.2 Capture stdout, stderr, child exit code, duration, and execution status for each repository.
- [ ] 2.3 Implement aggregate exit behavior so any child failure makes `arashi exec` exit non-zero.
- [ ] 2.4 Implement `--jobs <n>` bounded concurrency with validation for positive integer values.
- [ ] 2.5 Implement `--fail-fast` scheduling behavior for serial and parallel modes, including not-started/skipped result reporting.

## 3. Output Modes

- [ ] 3.1 Add grouped human output with clear repository labels and a final success/failure/skipped summary.
- [ ] 3.2 Add `--json` support using the standard Arashi JSON envelope and stdout-isolation helpers.
- [ ] 3.3 Ensure JSON mode reports child command arguments, effective options, selected repositories, per-repository results, aggregate totals, and structured validation errors.

## 4. Tests

- [ ] 4.1 Add unit tests for command argument passthrough, option validation, repository filtering, dirty selection, and aggregate status calculation.
- [ ] 4.2 Add integration tests that execute real child commands in temporary managed repositories and verify working directories, success, failure, `--only`, and no-command behavior.
- [ ] 4.3 Add tests for grouped human output and non-zero exit behavior on partial failure.
- [ ] 4.4 Add JSON-mode tests that assert stdout is exactly one parseable JSON document and includes per-repository stdout/stderr/exit statuses.
- [ ] 4.5 Add bounded parallelism and fail-fast tests that verify concurrency limits and not-started repository reporting.

## 5. Documentation and Skills

- [ ] 5.1 Add an `exec` command page to `arashi-docs` and include it in command navigation/indexes.
- [ ] 5.2 Update relevant workflow/agent-readable docs exports so `arashi exec` appears in generated Markdown and `llms-full.txt` content when applicable.
- [ ] 5.3 Update `arashi-skills` guidance with recommended `arashi exec` usage for multi-repo validation and inspection.

## 6. Validation and PRs

- [ ] 6.1 Validate `repos/arashi` with `bun run lint`, `bun run test`, and `bun run build`.
- [ ] 6.2 Validate `repos/arashi-docs` with `bun run validate` and generated-route smoke checks for the new command documentation.
- [ ] 6.3 Validate `repos/arashi-skills` with its security/audit checks if skill guidance changes.
- [ ] 6.4 Open focused, cross-linked implementation PRs in affected child repositories and update the meta/spec PR body with related PR links before merge.
