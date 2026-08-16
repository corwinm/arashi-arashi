## ADDED Requirements

### Requirement: Doctor validates inline hooks through the runtime resolver without execution
For a valid configured workspace, `arashi doctor` SHALL enumerate configured create and remove logical locations and use the same source-ambiguity, platform/interpreter selection, availability, and file validation resolver as enabled runtime and remove dry-run. Inline/file ambiguity SHALL emit blocking code `HOOK_AMBIGUOUS` with exact detail keys `hookName`, `scope`, `sourceKinds`, `sourceOwnerKind`, `sourceOwnerName`, and nullable `sourceScriptPath`; unavailable compatible interpreters SHALL emit `HOOK_INTERPRETER_UNAVAILABLE` with the same logical identity plus configured interpreter keys. Doctor MUST NOT execute snippets, create temporary scripts, mutate config/files/repositories, or expose snippet text.

#### Scenario: Healthy inline configuration is diagnosed
- **WHEN** doctor resolves an unambiguous inline hook with an available compatible interpreter
- **THEN** it reports no blocking finding for that location
- **AND** invokes no hook subprocess

#### Scenario: Inline and file conflict
- **WHEN** doctor finds both sources at one configured logical location
- **THEN** it reports the same blocking ambiguity classification and candidates as runtime
- **AND** does not include the snippet

#### Scenario: Inline interpreter is unavailable
- **WHEN** doctor resolves no compatible available interpreter for a configured inline location
- **THEN** it reports blocking `interpreter_unavailable` from the shared resolver
- **AND** does not select a terminal application, `pwsh` fallback, or unconfigured interpreter

#### Scenario: Doctor JSON remains isolated
- **WHEN** inline-hook findings are emitted by `doctor --json`
- **THEN** stdout contains exactly one existing doctor envelope with structured findings
- **AND** stdout and stderr contain no snippet text or hook output

### Requirement: Doctor preserves file-only and standalone diagnostics
When no inline configuration exists, doctor SHALL preserve existing platform-native file diagnostics. Implicit standalone doctor SHALL continue to inspect only its established user-global/file-owned hook behavior and SHALL not invent inline configuration ownership.

#### Scenario: File-only workspace is checked
- **WHEN** doctor runs in an existing file-only configured or standalone fixture
- **THEN** finding codes, paths, platform handling, non-execution, and exit behavior remain backward-compatible
