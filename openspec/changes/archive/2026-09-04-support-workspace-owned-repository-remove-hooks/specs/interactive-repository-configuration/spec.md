## MODIFIED Requirements

### Requirement: Hook onboarding offers one canonical inline or executable file source

Selected repository hooks SHALL use exactly `pre-create`, `post-create`, `pre-remove`, and `post-remove`. For each lifecycle, Arashi SHALL offer exactly one source mode: inline Bash shorthand or explicit canonical interpreter map; or one host-native editable script with a fixed safe no-op scaffold at the workspace-owned repository-specific canonical active filename. Arashi MUST NOT infer executable behavior from repository files, setup scripts, package metadata, or lockfiles. Compatible repository-local remove files remain runtime sources and MUST block creating a competing canonical file.

#### Scenario: User supplies Bash shorthand

- **WHEN** the user selects one lifecycle and enters non-empty Bash shorthand
- **THEN** the candidate normalizes it through the canonical hook value shape
- **AND** records only that selected lifecycle

#### Scenario: User supplies explicit platform variants

- **WHEN** the user selects explicit interpreter variants
- **THEN** the candidate retains only non-empty `bash`, `powershell`, and/or `cmd` members
- **AND** rejects empty or unsupported members

#### Scenario: User chooses editable script files

- **WHEN** the user selects file mode for one or more lifecycles
- **THEN** the plan uses `.sh` on POSIX or exactly one `.ps1` on Windows and a fixed successful no-op scaffold
- **AND** maps configured create and remove scripts from the active configuration root to `.arashi/hooks/<lifecycle>.<repo><ext>`
- **AND** persists no inline value for those lifecycles

#### Scenario: Generated script is immediately executable and safe

- **WHEN** onboarding creates a planned hook script
- **THEN** the complete script is atomically visible at the exact active filename without a rename step
- **AND** POSIX mode is `0755` while Windows `.ps1` is runtime-ready
- **AND** unedited content is silent, non-mutating, and successful

#### Scenario: Hook source already exists or collides

- **WHEN** a selected lifecycle already has inline value, canonical active native source, compatible repository-local remove source, destination collision, ambiguous native candidates, symlinked parent, or another unsafe destination
- **THEN** Arashi does not overwrite or create another source
- **AND** returns a bounded field-attributed choice or transaction failure without reading source contents

#### Scenario: A parent path changes during installation

- **WHEN** any configuration-root, workspace `.arashi`/hooks, target-repository, or compatible repository-local `.arashi`/hooks component changes identity, becomes symlinked, or gains a competing source between planning and publication
- **THEN** pre-publication and post-publication validation rechecks both the destination hierarchy and compatible repository-local source location and fails the transaction without leaving competing active sources
- **AND** rollback removes only a proven invocation-owned unchanged file

#### Scenario: Setup script was detected

- **WHEN** onboarding detected or created a setup script
- **THEN** Arashi may mention its name as context
- **AND** does not read it to generate or pre-fill hook behavior

### Requirement: Existing repository active-file plans preserve onboarding contracts

Configure-owned repository active-file plans SHALL preserve the exact topology, filename validation, source exclusivity, no-overwrite publication, safe no-op bytes, runtime-ready permissions, metadata-only diagnostics, retry/skip behavior, and ownership-checked rollback requirements defined for add onboarding.

#### Scenario: Configure plans a repository hook file

- **WHEN** the user replaces or clears the existing source and selects active-file mode
- **THEN** create and remove lifecycle paths resolve from the active configuration root to `.arashi/hooks/<lifecycle>.<repo><ext>`
- **AND** linked mode does not redirect remove hook storage into the active child worktree or canonical clone

#### Scenario: Existing active file must be retained

- **WHEN** an existing canonical or compatible native source cannot be replaced safely
- **THEN** configure never overwrites it and offers a skip/keep-existing path
- **AND** a confirmed edit to other settings leaves that file byte-identical
