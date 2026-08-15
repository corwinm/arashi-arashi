## Context

The documentation repository already centralizes semantic checks behind an explicit manifest, a registration guard, and `validate:semantic-docs`. The skills repository still has twelve maintained `scripts/*-guidance-selftest.mjs` scripts listed separately in source and extracted-package workflow blocks. Eight focused checkers also inspect workflow text for literal feature-specific invocations. The meta workflow repeats a feature-selected subset of those commands, while root `contracts:check` and `contracts:check:ci` hard-code the two maintained `scripts/check-*-contracts.ts` entrypoints.

Workflow YAML and package scripts are therefore accidental checker registries. Authority is split across focused scripts, child workflows, meta workflow steps, and inconsistent package blocks. The change spans `arashi-skills` and the meta repository, must preserve release-package evidence, and must not weaken focused diagnostics or cross-repository semantic comparison.

## Goals / Non-Goals

**Goals:**

- Establish explicit, fail-closed checker registries for skills guidance and maintained meta contract entrypoints.
- Provide stable skills aggregate entrypoints for source guidance and the extracted subtree of a canonical release archive.
- Make every advertised aggregate run its registration guard as a mandatory preflight.
- Make skills and meta CI consume stable entrypoints rather than checker-specific workflow lines.
- Preserve deterministic order, checker-specific output, nonzero exit propagation, focused commands, exact package-boundary evidence, and coordinated workflow path reachability.
- Keep local and CI coordinated stage sets aligned while avoiding duplicate child execution in CI.
- Prove registration, aggregate execution, package execution, and coordinated composition with mutation-based tests written before implementation.

**Non-Goals:**

- Change Arashi CLI behavior, schemas, guidance content, or semantic checker policy.
- Move maintainer-only manifests, runners, or checkers into the installable skill package.
- Replace focused checker commands used for RED/GREEN TDD and diagnostics.
- Introduce a package manager or third-party dependency into `arashi-skills` solely to name aggregate commands.
- Re-run every child aggregate inside every meta mutation fixture after dedicated executable acceptance has proven the same stage.

## Decisions

### 1. Use explicit sorted manifests whose aggregate runners fail closed

`arashi-skills` will register every maintained guidance checker as a repository-relative identity matching exactly `scripts/<basename>-guidance-selftest.mjs`. `<basename>` is one or more lowercase ASCII letters, digits, or hyphens, beginning and ending with an alphanumeric character. Entries must use `/`, be unique, contain no absolute path, `.` or `..` segment, resolve to a regular non-symlink file inside the repository, and appear in ascending bytewise UTF-8 order.

The skills registration guard will compare the manifest with the narrow `scripts/*-guidance-selftest.mjs` inventory and reject malformed, omitted, stale, duplicate, or unsorted entries. The glob is an omission detector, not execution authority. Security-gate and aggregate self-tests do not match the maintained suffix and stay outside the manifest.

The skills aggregate runner will invoke this guard as a mandatory preflight in both source and package modes before it starts any child. The focused guard remains directly runnable for diagnostics. A manifest omission can therefore never false-pass through the advertised aggregate.

The meta repository will use the same pattern for its maintained repository-relative `scripts/check-<basename>-contracts.ts` entrypoints. A meta manifest/guard will reject malformed, omitted, stale, duplicate, or unsorted entries, and one runner will consume the manifest for both local and CI modes. `contracts:check` and `contracts:check:ci` will call that runner rather than hard-code command and hook checker filenames. CI mode may forward the existing child-execution skip flag, but cannot skip meta registration.

Explicit data manifests are preferred over unconstrained runtime globs and hard-coded JavaScript/package-script arrays because registration stays reviewable, mutation-testable, and fail closed.

### 2. Keep source and package modes explicit on one skills runner

The skills runner's default mode validates the authored tree. `--skill-root <path>` validates an already extracted skill tree and is forwarded to every registered checker. Package creation/extraction remains owned by a canonical artifact producer and its caller, so the aggregate cannot accidentally validate source in place of the artifact.

The runner prints a stable heading before each child, inherits child output, continues through all registered children to collect actionable failures, and exits nonzero with every checker identity and startup, signal, or exit-status class. It prints a final success count only if registration and every child pass.

Existing focused forms remain valid:

```bash
node scripts/<feature>-guidance-selftest.mjs
node scripts/<feature>-guidance-selftest.mjs --skill-root <extracted-skill-root>
```

Cross-repository workflow wiring is removed from focused checkers and owned by meta tests; `--meta-root` is not part of the stable skills aggregate interface.

### 3. Centralize workflow reachability without feature checkers parsing YAML

The skills aggregate self-test owns assertions that authoritative workflows invoke one source aggregate and one package aggregate, that each aggregate includes registration preflight, and that package creation/extraction precede package validation. The skills pull-request workflow is intentionally unfiltered and the tag-release workflow has no path filter, so the migration preserves rather than narrows child trigger scope.

The meta self-tests assert that the coordinated workflow invokes the stable docs aggregate, skills source aggregate, skills package aggregate, and meta aggregate exactly once, contains no feature-specific skills checker commands, reports exact child revisions, and retains all coordinated path-filter inputs. Dedicated sentinel acceptance proves registered child failures propagate through source and package modes. Ordinary semantic mutation fixtures may use CI skip mode only after those executable stages remain reachable.

### 4. Define one canonical release artifact and semantic package boundary

`arashi-skills` will provide one dependency-free canonical release-archive producer or producer-owned member manifest consumed by pull-request, tag-release, and meta validation. The exact allowed top-level members are `skills/`, `README.md`, `LICENSE`, and `security/`; `scripts/`, `contracts/`, mutation fixtures, and platform metadata such as AppleDouble entries are forbidden. Archive-boundary tests prove the bytes validated are the bytes eligible for upload.

Package semantic validation is explicitly scoped to the extracted `skills/arashi` subtree supplied through `--skill-root`. A separate boundary assertion proves that subtree came from the canonical archive and that maintainer tooling did not leak. This separates semantic checker input from whole-artifact membership without weakening either contract.

### 5. Compose stable aggregates once and align local/CI stage sets

The docs aggregate is the sole owner of docs content/export generation in coordinated validation. The meta workflow removes its standalone `sync:content` step and invokes `pnpm --dir repos/arashi-docs validate:semantic-docs` before tests that consume generated outputs.

The documented local coordinated path and authoritative CI both comprise the same four semantic stages: docs aggregate, skills source aggregate, skills package aggregate against the canonical archive, and meta aggregate. Local mode may execute all four through a documented command sequence or coordinator. In CI, the workflow owns the three child stages exactly once and invokes `contracts:check:ci`; CI skip mode prevents the meta aggregate from rerunning already-proven children.

A stage-set alignment test compares the documented local path, package scripts/coordinator, and workflow so none can omit or duplicate a stage. CLI schema, command, completion generation/freshness, tests, and typecheck remain prerequisites and run once at their existing boundaries.

### 6. Order RED coverage before dependent production changes

Skills registration/aggregate, meta registration/aggregate, coordinated workflow composition, local-path alignment, and canonical package-boundary tests are introduced as failing fixtures before either repository adds production entrypoints. Child implementation then makes the skills tests green; the meta implementation consumes the merged child contract. This preserves meaningful RED evidence rather than adding tests after their dependencies already exist.

## Risks / Trade-offs

- **A checker ignores `--skill-root`.** → Package acceptance mutates only extracted bytes and requires the owning checker to fail.
- **A new checker false-passes through an aggregate.** → Every aggregate runs registration first; omission/stale/duplicate/malformed/order mutations are tested in both modes.
- **Broad discovery captures unrelated scripts.** → Grammar and discovery patterns are exact and locale-neutral.
- **Removing per-feature YAML assertions weakens reachability.** → Central composition checks plus executable sentinel acceptance are stronger and bounded.
- **Release shapes drift.** → All three producers/consumers share one canonical member policy and exact boundary tests.
- **Meta fixtures become slow.** → Dedicated acceptance executes children; ordinary fixtures retain explicit CI skip semantics.
- **Local and CI commands diverge.** → A stage-set alignment test checks documentation, scripts, and authoritative workflow together.

## Migration Plan

1. Add failing skills registration, source/package aggregate, canonical archive, and workflow-composition tests.
2. Add failing meta registration, local/CI stage-alignment, workflow-composition, and executable child-aggregate tests.
3. Implement the skills manifest, mandatory-preflight runner, canonical archive producer/member policy, and focused-checker workflow decoupling; migrate skills workflows.
4. Deliver and merge the skills child PR.
5. Implement the meta manifest/runner, documented local path, docs-generation deduplication, stable child aggregate composition, and feature-era fixture migration.
6. Run exact focused, aggregate, package-boundary, security, meta contract, type, format, and workflow gates; deliver the coordinating PR.
7. Mark active implementation tasks complete and validate the active change before archiving it in a separate step.

Rollback is a normal revert of child and meta commits in reverse dependency order. No persisted user state or runtime migration is involved.

## Open Questions

None.
