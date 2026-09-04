## ADDED Requirements

### Requirement: Hook guidance documents workspace-owned repository remove files

Canonical CLI and website guidance SHALL document `.arashi/hooks/pre-remove.<repo><ext>` and `post-remove.<repo><ext>` as the canonical workspace-owned native alternatives to `repos.<name>.hooks.pre-remove|post-remove`, while identifying repository-local files as compatible sources. It SHALL explain that all forms occupy repository scope, execute from the target source checkout, retain plain remove hook names, and conflict rather than compose when more than one claims the same repository lifecycle.

#### Scenario: User chooses repository remove source

- **WHEN** a user reads configured hook or remove guidance
- **THEN** inline and workspace-owned native examples map to the same repository owner and lifecycle
- **AND** compatible repository-local placement and collision behavior are explicit

#### Scenario: Generated exports are refreshed

- **WHEN** canonical docs or agent-readable exports are generated
- **THEN** every maintained surface preserves the same filename, ownership, cwd, naming, and ambiguity contract
- **AND** semantic checks reject stale repository-local-only guidance
