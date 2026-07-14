## ADDED Requirements

### Requirement: Repository and group filters require configured selection context
Arashi MUST reject repository-name, group, or interactive multi-repository selection options in implicit standalone mode when the command cannot assign those options meaningful single-repository semantics.

#### Scenario: Only filter is supplied
- **WHEN** a standalone lifecycle invocation supplies `--only`
- **THEN** Arashi returns an actionable usage error before mutation
- **AND** does not silently select, exclude, or rename the standalone repository

#### Scenario: Group filter is supplied
- **WHEN** a standalone lifecycle invocation supplies `--group`
- **THEN** Arashi explains that groups require configured workspace repository metadata
- **AND** suggests ordinary `arashi init` when coordination is needed

#### Scenario: Interactive repository selection is requested
- **WHEN** standalone create requests interactive multi-repository selection
- **THEN** Arashi rejects the meaningless selection mode without prompting or broadening scope

#### Scenario: Configured filters are used
- **WHEN** the workspace is configured
- **THEN** existing name/group intersection, unknown, empty, and no-match behavior remains unchanged
