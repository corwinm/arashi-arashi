## ADDED Requirements

### Requirement: Packaged skill guidance routes supported edits through configure

The authored and extracted Arashi skill SHALL direct agents to use `aw configure` for supported existing-workspace inspection and human-confirmed edits, list the supported scope families, distinguish persisted from effective state, and preserve direct config editing for unsupported canonical fields. Guidance SHALL state that interactive editing requires a TTY and `--json` is sanitized inspection only.

#### Scenario: Agent needs to inspect configuration

- **WHEN** an agent follows packaged workspace command guidance
- **THEN** it can use `aw configure --json` for stable non-mutating supported-field inspection
- **AND** knows that inline command bodies are intentionally omitted

#### Scenario: Agent needs to change configuration

- **WHEN** a supported interactive edit is appropriate
- **THEN** guidance routes the user to `aw configure` and its final confirmation
- **AND** does not invent non-interactive setters or describe the command as schema-derived

#### Scenario: Release package is validated

- **WHEN** the canonical skill archive is built and extracted
- **THEN** source and package aggregates enforce the same configure guidance
- **AND** stale or missing packaged guidance fails before publication

## MODIFIED Requirements

### Requirement: Packaged skill teaches optional repository onboarding during add

The authored and packaged Arashi skill SHALL teach eligible human `aw add` onboarding in the focused workspace/repository command reference while routing copy/symlink and hook details to their existing configuration/create and hook references. Guidance SHALL preserve default-no minimal add, non-interactive/JSON/force suppression, canonical repository ownership, unselected content-free suggestions, manual path validation and dependency warnings, exclusive inline-or-executable-file hook choice, exact active paths, safe no-op scaffolds, runtime-ready permissions without rename/chmod activation, no overwrite, user-supplied inline commands, sanitized inline/script summaries, one final config save, transaction-owned script rollback, and the boundary that existing-entry editing belongs to `aw configure` rather than add.

#### Scenario: Agent adds a repository interactively

- **WHEN** an agent follows installed guidance for an eligible human add invocation
- **THEN** it can explain or operate the optional section checklist and final confirmation without selecting values on the user's behalf
- **AND** it does not configure workspace hooks, unsupported fields, or existing entries through add

#### Scenario: Agent handles local-file suggestions

- **WHEN** the checkout contains suggested ignored local paths
- **THEN** skill guidance treats them as unselected path names only and preserves canonical copy-versus-symlink advice
- **AND** instructs the agent not to read or disclose contents

#### Scenario: Agent handles hook input

- **WHEN** the user selects repository hooks
- **THEN** the agent offers one inline command or editable active native script per lifecycle
- **AND** requires user-supplied inline commands in canonical lifecycle/interpreter shapes
- **AND** explains the exact active path, safe no-op scaffold, and immediate executable readiness without rename/chmod activation
- **AND** never repeats hook or generated-script bodies in summaries, diagnostics, or reports

#### Scenario: Agent needs to edit existing config

- **WHEN** the requested task is to inspect or update an already registered repository or supported workspace setting
- **THEN** the skill does not misuse `aw add` and instead routes the user to `aw configure`
- **AND** retains direct-config guidance for unsupported canonical fields
