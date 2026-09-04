## MODIFIED Requirements

### Requirement: Doctor validates inline hooks through the runtime resolver without execution

For a valid configured workspace, `arashi doctor` SHALL enumerate configured create and remove logical locations and use the same source-ambiguity, platform/interpreter selection, availability, and file validation resolver as enabled runtime and remove dry-run. Configured repository-remove enumeration SHALL include the canonical workspace-owned qualified path and compatible target-repository path as aliases for one repository slot. Source ambiguity SHALL emit blocking code `HOOK_AMBIGUOUS` with exact detail keys `hookName`, `scope`, `sourceKinds`, `sourceOwnerKind`, `sourceOwnerName`, nullable `sourceScriptPath`, and `sourceScriptPaths`. `sourceScriptPaths` SHALL be a de-duplicated array of at most six native candidate paths ordered by canonical workspace-owned location before compatible repository-local location and by established platform extension order within each location; `sourceScriptPath` SHALL remain the selected singular path when one exists and otherwise be null. Unavailable compatible interpreters SHALL emit `HOOK_INTERPRETER_UNAVAILABLE` with the same logical identity plus configured interpreter keys. Doctor MUST NOT execute snippets, create temporary scripts, mutate config/files/repositories, or expose snippet text.

#### Scenario: Healthy inline configuration is diagnosed

- **WHEN** doctor resolves an unambiguous inline hook with an available compatible interpreter
- **THEN** it reports no blocking finding for that location
- **AND** invokes no hook subprocess

#### Scenario: Healthy qualified repository script is diagnosed

- **WHEN** exactly one `.arashi/hooks/pre-remove.<repo><ext>` candidate exists and is runnable
- **THEN** doctor validates it as the repository-scoped source for `<repo>`
- **AND** reports no missing or workspace-scope substitution finding

#### Scenario: Inline and file conflict

- **WHEN** doctor finds both sources at one configured logical location
- **THEN** it reports the same blocking ambiguity classification and candidates as runtime
- **AND** does not include the snippet

#### Scenario: Repository native aliases conflict

- **WHEN** canonical workspace-owned and compatible repository-local files, or multiple supported native extensions, claim one repository remove lifecycle
- **THEN** doctor reports `HOOK_AMBIGUOUS` with every native candidate in deterministic bounded `sourceScriptPaths`
- **AND** the finding retains repository ownership and plain remove lifecycle identity

#### Scenario: Inline interpreter is unavailable

- **WHEN** doctor resolves no compatible available interpreter for a configured inline location
- **THEN** it reports blocking `interpreter_unavailable` from the shared resolver
- **AND** does not select a terminal application, `pwsh` fallback, or unconfigured interpreter

#### Scenario: Doctor JSON remains isolated

- **WHEN** inline-hook findings are emitted by `doctor --json`
- **THEN** stdout contains exactly one existing doctor envelope with structured findings
- **AND** stdout and stderr contain no snippet text or hook output
