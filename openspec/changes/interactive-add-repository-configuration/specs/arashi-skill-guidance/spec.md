## ADDED Requirements

### Requirement: Packaged skill teaches optional repository onboarding during add

The authored and packaged Arashi skill SHALL teach eligible human `aw add` onboarding in the focused workspace/repository command reference while routing copy/symlink and hook details to their existing configuration/create and hook references. Guidance SHALL preserve default-no minimal add, non-interactive/JSON/force suppression, canonical repository ownership, unselected content-free suggestions, manual path validation and dependency warnings, user-supplied hook commands, sanitized lifecycle/interpreter summaries, one final save, cancellation rollback, and the #316 existing-entry scope boundary.

#### Scenario: Agent adds a repository interactively

- **WHEN** an agent follows installed guidance for an eligible human add invocation
- **THEN** it can explain or operate the optional section checklist and final confirmation without selecting values on the user's behalf
- **AND** it does not configure workspace hooks or unsupported fields

#### Scenario: Agent handles local-file suggestions

- **WHEN** the checkout contains suggested ignored local paths
- **THEN** skill guidance treats them as unselected path names only and preserves canonical copy-versus-symlink advice
- **AND** instructs the agent not to read or disclose contents

#### Scenario: Agent handles hook input

- **WHEN** the user selects repository hooks
- **THEN** the agent requires user-supplied commands in canonical lifecycle/interpreter shapes
- **AND** never repeats hook bodies in summaries, diagnostics, or reports

#### Scenario: Agent needs to edit existing config

- **WHEN** the requested task is to inspect or update an already registered repository or workspace setting
- **THEN** the skill does not misuse `aw add` for that task
- **AND** identifies follow-up #316 as the future interactive editor scope while retaining current direct-config guidance until it ships

### Requirement: Authored and extracted onboarding guidance is aggregate-checked

A focused onboarding guidance checker SHALL remain directly executable, SHALL be registered in the existing fail-closed skills checker manifest, and SHALL validate both authored source and the extracted canonical release archive through stable source and package aggregates. Maintainer contracts and fixtures MUST remain outside the installable skill tree.

#### Scenario: Authored or packaged onboarding guidance drifts

- **WHEN** source or extracted guidance loses or contradicts prompt eligibility, field scope, suggestion secrecy, user command ownership, sanitized summary, atomic persistence, cancellation, or #316 boundaries
- **THEN** the owning source/package aggregate fails with a stable diagnostic
- **AND** no feature-specific workflow step is required
