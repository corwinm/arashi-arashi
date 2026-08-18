## ADDED Requirements

### Requirement: Cross-repository documented-command policy
The coordinated semantic contract SHALL validate every configured repository's maintained user-facing command guidance and SHALL reject `arashi` used as a preferred or unlabeled actionable executable example while accepting Arashi product references, stable identifiers, historical records, and explicitly labeled compatibility examples.

#### Scenario: Preferred example regresses
- **WHEN** a maintained positive fixture or owned source restores `arashi status`, `arashi create`, or another `arashi` invocation as the recommended example
- **THEN** repository-local or coordinated semantic validation exits unsuccessfully with a stable source-specific diagnostic

#### Scenario: Valid identifier is present
- **WHEN** a fixture includes `npm install -g arashi`, an Arashi URL/repository, `.arashi`, `ARASHI_*`, a native binary name, or an extension identifier
- **THEN** semantic validation accepts the identifier

#### Scenario: Compatibility example is explicit
- **WHEN** guidance explicitly explains that `arashi` remains supported for existing scripts and workflows
- **THEN** semantic validation accepts the compatibility statement and any example scoped to that explanation

### Requirement: Complete configured-repository coverage
The authoritative coordinated check SHALL cover CLI, docs, presentation, skills, VS Code, and meta-owned guidance from the configured repository inventory and SHALL exclude dependencies, caches, generated intermediates not owned as published artifacts, and historical archives.

#### Scenario: Configured companion surface drifts
- **WHEN** any configured companion repository changes an owned maintained command example back to preferred `arashi`
- **THEN** the coordinated check reports that repository and source path and exits unsuccessfully
