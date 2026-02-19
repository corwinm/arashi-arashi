## Context

The current VSCode extension is a proof of concept and does not expose the full set of day-to-day Arashi CLI workflows, specifically missing commands like `pull` and `sync`. The change also includes user-facing consistency work: the extension README should point to the docs site for canonical installation guidance, and extension branding should reuse the docs-site icon.

Key constraints are keeping command behavior aligned with the CLI, avoiding duplicated installation instructions across docs and extension, and ensuring extension assets remain compatible with VSCode Marketplace packaging.

## Goals / Non-Goals

**Goals:**
- Add command-palette support for additional CLI workflows, including `pull` and `sync`.
- Keep command wiring maintainable by extending existing command registration/execution patterns instead of adding one-off logic.
- Make installation guidance authoritative by linking extension docs to the docs site.
- Align extension branding by using the same icon source as the docs site.

**Non-Goals:**
- Defining or changing CLI command semantics.
- Redesigning the extension UX beyond adding commands and updating docs/assets.
- Introducing new telemetry, analytics, or external services.

## Decisions

1. Extend the existing command registration model with new VSCode command IDs for `pull` and `sync`, mapping each to the corresponding CLI invocation.
   - Rationale: preserves consistency with current extension behavior and reduces maintenance overhead.
   - Alternative considered: build separate bespoke handlers per command; rejected because it duplicates execution logic and increases drift risk.

2. Reuse the current command execution path (terminal/task process and user-facing error handling) for new commands.
   - Rationale: keeps execution semantics consistent across all extension commands and avoids introducing a second runtime path.
   - Alternative considered: direct process spawning per command with custom output handling; rejected due to inconsistent UX and more edge-case handling.

3. Keep extension README installation instructions high-level and link users to docs-site installation pages as the source of truth.
   - Rationale: reduces documentation drift and centralizes install updates in one place.
   - Alternative considered: duplicate full install steps in extension README; rejected because updates would need to be synchronized manually.

4. Use the docs-site icon asset as the canonical extension icon source and update VSCode extension metadata/assets accordingly.
   - Rationale: ensures brand consistency between docs and extension.
   - Alternative considered: maintain separate extension-only icon; rejected because it creates unnecessary branding divergence.

## Risks / Trade-offs

- [Risk] Users run commands with an older CLI that lacks expected behavior. -> Mitigation: keep failure messages actionable and include docs link for installing/updating CLI.
- [Risk] README links to install docs become stale over time. -> Mitigation: use stable docs URLs and keep link validation in docs/repo checks where available.
- [Risk] Icon asset format or size does not meet extension packaging expectations. -> Mitigation: validate icon dimensions/format before packaging and verify metadata references.
- [Trade-off] Linking to external docs instead of embedding full instructions adds one extra navigation step. -> Mitigation: keep the link prominent and contextual in README onboarding text.

## Migration Plan

1. Add new command contributions and command handlers for `pull` and `sync` in the extension.
2. Update extension README installation guidance to point to docs-site install instructions.
3. Replace/update extension icon assets and manifest references to use docs-site icon.
4. Validate extension behavior locally (command palette + command execution) and package checks.
5. Release as a non-breaking extension update.

Rollback strategy: revert command contribution/handler additions and asset/readme changes in a patch release if regressions are discovered.

## Open Questions

- What is the exact docs URL path that should be used as the canonical install destination?
- Should `sync` be exposed as a single command only, or later expanded with optional workflow prompts/flags in the extension UI?
