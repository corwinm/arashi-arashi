## ADDED Requirements

### Requirement: Doctor validates workspace-owned repository remove scripts

Doctor SHALL use the same configured repository remove candidate construction as runtime and dry-run, including qualified workspace filenames, compatible repository-local files, inline alternatives, native extension checks, source collisions, target ownership, executable validation, and interpreter preflight.

#### Scenario: Qualified repository script is healthy

- **WHEN** exactly one `.arashi/hooks/pre-remove.<repo><ext>` candidate exists and is runnable
- **THEN** doctor validates it as the repository-scoped source for `<repo>`
- **AND** reports no missing or workspace-scope substitution finding

#### Scenario: Repository source is ambiguous

- **WHEN** multiple native forms or inline plus native content claim one repository remove lifecycle
- **THEN** doctor reports blocking `HOOK_AMBIGUOUS` data with lifecycle, repository owner, source kinds, and every native path
- **AND** executes no hook and mutates no state
