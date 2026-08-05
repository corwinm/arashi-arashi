## Context

Arashi's Commander tree exposes 22 command paths and a broad option surface assembled in command-local factories. The same public surface is projected into `contracts/cli-commands.json`, canonical docs and agent exports, and packaged skills. Runtime option handling is not uniform: some repository selectors are scalar comma-separated strings while others are repeatable arrays; only `list` currently establishes `-j` for JSON; and switch uses Commander negated-option properties (`cd === false`, `defaultLaunch === false`) to express positive launch and configured-launcher bypass behavior. The npm entrypoint also intercepts `install` and `update` before Commander, so aliases for those paths must be parsed there as well. No native shell-completion implementation exists in this branch; that separately tracked feature is not part of this change.

The change must preserve automation compatibility, exact JSON stdout contracts, fail-closed repository selection, standalone restrictions, and existing launcher precedence. It also spans CLI, meta contracts, docs, and skills, so source registration alone is not sufficient evidence of completion.

## Goals / Non-Goals

**Goals:**

- Make high-frequency aliases predictable within each command.
- Make switch intent readable as positive behavior while preserving legacy invocations throughout Arashi 1.x.
- Normalize selector input at one shared boundary without weakening explicit-empty, unknown, intersection, or standalone rejection rules.
- Remove silent option precedence and no-op ambiguity.
- Make generated contracts and companion checks enforce the resulting semantics.

**Non-Goals:**

- Add persistent launch/disposition configuration or change the `defaults.switch.mode` vocabulary.
- Change automatic launcher detection, launcher availability/fallback behavior, or tab support mappings.
- Give short aliases to specialized launchers, exact-path options, destructive broad-scope options, or `exec --jobs`.
- Implement native shell completion; this change only keeps the Commander/contract source authoritative for future completion generation.
- Remove compatibility spellings in the same release that introduces their replacements.
- Add `--only` to commands that do not operate on a configured repository collection.

## Decisions

### 1. Normalize option intent before behavior resolution

Commander registrations may expose canonical and compatibility spellings, but command actions SHALL normalize them into semantic intent before calling executors:

- switch behavior intent: omitted, `cd`, or `launch`;
- configured-launcher policy: preserve or ignore;
- selector intent: omitted or explicitly supplied normalized values.

The switch resolver will consume semantic launch intent rather than depending on `cd === false`. Direct executor callers receive the same normalization/validation boundary so they cannot bypass conflicts.

Alternative considered: keep `--no-cd` as the canonical spelling and only improve help. This leaves the common positive launch request expressed as a negation and does not solve the audited usability problem.

### 2. Preserve legacy spellings as deprecated compatibility options

`--no-cd`, `--no-default-launch`, and `handoff --markdown` remain parseable throughout the 1.x release line and may be removed no earlier than Arashi 2.0 through a separately approved breaking-change issue. They are hidden from preferred help/examples, while canonical docs identify migration spellings. A legacy spelling maps to exactly the current behavior and is compatible with its canonical synonym; combining two spellings for the same intent is redundant but not an error.

Human-mode invocations may emit a concise deprecation warning to stderr. JSON mode MUST keep stdout to one envelope and MUST NOT emit human warnings to stdout; if warnings are surfaced, they use the existing structured warning field or stderr policy consistently. Eventual removal is outside this change and requires a separately documented breaking-release boundary.

Alternative considered: immediate removal. Although these spellings are no-op or redundant in some contexts, scripts may pass them, so immediate rejection is unnecessary compatibility damage.

### 3. Define switch behavior and launcher selection as orthogonal axes

Canonical behavior rules are:

| Input | Behavior result | Configured named launcher |
|---|---|---|
| omission | configured/contextual behavior | preserved |
| `--cd` | parent-shell directory switching | incompatible with launch/tab/explicit launcher intent |
| `--launch` | launch | preserved |
| `--ignore-configured-launcher` with configured `auto`, `cd`, or `launch` | preserve that configured/contextual behavior | ignored |
| `--ignore-configured-launcher` with configured `sesh` or `herdr` | retain launch behavior inherited from that configured mode | ignored; use automatic launcher resolution |
| `--launch --ignore-configured-launcher` | launch | ignored; use automatic launch resolution |
| explicit launcher | launch | overridden by explicit launcher |
| `--tab` | launch with tab disposition | bypass configured behavior and named launcher defaults; an explicit launcher supplied with `--tab` remains authoritative |

`--no-cd` is a compatibility synonym for `--launch`; `--no-default-launch` is a compatibility synonym for `--ignore-configured-launcher`. Explicit `--cd` conflicts with `--launch`, `--tab`, and every explicit launcher selector. Canonical/legacy synonyms are compatible with one another. `--tab` remains authoritative over configured `sesh`/Herdr defaults, while a launcher explicitly selected alongside `--tab` remains authoritative. Existing JSON guard precedence, dry-run behavior, and no-fallback rules remain unchanged.

### 4. Normalize selectors by flattening repeated comma-separated values

Every command that exposes `--only` or `--group` accepts repeated occurrences, comma-separated segments within each occurrence, or both. A shared parser flattens in encounter order, trims values, ignores blank segments beside valid values, and removes duplicate normalized values while preserving first occurrence.

The parser separately records whether an option was supplied. Therefore an omitted selector remains distinct from an explicitly supplied value that normalizes empty. Existing unknown repository/group, empty intersection, JSON error, non-mutation, and standalone rejection behavior remains fail-closed.

`status --only` is accepted for configured workspaces and uses the same repository identity and `--group` intersection semantics as sibling repository-aware commands. It does not invent multi-repository selection in implicit standalone mode.

Alternative considered: preserve command-local scalar/array differences. That would make the new common aliases appear consistent while retaining incompatible value syntax.

### 5. Use command-local aliases and reserve `-j` for JSON

Aliases are scoped by Commander subcommand, so `add -n/--name` does not prevent `-n/--dry-run` elsewhere. `-j` is standardized for every registered `--json`; `exec --jobs` remains long-only. Long options remain canonical.

The intended aliases are:

- `-v` for every registered `--verbose`, including `init`;
- `-f` for every registered `--force`, including `init`;
- `-j` for every registered `--json`;
- `-o` for every registered `--only`, including new `status --only`;
- `-g` for every registered `--group`;
- `-n` for every registered `--dry-run`.

No alias is added where the matching long option is absent. Because npm-managed `install` and `update` can be intercepted before Commander, their wrapper parser SHALL recognize `-j` wherever it recognizes `--json`, and update SHALL recognize `-n` wherever it recognizes `--dry-run`; wrapper and native paths must return the same semantics.

### 6. Reject ambiguous update inspection modes before side effects

`update --check --dry-run` is a usage conflict rather than an ordered precedence rule. Human mode returns an actionable non-zero conflict before network/update execution. JSON mode returns exactly one structured error envelope before update execution. Both npm-entrypoint and compiled-command interception paths must enforce the same rule.

Alternative considered: document that `--check` wins. Silent loss of requested dry-run plan remains error-prone and differs from Arashi's explicit conflict handling elsewhere.

### 7. Generate and enforce semantic option policy

The CLI contract remains derived from the Commander tree and gains normalized policy metadata sufficient to represent aliases, canonical-to-compatibility mappings, deprecation status, switch conflicts/implications, selector input forms, and update conflicts. Repository-local tests reject stale, unknown, colliding, or semantically incomplete policy.

The meta checker compares normalized CLI policy with canonical docs, generated exports, and packaged skills. Controlled out-of-repository drift fixtures must prove that alias or switch-policy disagreement fails rather than merely checking presence.

## Risks / Trade-offs

- **Commander negated options can collapse omission and explicit false values incorrectly.** → Normalize from option sources at the command boundary and test omission, canonical, legacy, and combined spellings through both Commander and exported executors.
- **Deprecation warnings can corrupt automation.** → Reserve JSON stdout for one document and cover JSON plus each compatibility spelling; keep warnings structured or on stderr only.
- **Shared selector parsing can turn explicit-empty input into omission.** → Carry a supplied marker independently from normalized values and retain strict empty-filter tests before repository discovery/mutation.
- **Alias additions can collide in nested command scopes or npm interception.** → Enumerate the constructed Commander tree and wrapper-intercepted update/install paths; validate uniqueness command-locally.
- **`status --only` can accidentally hide the parent or suppress diagnostics.** → Reuse the established configured child selection model, specify parent/status summary behavior in tests, and reject selection in standalone mode rather than silently broadening it.
- **Companion surfaces may agree syntactically while drifting semantically.** → Compare normalized policy values and include deliberate mismatch self-tests against source and packaged artifacts.
- **A large cross-command change invites unrelated cleanup.** → Limit implementation to Issue #250's registered aliases, selector normalization, three compatibility spellings, status parity, and update conflict.

## Migration Plan

1. Add RED tests for semantic normalization, conflicts, aliases, selector shapes, JSON isolation, wrappers, and generated contracts before production edits.
2. Introduce canonical options and shared normalization while preserving legacy spellings.
3. Regenerate the CLI command contract and update repository-local drift checks.
4. Update canonical docs and generated exports, packaged skill references, and meta semantic checks in separate child commits/PRs.
5. Publish release notes and migration guidance: `--no-cd` → `--launch`, `--no-default-launch` → `--ignore-configured-launcher`, omit `handoff --markdown`.
6. Retain compatibility spellings throughout Arashi 1.x; removal may occur no earlier than Arashi 2.0 and requires a separately approved breaking-change issue.

Rollback can remove the new canonical spellings and aliases while leaving the compatibility spellings and old selector forms operational. Selector parsing and status filtering changes must be reverted together to avoid docs/contract divergence.

## Open Questions

None. Issue #250's previously open choices are resolved here as: deprecate rather than immediately remove compatibility spellings, reject combined update inspection modes, accept `status --only`, and support both repeated and comma-separated selector input everywhere those selectors are registered.
