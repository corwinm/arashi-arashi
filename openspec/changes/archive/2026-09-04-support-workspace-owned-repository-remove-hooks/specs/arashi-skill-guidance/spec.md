## ADDED Requirements

### Requirement: Packaged guidance teaches repository remove script parity

The packaged Arashi skill SHALL teach workspace-owned `.arashi/hooks/<lifecycle>.<repo><ext>` files as the canonical substantial-script alternative to repository inline remove hooks, retain compatible repository-local placement, and explain the single-source collision, repository scope, target-checkout cwd, plain lifecycle naming, dry-run, doctor, and cross-platform extension behavior.

#### Scenario: Agent creates a repository remove hook

- **WHEN** an agent follows packaged guidance for a substantial repository-targeted pre-remove or post-remove script
- **THEN** it uses the workspace-owned qualified active path with executable/native readiness
- **AND** does not create an inline value or compatible repository-local file at the same logical location

#### Scenario: Release-shaped package is validated

- **WHEN** skill source and a freshly extracted release archive are checked
- **THEN** both contain the canonical source alternatives and collision policy
- **AND** package-wide checks reject stale or contradictory remove placement guidance
