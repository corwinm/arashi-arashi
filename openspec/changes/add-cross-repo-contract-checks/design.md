## Context

Arashi currently registers its 20 top-level commands directly in `repos/arashi/src/index.ts`. Docs maintain command pages and a separate command index, skills maintain curated workflow guidance, and VS Code maintains contributed commands, constants, and runtime handlers. These repositories are independently versioned and their normal CI checkouts do not contain siblings. The meta-repo coordinates all four repositories but currently has no root package tooling or CI.

Observed drift includes `push.md` missing from the docs command index and newer CLI commands without explicit VS Code parity decisions. The bootstrap-only `install` command and panel-backed `list` behavior also demonstrate why the checker must distinguish intentional exclusions from defects.

## Goals / Non-Goals

**Goals:**

- Make command names and options derive from the same Commander tree used at runtime.
- Represent semantic policy that runtime introspection cannot infer, especially JSON support and companion-surface expectations.
- Produce deterministic, versioned metadata that standalone child repositories and the meta-repo can validate.
- Report missing coverage, stale references, and intentional exclusions as distinct categories.
- Require every exclusion to include a stable reason.
- Keep curated docs, skills, and editor UX free to differ from one-to-one CLI parity where policy explicitly permits it.

**Non-Goals:**

- Require every CLI option to have an equivalent VS Code control.
- Turn curated `/llms.txt` or skills prose into exhaustive command catalogs.
- Add a public `arashi metadata` command in the initial implementation.
- Couple ordinary child-repository CI to sibling working copies.
- Automatically modify docs, skills, or extension manifests.

## Decisions

### Derive the canonical contract from a reusable Commander program builder

The CLI will extract side-effect-free program construction from `src/index.ts`. Runtime execution and contract generation will call the same builder, preventing a second hand-maintained command list. Commander introspection will provide command paths, descriptions, arguments, options, aliases, and hidden state.

Alternative: parse `arashi --help`. Rejected because help text is presentation-oriented, loses nested and semantic details, and is brittle to formatting changes.

Alternative: maintain a handwritten manifest. Rejected because it recreates the drift problem.

### Supplement structural metadata with typed semantic annotations

A complete annotation map keyed by command path will classify JSON support (`full`, `conditional`, or `unsupported`) and expectations for docs, skills, and VS Code. Exclusions and conditional support MUST carry non-empty reason text. Tests will ensure every registered command has metadata and no metadata points to a nonexistent command.

This preserves the distinction between a command that emits normal machine-readable results and one that only emits a structured unsupported-mode error.

### Check in a deterministic CLI contract artifact

`corwinm/arashi` will generate a versioned JSON artifact under `contracts/`. A freshness script will regenerate it and fail on differences, following the existing generated config-schema pattern. CLI CI can validate the artifact without sibling repositories, while other repositories and the meta-repo can consume it without parsing TypeScript.

### Keep cross-repository policy and orchestration in the meta-repo

The meta-repo will own the comparison script, explicit companion mappings/exclusions, tests, and authoritative cross-repo workflow. CI will explicitly check out each child repository into `repos/<name>` before running the checker. Local execution will use an already populated Arashi workspace.

A lightweight runtime with a pinned version and lockfile will be introduced only for these scripts and tests; the meta-repo remains non-published.

Child CI remains independently useful: the CLI checks contract freshness, and VS Code checks manifest/activation/constants/handler consistency. Optional repository dispatch or reusable-workflow integration can later make child PRs request the authoritative cross-repo check.

### Validate canonical sources, not generated copies

Docs validation will inspect `docs/commands/<command>.md` and `docs/commands/index.md`. Generated `public/` routes and curated `/llms.txt` are not treated as independent exhaustive catalogs. The checker may verify that eligible canonical pages participate in the export pipeline without reporting duplicate drift against generated output.

Skills validation will use explicit structured coverage markers or a small policy manifest rather than guessing command support from arbitrary prose. The prose stays workflow-oriented, while stale command tokens can be checked separately against the canonical command set.

VS Code validation will distinguish CLI-backed contributed commands from extension-only navigation/panel commands. Each CLI command will either map to one or more extension commands or have an explicit reasoned gap. Local tests will additionally ensure contributed commands, activation events, `COMMAND_IDS`, and runtime handlers agree.

### Use stable categorized diagnostics

The checker will emit deterministic diagnostics with stable codes and categories for missing coverage, stale references, invalid mappings, and intentional exclusions. Exclusions are informational in normal output; missing/stale/invalid findings cause a non-zero exit. Human-readable output is the default, with structured JSON available for CI and future automation.

## Risks / Trade-offs

- **[Risk] Semantic annotations become another drift source** → Enforce complete bidirectional coverage against the runtime-derived command tree and require generated-artifact freshness in CLI CI.
- **[Risk] Cross-repo CI validates unrelated default branches rather than coordinated revisions** → Make checkout refs explicit and report repository SHAs; initially validate the coordinated meta workflow and document how child PR refs are supplied.
- **[Risk] Text scanning produces false positives in skills** → Use structured coverage metadata for required support and restrict stale-token scanning to command-shaped references.
- **[Risk] One-to-one parity pressures VS Code into unsuitable workflows** → Encode `mapped`, `represented`, and `excluded` states with mandatory reasons instead of requiring a palette command for every CLI command.
- **[Risk] A new meta-repo toolchain adds maintenance overhead** → Keep dependencies minimal, pin the runtime, and avoid turning the repository into a published package.

## Migration Plan

1. Refactor CLI program construction without changing runtime behavior; add tests before changing production code.
2. Add semantic annotations, generated contract, freshness scripts, and CLI CI validation.
3. Add the meta-repo checker, fixtures/tests, policy, local documentation, and explicit child checkouts in CI.
4. Fix known docs index drift and add machine-readable skills and VS Code mappings/exclusions.
5. Add VS Code local manifest-registration consistency coverage.
6. Enable the authoritative meta-repo check after the initial baseline passes.

Rollback is repository-local: remove the new CI steps and scripts while retaining existing runtime command registration behavior. The generated artifact is additive and does not alter CLI output or user workflows.

## Open Questions

- Whether child repositories should trigger the meta workflow through `repository_dispatch` immediately or in a follow-up after the baseline checker is stable.
- Whether the checker’s structured JSON mode is required in the first implementation or can follow the initial deterministic human report.
- Which current VS Code gaps (`doctor`, `exec`, `handoff`, and `push`) should become mapped features versus explicitly reasoned exclusions during implementation review.
