## Context

Arashi constructs its complete Commander tree in `repos/arashi/src/cli-program.ts`, serializes canonical structure plus typed semantics through `src/contracts/cli-commands.ts`, and checks the generated `contracts/cli-commands.json` for drift. Bash, Zsh, and Fish wrapper generation and CLI-managed startup-file installation currently live in `src/commands/shell.ts` and `src/lib/shell-integration.ts`; the release installer independently writes the same marker family from `scripts/install.sh`. Both producers currently load only the parent-shell wrapper.

Issue #250 has already standardized aliases and typed option policy on current `main`, so completion must consume that current metadata rather than copy the older option surface. The feature spans CLI runtime/build/package behavior, three native shell adapters, local workspace/Git discovery, canonical docs and exports, packaged skills, and coordinated semantic validation.

Constraints include machine-only completion output, no network or mutation, safe repeated interactive invocation, lossless candidate transport, deterministic generated artifacts, compatibility with both direct executable and wrapper function use, and real-shell acceptance coverage.

## Goals / Non-Goals

**Goals:**

- Deliver `arashi completion <bash|zsh|fish>` from one Commander-derived canonical model.
- Support accurate static command, option, argument, choice, alias, canonical description, conflict, and boundary completion, with native description display where the shell supports it.
- Add bounded local dynamic candidates for repository selectors, groups, worktrees/branches, shells, and constrained option values.
- Activate completion idempotently through `arashi shell install` while preserving wrapper-only `shell init` output.
- Embed deterministic artifacts so npm-installed and standalone binaries behave identically.
- Enforce source, docs, exports, and packaged-skill agreement locally and in coordinated CI.

**Non-Goals:**

- Supporting shells other than Bash, Zsh, and Fish.
- Plugin-manager-specific installers or framework-specific completion branches.
- A new shell-integration uninstall command; managed-block replacement only removes stale lines inside existing markers.
- Network-backed candidates, remote branch discovery, fuzzy interactive pickers, or completion-time mutation.
- Persisted completion configuration or separately managed cached completion files in v1.
- Adding duplicate public paths such as `arashi shell completion`.

## Decisions

### 1. Add a top-level completion command with one hidden internal query

`completion` is a top-level command with required shell choice. A hidden implementation-only query beneath that command accepts a numeric cursor index and the exact argument vector after `--`; shell adapters invoke it as `command arashi` so the wrapper cannot recurse. Keeping generation public and dynamic lookup hidden avoids exposing two user workflows while retaining one testable runtime boundary.

Alternative: place completion beneath `shell`. Rejected because completion is useful independently of parent-shell switching and the issue has confirmed the top-level shape.

### 2. Build a canonical completion model from Commander plus typed semantic policy

A new completion-model builder traverses `buildProgram({ includeHelpBanner: false })`, including the root program and applicable Commander-provided help/version options that the current command-path contract does not serialize. Commander supplies names, aliases, descriptions, options, arguments, hidden state, and declared conflicts; typed command policy supplies finite choices, semantic conflicts, and dynamic candidate kinds where Commander metadata is insufficient. Hidden implementation-only commands/options remain callable where required but are excluded from interactive suggestions. The generated CLI contract serializes those additions so one freshness gate covers both companion policy and completion inputs.

Alternative: generate directly from help text or handwritten shell templates. Rejected because formatted help is lossy and a separate inventory would drift after changes such as #250.

### 3. Generate shell artifacts at development/build time and embed them

One deterministic generator renders Bash, Zsh, and Fish source files from the canonical model. Runtime command code imports the generated sources as embedded strings, so Bun compilation includes them in standalone binaries. Generation runs before relevant builds and a check mode compares bytes without rewriting. Npm installation continues through its canonical binary-install path, and package acceptance begins without a platform binary, installs the packed artifact against a local release fixture, and proves first-use installer output cannot contaminate completion stdout before exercising the downloaded/current binary.

Alternative: generate on every shell startup. Rejected because rebuilding the full model at startup adds unnecessary latency and complicates stdout isolation. Separate cache files are deferred until real measurements justify migration and ownership complexity.

### 4. Keep shell rendering native and isolated

The shared model and query return shell-neutral records with canonical descriptions. Zsh rendering uses `_arashi`/`compdef` and conditionally initializes `compsys` only if completion is unavailable. Bash uses built-in programmable completion without requiring `bash-completion`; because native Bash has no per-candidate description channel, it keeps candidate values unpolluted while model tests preserve the descriptions. Fish uses native `complete` and displays descriptions. Each adapter is responsible only for context collection, invoking the internal query when needed, native presentation, and safe insertion.

Alternative: depend on a third-party cross-shell completion library. Rejected to avoid a runtime framework dependency and because Arashi needs custom bounded workspace candidates and exact wrapper compatibility.

### 5. Use a NUL-delimited dynamic record protocol

The internal query emits alternating NUL-terminated value and description fields. Shell adapters consume the stream directly rather than through command substitution, preserving every representable argv character except NUL, which operating-system argument vectors cannot contain. The query receives the already-tokenized words and cursor index after `--`, avoiding shell re-parsing.

Alternative: newline/TSV output. Rejected because valid candidate values and descriptions can contain whitespace or newlines. JSON was also rejected for shell adapters because parsing it safely would require a non-native dependency or substantial duplicated parsers.

### 6. Centralize read-only candidate resolution with one invocation cache

A resolver maps typed candidate kinds to existing configuration, workspace-context, repository inventory, and local Git worktree/branch inspection helpers. One query context memoizes workspace/config/Git discovery. Errors, unavailable metadata, and budget exhaustion become a successful empty dynamic result. The resolver never runs hooks, prompts, network commands, mutation commands, or child-repository lifecycle operations.

The initial implementation documents and tests a 200 ms wall-clock budget for dynamic discovery. The budget is applied to the query as a whole rather than independently per candidate kind, preventing multiplicative latency.

Alternative: parse `arashi list`, `status`, or other human/JSON command output. Rejected because those commands carry broader behavior, formatting, and error contracts and can perform more work than completion requires.

### 7. Extend the existing managed block, not `shell init`

`buildShellInstallBlock()` emits two separate activation statements: wrapper first, completion second. Bash/Zsh use `eval` for wrapper output and `source <(...)` for completion; Fish pipes each command to `source`. Existing marker-based replacement upgrades wrapper-only blocks and remains idempotent. The optional shell-integration path in `scripts/install.sh` must emit the same current block instead of retaining a second wrapper-only producer; cross-producer fixtures prove that a release-installer block is recognized or upgraded by `arashi shell install`. Manual setup remains independently composable because `shell init` does not embed completion code.

Alternative: append completion definitions to wrapper output. Rejected because it couples independent concerns, makes manual opt-in impossible, and would regenerate a larger program on every wrapper setup call.

### 8. Verify generated text and actual completion behavior

Unit tests cover model derivation, deterministic rendering, context parsing, and candidate resolution. Integration tests spawn the real CLI and assert machine-only output and non-mutation. Acceptance tests run clean Bash, Zsh, and Fish processes against both direct and wrapper invocation, with static outside-workspace and dynamic temporary-workspace fixtures. Packaging tests exercise the canonical packed-npm install path and compiled standalone binary rather than only source entrypoints.

## Risks / Trade-offs

- **Interactive latency from process startup and Git discovery** → Embed static artifacts, invoke dynamic lookup only for classified contexts, cache discovery within one query, enforce the 200 ms whole-query budget, and measure acceptance runs.
- **Shell context differences create inconsistent candidates** → Keep context parsing fixtures and candidate expectations shell-neutral, then require an equivalent three-shell smoke matrix.
- **NUL stream handling differs among shells** → Isolate protocol readers per adapter and test spaces, tabs, newlines, quotes, backslashes, and glob characters in real shells.
- **Zsh frameworks may already own initialization** → Detect existing completion functions before conditional `compinit`; never reset `fpath` or rerun initialization unconditionally.
- **Generated artifact or companion drift** → Make generation deterministic, extend contract freshness, add a focused coordinated semantic checker with deliberate-mismatch self-tests, and wire both to CI.
- **Npm install and standalone build paths diverge** → Exercise each distribution through its real install/build boundary and compare supported commands and representative behavior rather than trusting source-level tests.

## Migration Plan

1. Add failing model, renderer, protocol, query, shell-install, real-shell, packaging, and coordinated checker tests.
2. Implement canonical policy/model and generated artifacts, then the public command and hidden query.
3. Upgrade the marker-managed startup block; existing users receive completion the next time they run `arashi shell install`.
4. Update docs, generated exports, and packaged skills after runtime contracts are green.
5. Release through the existing CLI distribution paths; no config migration is required.

Rollback removes the new command, generated artifacts, query, and completion activation line while preserving the existing marker-managed wrapper and all content outside that block.

## Open Questions

None. The supported shells, command shape, activation model, v1 dynamic scope, distribution model, and native-shell compatibility decisions are confirmed by issue #251.
