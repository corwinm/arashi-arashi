## Context

The workspace currently has no dedicated command for cloning repositories that are already configured but missing locally. This causes confusing workflows during first-time setup and when teammates add repositories later. Related UX issues already exist in `status` (missing repositories surface as git spawn errors) and `add` (duplicate-repository guidance suggests incorrect remediation).

The change introduces a clone-focused workflow that must coordinate CLI command behavior, repository/config metadata, filesystem discovery, and user prompts across interactive and automation-friendly modes.

## Goals / Non-Goals

**Goals:**
- Provide a first-class `arashi clone` command that clones only missing configured repositories.
- Support default interactive selection and a non-interactive clone-all path.
- Reconcile unmanaged local repositories with explicit user actions (add to config, delete, ignore).
- Keep clone URL protocol usage (SSH/HTTPS) consistent per user when possible.
- Replace misleading `status` and `add` guidance with clone-oriented remediation.

**Non-Goals:**
- Redesigning full repository lifecycle semantics beyond clone/setup discovery flows.
- Supporting non-git repository sources.
- Persisting long-term audit history of clone/reconciliation actions.

## Decisions

### 1) Add a dedicated clone command with two execution modes
- **Decision:** Implement `arashi clone` with default interactive selection and `--all` for non-interactive cloning of all missing configured repositories.
- **Rationale:** Interactive mode is safest for day-to-day use; `--all` supports automation and first-time bootstrap.
- **Alternatives considered:**
  - Extend `setup` only: rejected because clone-specific discovery and reconciliation become harder to discover and reason about.
  - Make clone always non-interactive: rejected due to higher accidental clone risk and worse UX for selective workflows.

### 2) Normalize repository metadata to include clone URL
- **Decision:** Ensure each configured repository has a persisted git URL usable by clone operations; update `add` to always store URL metadata.
- **Rationale:** Clone cannot be reliable without canonical source URL data in configuration.
- **Alternatives considered:**
  - Infer URL from local clones only: rejected because missing repos have no local remote to inspect.
  - Require URL input every clone run: rejected due to poor UX and duplicated user effort.

### 3) Use a discovery classification pipeline before prompt/rendering
- **Decision:** Build a single discovery pass that classifies repositories into:
  - configured + present
  - configured + missing (clone candidates)
  - local + unmanaged (not in config)
- **Rationale:** A structured classification model keeps prompt logic deterministic and reusable across `clone`, `status`, and `add` fallbacks.
- **Alternatives considered:**
  - Inline checks inside each command: rejected due to duplicated logic and inconsistent edge-case behavior.

### 4) Infer protocol preference from existing URLs, prompt only when ambiguous
- **Decision:** Infer SSH/HTTPS preference from existing configured repository URLs (or local remotes when needed). If no clear preference exists, prompt once per clone operation.
- **Rationale:** Preserves user conventions while avoiding unnecessary prompts.
- **Alternatives considered:**
  - Force HTTPS: rejected because many teams standardize on SSH keys.
  - Always ask: rejected as noisy for repeated runs.

### 5) Integrate clone-aware remediation into status and add
- **Decision:**
  - `status`: when a configured repository path is missing, emit actionable guidance to run `arashi clone` instead of attempting git commands.
  - `add`: when repository is already configured, provide clone-oriented guidance and offer fallback to clone flow rather than rename/remove suggestions.
- **Rationale:** Reduces user confusion and connects users to the intended command path.
- **Alternatives considered:**
  - Keep current messaging with docs-only fix: rejected because runtime output remains misleading.

## Risks / Trade-offs

- [Config migration gaps for existing entries without URLs] -> Add validation and a repair path that prompts for URL or derives from local remotes when available.
- [Protocol inference may be wrong in mixed SSH/HTTPS workspaces] -> Use explicit tie/ambiguity detection and prompt before cloning.
- [Unmanaged local repo deletion is destructive] -> Require explicit confirmation and default to non-destructive options.
- [Cross-command coupling increases maintenance cost] -> Centralize discovery/remediation helpers in shared utilities with focused tests.

## Migration Plan

1. Extend config schema handling to support required repository URL metadata with backward-compatible reads.
2. Update `add` command to persist URL metadata consistently.
3. Implement shared discovery classification utilities and protocol inference helpers.
4. Implement `clone` command interactive and `--all` paths, including unmanaged repo reconciliation prompts.
5. Update `status` missing-repository behavior and `add` duplicate-repository remediation flow.
6. Roll out docs/skills/VS Code extension updates after CLI behavior is stable.

## Open Questions

- Should unmanaged local repository "delete" support trash/recycle semantics on supported platforms, or remain hard delete with confirmation?
- Should protocol preference be persisted in config for future runs, or inferred each time from repository URLs?
