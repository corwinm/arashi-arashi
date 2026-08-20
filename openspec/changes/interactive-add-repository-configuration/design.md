## Context

`executeAdd` currently owns URL validation, topology resolution, managed-ignore reconciliation, cloning, coordinated child branch/worktree creation, setup-script detection, one locked configuration write, and rollback. Its only interactive prompt is the duplicate-repository clone fallback, implemented through the shared `lib/prompts.ts` outcome wrapper. The new onboarding prompts must run after repository materialization and inspection but before the existing final config write, so every cancellation after clone becomes part of add's rollback boundary.

The accepted configuration model already has canonical repository-owned `copy`, `symlink`, and `hooks` fields. Materialization paths are normalized by `normalizeMaterializationPath` through config normalization, and inline hook values are normalized to interpreter maps by canonical config validation. Hook command text is intentionally sensitive and must not appear in logs, summaries, diagnostics, snapshots, or structured output.

Issue #316 will later add an interactive editor for existing workspace and repository configuration. This change therefore needs a reusable editor boundary, but it must not prematurely expose all schema fields or implement an existing-entry command.

## Goals / Non-Goals

**Goals:**

- Add one optional, concise, human-TTY repository onboarding flow to `aw add`.
- Reuse the exact accepted config shapes and semantic validators for repository `copy`, `symlink`, and inline hooks.
- Establish a typed, pure configuration-editor model that can represent configured and unset supported fields, collect a candidate in memory, validate it, and produce a sanitized summary.
- Discover likely ignored local paths without reading contents or recursively inventorying ignored trees.
- Keep add's existing transaction, concurrency, rollback, JSON, and non-interactive contracts intact.
- Make prompt orchestration injectable and PTY-testable without moving persistence into UI callbacks.

**Non-Goals:**

- Implement `aw configure` or edit an existing repository entry.
- Generate an editor directly from JSON Schema or expose every config field.
- Add config schema fields, alternate parsers, automatic selections, inferred commands, or non-interactive value flags.
- Inspect candidate file contents, infer secrets, execute entered hooks, or diagnose whether configured values are effective at runtime.
- Configure workspace-root hooks or user-global state.

## Decisions

### 1. Define explicit typed field descriptors instead of deriving prompts from JSON Schema

A configuration-editor module will own explicit descriptors for the repository onboarding subset. Each descriptor identifies canonical path/scope, configured-versus-unset state, concise display metadata, sensitivity, prompt/validation adapter, and sanitized projection. Copy, symlink, and each repository hook lifecycle remain canonical config values; descriptors do not create a parallel persisted model.

The module exposes pure operations over a cloned candidate config/repository entry. Prompt adapters consume descriptors and return controlled outcomes, while add retains lifecycle and persistence ownership. The descriptors are intentionally extensible so #316 can add workspace/meta/default scopes without rewriting the repository field definitions.

**Alternative considered:** Generate prompts from `schema/config.schema.json`. Rejected because JSON Schema does not encode prompt order, ownership, inherited/effective values, sensitive projections, contextual warnings, or safe candidate discovery. A generic schema editor would also expose unsupported scope in #274.

### 2. Keep canonical semantic validation authoritative

Prompt-level checks provide immediate, recoverable feedback, but accepted answers are assembled into the real `RepoConfig` shape and validated through the same canonical normalization path used for file-based config. Materialization input delegates to the existing path normalizer and collision policy; hook input delegates to canonical lifecycle/interpreter/value normalization. No prompt-local parser may accept a value canonical loading would reject or rewrite a value differently.

Validation returns field-attributed diagnostics to the relevant section when safely recoverable. Before summary, the complete candidate workspace config is normalized and validated in memory. Only that normalized candidate can reach persistence.

**Alternative considered:** Validate only after all prompts. Rejected because it creates a poor retry experience and encourages duplicated ad hoc error parsing. Per-field adapters plus one complete-candidate validation preserve both usability and authority.

### 3. Separate editor state, prompt I/O, discovery, and persistence

The implementation will separate four boundaries:

1. **Editor model:** pure descriptors, candidate mutation, normalization result, and sanitized summary.
2. **Prompt controller:** TTY flow and controlled `ok`/`cancelled` outcomes using `lib/prompts.ts`, with injectable handlers for deterministic tests.
3. **Candidate discovery:** filesystem/Git metadata only, returning bounded path suggestions.
4. **Persistence:** expected-byte concurrency check and one save, still called by add's existing transaction.

The editor model never writes files. The prompt controller never mutates the live config object incrementally. Add receives either a complete normalized repository candidate, a top-level onboarding decline, or controlled cancellation.

For future #316, the same editor model and expected-byte persistence primitive can be used around a different scope selector and transaction owner. This is a concrete consumer-driven boundary, not speculative generic infrastructure.

**Alternative considered:** Put prompts directly inside `executeAdd` and extract later. Rejected because it would duplicate descriptors, validation, summaries, and cancellation semantics in #316 and make add's already-large transaction harder to test.

### 4. Prompt only under one centralized eligibility predicate

Onboarding is eligible only when both stdin and stdout are TTYs and neither `--json` nor `--force` is active. In every other mode, add constructs and saves the current minimal repository entry without calling discovery or any onboarding prompt.

The first prompt defaults to no. Declining it is not cancellation and proceeds with minimal add. Once the user opts in, Ctrl+C at any prompt or declining the final sanitized confirmation returns controlled cancellation to add, which enters its existing rollback path and performs no config save. Validation errors return to the owning section without persistence.

**Alternative considered:** Treat final-confirmation decline as minimal add. Rejected because the user has explicitly reviewed a complete proposed mutation; silently discarding it while still adding the repository is surprising and differs from cancellation expectations in the issue.

### 5. Discover suggestions through a bounded metadata-only root scan

Discovery runs against the canonical cloned main checkout, which owns future materialization sources. It enumerates only a bounded number of root entries, applies a small explicit set of likely-local name patterns (for example `.env` variants and known local cache/config names), and asks Git ignore classification only for those paths. It records repository-relative names and basic file/directory kind only; it never opens files, hashes them, previews them, follows directory trees, or prints contents.

Suggestions remain unselected. Users can enter other paths manually, and every entered path still passes canonical path validation. `node_modules` is neither scanned nor suggested; manual entry produces the existing dependency-sharing warning before final confirmation.

Discovery limits and ordering are deterministic and platform-portable. Failure to discover suggestions is non-fatal and leaves manual entry available, but a bounded human diagnostic may explain that suggestions were unavailable without exposing paths outside the repository.

**Alternative considered:** Run an unbounded recursive ignored-file inventory. Rejected for performance, secret-surface, and output-volume reasons.

### 6. Collect path lists and hook values without revealing sensitive text

The section checklist defaults every choice to unselected. Selected copy/symlink sections show unselected discovered suggestions and permit repeated manual path entry. Duplicate/collision errors are attributed using canonical normalized paths. Manual dependency-directory entries are retained only after warning; no automatic rejection is added beyond #273.

Selected hook setup first chooses lifecycle names, then chooses Bash shorthand or explicit interpreter variants for each selected lifecycle. Every command body is user supplied. Setup-script detection may be mentioned as context but never pre-fills or derives a command. Internal candidate state contains the text only as required for persistence; all public summary/log/error/JSON projections list lifecycle and interpreter presence only.

**Alternative considered:** Print a masked prefix or command length. Rejected because even partial text or shape-derived metadata expands the established secrecy surface without product value.

### 7. Preserve one add-owned save and exact rollback evidence

After onboarding, add creates one complete `RepoConfig` containing `path`, `gitUrl`, and any selected canonical fields. It performs the existing expected-byte check under the config lock and calls `saveConfig` once. Prompt collection and validation do not write temporary config state.

Add's persisted-byte snapshot and rollback ownership must include the complete repository entry, not only `path` and `gitUrl`, when deciding whether a concurrently modified entry is invocation-owned. If the save fails or a post-save hook fails, rollback restores exact pre-command bytes where ownership is proven and preserves unowned newer bytes otherwise. Existing canonical clone, coordinated worktree/branch, and managed-ignore cleanup ordering remains unchanged.

**Alternative considered:** Save after each section. Rejected because partial onboarding would escape on cancellation or validation failure and violate the established add transaction.

### 8. Validate behavior at pure, executor, and PTY boundaries

Strict TDD will establish RED evidence before implementation for:

- field descriptors, configured/unset states, candidate mutation, normalization, collisions, and sanitized summaries;
- bounded suggestion discovery and content non-reading;
- add executor eligibility, decline, mixed selections, retries, final decline, cancellation, single-save, and rollback ownership;
- real terminal-byte PTY journeys for all acceptance paths and stdout/stderr secrecy;
- unchanged `--force`, `--json`, non-TTY, duplicate fallback, `--create-setup`, direct, bare, and linked-parent behavior;
- generated command/docs/skill/coordinated semantic contracts.

Tests will use raw terminal sequences expected by Inquirer rather than symbolic key names. Hook-body canaries must prove absence from captured stdout, stderr, JSON, diagnostics, snapshots, and generated artifacts.

## Risks / Trade-offs

- **[Risk] The reusable editor becomes an over-generalized framework before #316.** → Limit descriptors and prompt adapters to the concrete repository fields consumed by #274 while keeping types scope-aware and pure.
- **[Risk] Prompt code diverges from config validation.** → Require canonical normalizers for every accepted value and one complete-candidate normalization before summary/save.
- **[Risk] Candidate discovery exposes or traverses sensitive ignored trees.** → Root-only bounded metadata scan, explicit candidate patterns, no content reads, no recursion, unselected output.
- **[Risk] Hook text leaks through errors or tests.** → Central sensitive projection, canary tests across every output boundary, and no raw candidate serialization.
- **[Risk] Extra prompts break automation or JSON isolation.** → Central eligibility predicate tested at Commander and exported-executor boundaries before discovery/prompt calls.
- **[Risk] Cancellation after clone leaves state behind.** → Route controlled prompt cancellation through add's existing rollback path and assert final observed state at every prompt stage.
- **[Risk] A concurrent edit is overwritten or mistakenly removed.** → Preserve expected-byte locking and compare the complete invocation-owned repository entry during rollback.
- **[Trade-off] Root-only suggestions miss some useful nested ignored paths.** → Manual entry remains available; bounded advisory discovery is safer than comprehensive inventory.

## Migration Plan

1. Add RED tests and contract fixtures without changing production behavior.
2. Introduce the pure editor model, prompt controller interfaces, and bounded discovery behind add's existing behavior.
3. Wire eligible human add invocations to onboarding and keep all other modes on the current minimal path.
4. Update and regenerate CLI/docs/skills/meta contract surfaces; validate child repositories independently and through coordinated checks.
5. Deliver separate child PRs with non-closing references, merge them after exact-head gates, then archive/sync and merge the meta PR last with the sole closing reference.

Rollback is a normal code rollback: existing config files require no migration because no schema changes are introduced. Reverting the feature restores minimal add behavior while configurations written with canonical #271/#273 fields remain valid.

## Open Questions

None. The issue and follow-up #316 establish the scope boundary: #274 creates and consumes the repository subset; #316 expands the editor to existing workspace/repository settings.
