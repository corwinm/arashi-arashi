## Context

The documentation repository already centralizes semantic checks behind an explicit manifest, a registration guard, and `validate:semantic-docs`. The skills repository still has twelve maintained `*-guidance-selftest.mjs` scripts listed separately in both source and extracted-package workflow blocks. Several focused checkers also inspect workflow text for their own literal invocation. The meta workflow repeats a feature-selected subset of those commands for source and extracted-package trees.

This makes workflow YAML an accidental checker registry. It also splits authority across focused scripts, child workflows, meta workflow steps, and package blocks. The change spans `arashi-skills` and the meta repository, must preserve release-package evidence, and must not weaken focused diagnostics or cross-repository semantic comparison.

## Goals / Non-Goals

**Goals:**

- Establish one explicit, fail-closed skills checker registry in ordinary versioned code/data.
- Provide stable skills aggregate entrypoints for source guidance and an already extracted release-shaped package.
- Make skills and meta CI consume those stable entrypoints rather than checker-specific workflow lines.
- Preserve deterministic order, checker-specific output, nonzero exit propagation, focused commands, package-boundary evidence, and exact workflow path reachability.
- Prove registration, aggregate execution, package execution, and coordinated workflow composition with mutation-based tests.

**Non-Goals:**

- Change Arashi CLI behavior, schemas, guidance content, or checker semantics.
- Move maintainer-only manifests/checkers into the installable skill package.
- Replace focused checker commands used for RED/GREEN TDD and diagnostics.
- Introduce a package manager or third-party dependency into `arashi-skills` solely to name aggregate commands.
- Re-run every focused checker inside every meta contract mutation fixture; dedicated aggregate acceptance remains the execution proof.

## Decisions

### 1. Use an explicit sorted manifest plus separate registration and execution entrypoints

`arashi-skills` will keep a manifest under `scripts/` containing every maintained guidance checker filename in deterministic order. A registration guard will compare that manifest with the repository's maintained checker naming convention and reject missing, stale, duplicate, malformed, or unsorted entries. A runner will execute only registered entries in manifest order.

This is preferred over an unconstrained runtime glob because registration remains reviewable and fail closed. It is preferred over a hard-coded JavaScript array because a data manifest is easy for self-tests and meta fixtures to mutate without parsing implementation source.

Security gate self-tests are not semantic guidance checkers and remain outside this manifest.

### 2. Keep source and package modes explicit on one runner

The runner's default mode validates the authored skill tree. `--skill-root <path>` validates an already extracted package tree by forwarding that root to every registered checker. `--meta-root <path>` is a source-mode context option forwarded where coordinated workflow reachability is part of the checker contract. Package creation/extraction remains owned by the workflow or caller so the aggregate cannot accidentally validate the source tree in place of the artifact.

The runner will print a stable checker heading before each child process, inherit child output, fail immediately with the checker identity and status when a child cannot start or exits nonzero, and print a final count only after all registered checks pass.

This reuses the checkers' current `--skill-root` interface and preserves actionable per-checker diagnostics. A separate source runner and package runner would duplicate registration and process semantics.

### 3. Centralize workflow reachability without making each feature checker parse YAML

The registration self-test will own assertions that authoritative skills workflows invoke the stable registration/source/package entrypoints and preserve their existing trigger scope plus package creation/extraction boundaries. The skills pull-request workflow is intentionally unfiltered today and the tag-release workflow has no path filter, so this change will not invent narrower child trigger filters. Feature-focused scripts will continue checking their semantic domain and deliberate drift fixtures, but will no longer require literal feature-specific workflow commands.

The meta self-tests will assert that the coordinated workflow invokes the stable docs aggregate, the stable skills source aggregate, the stable skills extracted-package aggregate, and the meta contract aggregate, and that its path filters continue to include child checker, manifest/runner, guidance, generated-contract, package-boundary, and workflow inputs. Dedicated acceptance fixtures will replace one registered child checker with a deterministic pass/fail sentinel to prove the aggregates execute registered children and propagate failures.

This avoids a circular design where removing feature-specific workflow lines causes each focused checker to fail, while retaining executable reachability evidence stronger than substring-only checks.

### 4. Keep package assembly and validation boundaries visible

Skills release workflows will still create and extract the release-shaped archive before invoking package-mode aggregate validation. The aggregate runner and manifest remain maintainer tooling outside `skills/arashi/`; they are not added to the installable package. Tests will prove package mode reads the supplied extracted root and fails when that copy drifts even if the source tree is correct.

The meta workflow will create/extract its coordinated skills fixture once and invoke the same package aggregate. It will not enumerate a feature-selected package subset.

### 5. Compose stable aggregates once in authoritative CI

The skills workflows will retain security scanning and security-gate self-tests, then call the semantic registration/source aggregate and package aggregate at their existing security/package stages. The meta workflow will retain prerequisite CLI contract generation and docs content generation, call `validate:semantic-docs`, call the skills source and package aggregates, and then run the meta contract aggregate in its CI mode.

Feature-specific lines are removed only after aggregate acceptance is green. Workflow YAML remains editable when topology, permissions, runtime, trigger paths, or artifact assembly genuinely changes.

## Risks / Trade-offs

- **A checker accepts package mode incorrectly or ignores `--skill-root`.** → Registration/aggregate tests run every checker against a mutated extracted fixture and require the failure to identify the packaged copy; existing focused package commands remain available.
- **Broad filename discovery classifies unrelated self-tests as guidance checkers.** → Use a narrow maintained suffix and explicit exclusions encoded in the registration guard; test both omission and unrelated-script cases.
- **Removing per-feature YAML assertions weakens reachability evidence.** → Replace them with one central workflow-composition self-test plus executable sentinel acceptance for source and package aggregates.
- **Meta contract fixtures become slower by launching all children repeatedly.** → Keep full aggregate execution in dedicated acceptance cases; ordinary semantic mutation fixtures use the existing CI skip mechanism after dedicated child aggregates have run.
- **Runner output obscures the failing semantic domain.** → Print deterministic headings, inherit output, and include the registered checker name in startup/exit diagnostics.
- **Workflow and local commands diverge.** → Self-tests compare authoritative workflow invocations with the stable entrypoint contract and CI runs those same entrypoints.

## Migration Plan

1. Add failing skills registration/runner tests and fixtures for omitted registration, stale registration, deterministic order, source execution, package execution, and child failure propagation.
2. Add the manifest, registration guard, and aggregate runner; migrate focused checkers away from literal feature-specific workflow assertions.
3. Switch skills source/package workflows to the stable entrypoints and verify the complete security and release-shaped package gates.
4. Add failing meta workflow-composition and aggregate acceptance tests, then replace feature-specific skills steps with stable source/package aggregate invocations.
5. Run focused, source, package, meta contract, type, format, and workflow-reachability gates before child PRs. Merge the skills child first, then re-run the meta PR against child `main` fallback.

Rollback is a normal revert of the child and meta commits in reverse dependency order. No persisted user state or runtime migration is involved.

## Open Questions

None. Exact script filenames may follow repository conventions during implementation, but their source/package modes and fail-closed behavior are normative.
