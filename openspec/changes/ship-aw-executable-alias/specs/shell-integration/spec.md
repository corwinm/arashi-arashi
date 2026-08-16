## ADDED Requirements

### Requirement: Generate canonical and alias shell wrappers
The system SHALL make `arashi shell init <shell>` and `aw shell init <shell>` emit the same deterministic parent-shell integration program for each supported shell. That program SHALL define `arashi` and, when the parent shell does not already own the name through an unrelated alias/function, `aw`; each defined function SHALL invoke its corresponding real executable with the same directive-file safety, escaping, cleanup, environment isolation, and exit-status behavior. The conditional alias guard SHALL preserve unrelated shell namespace state without executing it.

#### Scenario: Canonical shell init is requested
- **WHEN** the user runs `arashi shell init bash`, `arashi shell init zsh`, or `arashi shell init fish` and the parent shell has no unrelated `aw` alias/function
- **THEN** the emitted wrapper program defines working `arashi` and `aw` functions for that shell
- **AND** contains no completion program

#### Scenario: Alias shell init is requested
- **WHEN** the user runs `aw shell init bash`, `aw shell init zsh`, or `aw shell init fish`
- **THEN** stdout is byte-identical to the corresponding canonical shell-init output
- **AND** both functions bypass recursion through explicit real-command invocation

#### Scenario: Parent shell already owns the aw name
- **WHEN** the generated integration is sourced in a parent shell where `aw` is an unrelated alias or function
- **THEN** it preserves that existing shell definition and does not replace or execute it
- **AND** canonical `arashi` parent-shell integration remains available
- **AND** after the user deliberately removes the collision and re-sources the same deterministic program, the Arashi `aw` wrapper is defined

#### Scenario: aw resolves to an executable rather than a shell definition
- **WHEN** `aw` resolves through PATH to a direct launcher or package-manager shim and is not an unrelated parent-shell alias/function
- **THEN** sourcing the generated program defines the Arashi `aw` wrapper function
- **AND** its explicit real-command bypass reaches that underlying executable without recursion

#### Scenario: Alias applies a parent-shell directory directive
- **WHEN** a real Bash, Zsh, or Fish session sources the generated wrapper and runs a directory-changing `aw switch --cd` path
- **THEN** the caller shell changes to the exact selected worktree path
- **AND** the function returns the native command's exit status and removes its temporary directive file

### Requirement: One managed shell block activates both names
The existing Arashi-managed startup block SHALL remain the sole shell-integration block and SHALL load the generated dual-name wrapper plus completion registered for both names through canonical `command arashi` activation lines.

#### Scenario: Existing managed block is upgraded
- **WHEN** a startup file contains an older Arashi-managed block that defines or completes only `arashi`
- **AND** the user runs `arashi shell install` or `aw shell install`
- **THEN** the block is replaced with the current canonical activation pair
- **AND** the loaded generated programs support both names without adding an AW-specific block

#### Scenario: Dual-name integration install is repeated
- **WHEN** shell installation is repeated after the current block is present
- **THEN** managed markers and activation lines each remain present exactly once
- **AND** content outside the managed block remains byte-for-byte unchanged

#### Scenario: Canonical release installer configures integration
- **WHEN** the supported POSIX release installer writes optional shell integration after installing both executable wrappers
- **THEN** it writes the same canonical activation pair recognized by runtime `shell install`
- **AND** a later invocation through either executable name upgrades it without duplication
