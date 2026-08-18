## ADDED Requirements

### Requirement: Generated agent exports preserve primary spelling
Generated Markdown routes, `/llms.txt`, and `/llms-full.txt` SHALL use `aw` for recommended actionable commands, preserve valid identifiers, and carry the same concise compatibility policy as their authored sources.

#### Scenario: Authored guidance is regenerated
- **WHEN** the owning docs generator produces agent-readable outputs
- **THEN** generated recommended commands use `aw`
- **AND** a second generation from unchanged inputs produces byte-identical tracked outputs

#### Scenario: Generated preferred spelling regresses
- **WHEN** an authored or generated fixture restores an unlabeled recommended `arashi` invocation
- **THEN** docs validation exits unsuccessfully with a source-specific diagnostic
