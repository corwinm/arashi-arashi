## Why

The installable Arashi skill has grown to roughly 133 KB, with one 65 KB command reference that forces agents to load unrelated commands, integrations, migration history, and implementation detail for narrow tasks. The package should remain self-contained and command-accurate while making its entry point and task-specific context substantially smaller and clearer.

## What Changes

- Keep `skills/arashi/SKILL.md` as a compact router and universal operating-policy surface instead of a second workflow manual.
- Replace the command-reference monolith with a compact command router and focused, self-contained references organized by user task.
- Preserve current copy-pasteable commands, user-visible precedence, safety boundaries, expected outcomes, and actionable recovery guidance while removing implementation-internal schemas, adapter matrices, obsolete workarounds, and duplicated detail.
- Turn the tutorial into one successful configured journey with an explicit standalone choice and links to optional setup, shortcuts, hooks, and troubleshooting.
- Keep workflows goal-oriented, troubleshooting symptom-oriented, hooks lifecycle-oriented, and shortcuts navigation-oriented so each concept has one installed owner.
- Make Node, network, and maintainer-validation prerequisites conditional rather than universal.
- Move still-current maintainer publication/release policy to repository-level `docs/publication.md`, and remove it plus stale release-specific examples from installed operational guidance.
- Preserve all existing approved command, launcher, hook, JSON, standalone/configured, and package-boundary semantics through focused source and extracted-package validation.
- Limit repository-only changes to the smallest necessary updates to existing validation expectations; checker-framework, CI-workflow, and contract-architecture redesign is out of scope.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `arashi-skill-guidance`: Strengthen minimal routing, task-scoped reference disclosure, installed-content ownership, prerequisite accuracy, and the separation between operational guidance and maintainer-only policy.

## Impact

- Meta repository: OpenSpec delta for `arashi-skill-guidance` and issue tracking.
- `repos/arashi-skills`: installed files under `skills/arashi/`, repository-level `docs/publication.md`, plus only the existing checker expectations and coverage records required by changed paths or wording.
- No Arashi CLI behavior, configuration schema, release workflow, checker framework, or canonical website behavior changes are intended.
