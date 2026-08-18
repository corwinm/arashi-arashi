## 1. Remove Legacy Configuration

- [ ] 1.1 In `repos/arashi`, remove `defaults.create.baseBranch` from runtime configuration types, normalization, generated schema, source enums, base precedence, deprecation diagnostics, and root-versus-legacy conflict handling while preserving all non-base `defaults.create` settings.
- [ ] 1.2 Add exact-path semantic validation that rejects `defaults.create.baseBranch` with actionable root/meta/child migration guidance before repository discovery, hook discovery/execution, managed-ignore reconciliation, network access, or Git mutation.
- [ ] 1.3 Update configuration, create/clone, hook-boundary, schema, generated-contract, and JSON error tests for unsupported-key rejection and removal of legacy source/diagnostic behavior.

## 2. Centralize Configured-Base Status

- [ ] 2.1 Extend the shared base resolver so configured commands receive repository override then root fallback, while create/clone retain their existing CLI override layers and omitted-base behavior.
- [ ] 2.2 Extend repository status records with role-specific configured-base comparison state, including source, logical branch, selected remote/ref, ahead/behind counts, state, and unavailable reason/details without changing upstream/default meaning.
- [ ] 2.3 Add target-identity caching so identical configured-base/default refs are fetched and compared once while separate structured role records remain available.
- [ ] 2.4 Pass per-repository configured policy through configured status selection and cover root/meta/child precedence, different upstream, detached HEAD, missing repository, unavailable base, and no-config/standalone paths.
- [ ] 2.5 Update default, short, verbose, and JSON status formatters/tests for behind, up-to-date/ahead, unavailable, same-as-default combined human output, differing targets, and role-complete structured output.

## 3. Apply Configured Base to Pull

- [ ] 3.1 Make configured pull refresh and compare the selected remote configured base and invoke the existing rollback-protected merge pull from that base when behind.
- [ ] 3.2 Preserve the existing upstream/current-branch pull path when no configured base exists, including unchanged implicit standalone behavior.
- [ ] 3.3 Return explicit per-repository failure/manual-action outcomes for missing or unrefreshable configured bases without upstream/default fallback or stale-ref decisions.
- [ ] 3.4 Preserve parent-first execution, post-parent config reload/validation, filters, managed-ignore reconciliation, timeouts, partial failures, and JSON isolation while resolving child bases from reloaded configuration.
- [ ] 3.5 Add pull tests for root fallback, meta/child override, different feature upstream, already-on-base, no configured base, missing remote base, filters, parent config reload, conflict rollback, timeout/partial failure, JSON, and standalone behavior.

## 4. Apply Configured Base to Push Fallback

- [ ] 4.1 Use the refreshed configured base only as the publishability baseline for configured branches with no upstream; retain remote-default fallback only when configured base is absent.
- [ ] 4.2 Preserve current-upstream comparison, push destination/refspec, selected remote, `--set-upstream`, dry-run, filtering, and standalone behavior.
- [ ] 4.3 Fail a no-upstream repository explicitly when its configured base cannot be refreshed/resolved, without default fallback or remote-branch creation.
- [ ] 4.4 Add push tests for branch-unique commits, base-only commits, usable upstream differing from base, missing base, no configured base, `--set-upstream`, dry-run/JSON, partial failure, and standalone behavior.

## 5. Extend Handoff and Doctor

- [ ] 5.1 Add configured-base lag/unavailable state to handoff Markdown and JSON while preserving upstream/default information and standalone reports.
- [ ] 5.2 Add stable doctor findings `REPOSITORY_CONFIGURED_BASE_BEHIND` and `REPOSITORY_CONFIGURED_BASE_UNAVAILABLE` with actual remote/ref details and actionable non-fallback guidance.
- [ ] 5.3 De-duplicate same-target base/default human handoff lines, doctor findings, and suggested commands while keeping distinct structured roles; retain separate diagnostics when targets differ.
- [ ] 5.4 Add handoff/doctor tests for behind, unavailable, differing targets, shared target, detached HEAD, missing repository, JSON isolation, finding severity/exit behavior, non-mutation, and standalone behavior.

## 6. Update Documentation, Skills, and Contracts

- [ ] 6.1 In `repos/arashi`, update command/configuration help and generated CLI/schema/JSON contract artifacts for cross-command configured bases and complete legacy removal.
- [ ] 6.2 In `repos/arashi-docs`, update canonical workflow/configuration and status/pull/push/handoff/doctor guidance, regenerate reference/agent-readable exports, and remove compatibility examples/language.
- [ ] 6.3 In `repos/arashi-skills`, update authored and packaged guidance to distinguish upstream/base/default, teach command-specific behavior and failure boundaries, remove legacy acceptance, and preserve standalone semantics.
- [ ] 6.4 In the meta repository, update semantic contract fixtures/checkers so CLI, docs, skills, and generated artifacts agree on configuration paths, command roles, failure/fallback behavior, same-target de-duplication, JSON roles, and legacy rejection.
- [ ] 6.5 Leave archived historical OpenSpec artifacts unchanged unless an active contract check requires an explicit supersession fixture.

## 7. Verify Coordinated Delivery

- [ ] 7.1 Run focused and full `repos/arashi` tests, type checks, lint/build, schema generation checks, and command-contract checks.
- [ ] 7.2 Run `repos/arashi-docs` source, generated-export, link/build, and semantic validation.
- [ ] 7.3 Run `repos/arashi-skills` authored/package parity, extracted-package, and semantic validation.
- [ ] 7.4 Run meta-repository coordinated semantic checks and confirm child revisions/artifacts are synchronized.
- [ ] 7.5 Run `openspec validate use-configured-base-across-commands --strict` and record implementation evidence before archive/merge readiness.