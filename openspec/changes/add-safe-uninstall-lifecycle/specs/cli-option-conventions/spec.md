# cli-option-conventions Delta Specification

## ADDED Requirements

### Requirement: Uninstall inspection and consent options use canonical aliases

Top-level and shell-only uninstall SHALL register `-n/--dry-run`, `-j/--json`, and `-y/--yes` through the same command-local execution paths as their long forms. The canonical command contract SHALL publish inspection-only JSON policy, dry-run non-mutation, explicit consent policy, and the JSON/yes conflict. No force option SHALL broaden uninstall ownership or preservation boundaries.

#### Scenario: Short and long inspection aliases are equivalent

- **WHEN** equivalent fixtures use `-n` and `--dry-run`, or `-j` and `--json`
- **THEN** each short form produces the same plan, envelope, exit status, and non-mutation as its long form

#### Scenario: Consent aliases conflict with JSON

- **WHEN** either `-j` or `--json` is combined with either `-y` or `--yes`
- **THEN** option validation returns the same stable conflict before channel inspection with side effects or mutation

#### Scenario: Option audit is regenerated

- **WHEN** command-contract generation inspects both uninstall command paths
- **THEN** it records their aliases, conflict, inspection, consent, docs, skills, completion, and intentional VS Code exclusion policy deterministically
