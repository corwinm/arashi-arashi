## Context

The meta-repository uses OpenSpec's built-in `spec-driven` schema, which requires proposal, specs, design, and tasks artifacts. Repository guidance currently presents that complete lifecycle as mandatory even when an issue and implementation PR already provide sufficient scope and verification.

## Goals / Non-Goals

**Goals:**

- Match specification effort to contract risk.
- Preserve canonical requirements for durable behavior.
- Make the lightweight path executable through OpenSpec rather than documentary shorthand.
- Keep full validation and archive discipline for changes that use OpenSpec.

**Non-Goals:**

- Replace OpenSpec or weaken its validation.
- Rewrite existing changes or canonical requirements.
- Change child-repository ownership.

## Decisions

### Select one of three tracks during issue triage

Use direct implementation when no canonical product requirement changes. Use lightweight OpenSpec when a straightforward durable requirement changes but no separate design record or task ledger is needed. Use full OpenSpec when design alternatives remain or the change is destructive, migratory, security-sensitive, or difficult to reverse.

Cross-repository scope is a signal to inspect coordination risk, not an automatic OpenSpec requirement. Mechanical coordinated edits can remain direct when the issue fully specifies them.

### Add a proposal-and-specs lightweight schema

Add a project-local `lightweight` schema whose graph contains only `proposal` and `specs`. This lets `openspec new --schema lightweight` and normal strict validation represent the policy directly.

The default remains `spec-driven` so existing commands and full changes keep their current behavior. Contributors opt into the lightweight schema per change.

### Keep transient execution records outside OpenSpec

Issues and pull requests own implementation checklists. Tests and CI own verification evidence. OpenSpec artifacts contain those details only when they establish a durable compatibility, migration, or operational contract.

## Risks / Trade-offs

- Contributors may classify similar changes differently. Short selection criteria and review can correct the track before substantial work begins.
- A direct change may reveal a contract decision during implementation. It must move to lightweight or full OpenSpec before delivery when that happens.
- Custom schemas are an experimental OpenSpec feature. A focused test and `openspec schema validate lightweight` protect the checked-in schema.

## Migration Plan

Apply the policy to new issues. Existing active and archived changes keep their current schema and artifacts. No historical rewrite is required.
