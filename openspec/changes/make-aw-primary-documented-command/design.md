## Context

Arashi has two behaviorally equivalent entrypoints. Existing content predates the first-class `aw` distribution and embeds `arashi` in actionable examples, generated docs, packaged skills, semantic fixtures, and companion copy. The migration must change prose and examples without changing package/runtime identifiers, and generated artifacts must remain owned by existing generators.

## Goals / Non-Goals

**Goals:**

- Teach `aw` consistently as the primary user command across all configured repositories.
- Preserve `arashi` as a supported legacy-compatible invocation and as every existing product/package/repository/config/schema/environment/native identifier.
- Enforce the distinction with repository-local and coordinated semantic fixtures.
- Keep generated docs and packaged guidance deterministic and source-owned.

**Non-Goals:**

- Removing, warning on, or behaviorally deprecating the `arashi` executable.
- Renaming npm packages, repositories, URLs, `.arashi`, `ARASHI_*`, native binaries, extension IDs, schemas, or product branding.
- Rewriting historical archives, changelogs, dependencies, caches, or fixtures whose explicit purpose is compatibility/history.

## Decisions

### Classify occurrences by semantic role

Actionable shell invocations and recommended workflows use `aw`. Product names and machine identifiers stay unchanged. Explicit compatibility prose may show `arashi` only when it labels that spelling as supported for existing scripts/workflows. This role-based policy avoids unsafe global replacement.

Alternative: replace every token. Rejected because it corrupts package names, URLs, configuration paths, environment variables, binary payload names, and historical evidence.

### Centralize policy but retain local gates

Each owning repository extends its existing semantic harness for its maintained surfaces. The meta aggregate validates the complete configured set and uses positive/negative fixtures for preferred examples, compatibility notes, and identifier exceptions.

Alternative: one broad regex in the meta repository. Rejected because it would miss package/extracted-source boundaries locally and create identifier false positives.

### Regenerate, never hand-edit generated output

Docs Markdown/LLM output is produced by the docs generator; packaged skills are created and extracted with the existing release archive workflow. A second generation from unchanged inputs must leave no diff and matching hashes.

### Keep compatibility concise

Getting Started introduces `aw` directly and includes one concise note that `arashi` remains supported for existing scripts and workflows. Other pages do not repeatedly expand the letters or restate compatibility unless the page specifically owns installation/compatibility behavior.

## Risks / Trade-offs

- **False positives from identifiers** → Fixtures cover package installs, URLs, `.arashi`, `ARASHI_*`, native binary names, extension IDs, and product prose.
- **False negatives in prose-shaped commands** → Check fenced commands, inline actionable commands, and preferred/canonical wording through the established semantic harnesses.
- **Generated drift** → Run owning generators twice and compare tracked output/hashes.
- **Large copy diff hides mistakes** → Keep history/changelogs excluded, review each repository independently, and run cumulative review against `origin/main`.

## Migration Plan

1. Add and run semantic/fixture expectations against unchanged content to record RED.
2. Update authored sources repository by repository.
3. Regenerate docs and packaged outputs through owning tools; prove deterministic regeneration.
4. Run focused, sabotage, repository-local, and coordinated checks.
5. Open child PRs first, then the meta PR that owns issue closure. Rollback is ordinary PR revert; runtime behavior is unchanged.

## Open Questions

None.
