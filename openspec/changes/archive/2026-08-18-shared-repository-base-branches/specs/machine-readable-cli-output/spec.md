## MODIFIED Requirements

### Requirement: Create JSON reports requested and effective base resolution
When configured or explicit base policy applies, `arashi create --json` SHALL expose each selected repository's normalized effective branch, exact policy source, canonical repository identity/path, resolved full ref, captured commit OID, and created/reused target action. Base-resolution errors SHALL use a stable code and include every affected repository with its independently effective branch and exact attempted refs. When no base policy applies, legacy result shapes SHALL remain unchanged.

#### Scenario: JSON success has per-repository branches and sources
- **WHEN** create resolves meta and child repositories from mixed repository CLI, invocation CLI, repository config, and workspace config sources
- **THEN** stdout contains exactly one success document
- **AND** every selected repository record reports its own normalized branch and exact source

#### Scenario: JSON failure aggregates different missing bases
- **WHEN** selected repositories cannot resolve different effective bases
- **THEN** stdout contains exactly one structured error document covering every affected repository
- **AND** each record contains that repository's requested branch and attempted local/origin refs
- **AND** no human text appears on stdout

#### Scenario: Existing target is reused
- **WHEN** create retains an existing target under `REUSE_EXISTING`
- **THEN** JSON reports the independently resolved policy and `reused` action
- **AND** does not claim that the existing target was created from or ancestry-validated against that base

### Requirement: JSON output documentation and skill guidance
User and agent documentation SHALL explain one-document JSON behavior, stable base-policy source values, per-repository create/clone results, and structured selector/resolution failures without recommending human-output parsing.

#### Scenario: Automation needs base-policy evidence
- **WHEN** automation consumes configured create or clone with base policy
- **THEN** canonical docs and packaged skill guidance identify the stable JSON fields and source vocabulary
- **AND** direct automation to stderr/exit status and the JSON envelope rather than human text
