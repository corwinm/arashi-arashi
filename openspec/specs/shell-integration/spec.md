# shell-integration Specification

## Purpose

Define shell integration behavior for Arashi so commands can install shell wrappers, emit parent-shell directory-change directives, and avoid leaking directive state to child processes.

## Requirements

### Requirement: Generate shell integration wrappers

The system SHALL provide `arashi shell init <shell>` to print wrapper code for each supported shell that enables parent-shell directive handling for Arashi commands.

#### Scenario: Supported shell wrapper is requested

- **WHEN** the user runs `arashi shell init bash`, `arashi shell init zsh`, or `arashi shell init fish`
- **THEN** the system prints shell-specific wrapper code that invokes the real Arashi binary and evaluates parent-shell directives from a temporary directive file

#### Scenario: Unsupported shell wrapper is requested

- **WHEN** the user runs `arashi shell init <shell>` for a shell that the system does not support
- **THEN** the system exits with an error identifying the unsupported shell and the supported shell names

### Requirement: Install shell integration into supported startup files

The system SHALL provide `arashi shell install` to add or update one Arashi-managed block in supported shell startup files. For Bash and Zsh the managed block SHALL load the wrapper and separately source `command arashi completion <shell>`; for Fish it SHALL separately source both command outputs through native pipelines. `arashi shell init <shell>` SHALL remain wrapper-only. When installation replaces an older managed block, it SHALL remove stale wrapper and completion activation lines from that block together and write the current pair without duplicates; this change does not add a separate uninstall command.

#### Scenario: Install writes managed shell integration

- **WHEN** the user runs `arashi shell install` in a supported shell environment with a recognized startup file
- **THEN** the system writes or updates one Arashi-managed initialization block that loads the corresponding wrapper on future shell sessions
- **AND** the same block separately activates completion from the current `arashi completion <shell>` output

#### Scenario: Existing wrapper-only block is upgraded

- **WHEN** a startup file contains the previous Arashi-managed wrapper-only block
- **AND** the user runs `arashi shell install`
- **THEN** the system replaces that block with the current wrapper and separate completion activation lines
- **AND** preserves all content outside the managed block

#### Scenario: Existing managed block contains stale activation lines

- **WHEN** an older Arashi-managed block contains stale wrapper or completion activation lines
- **AND** the user runs `arashi shell install`
- **THEN** the system replaces the complete managed block with exactly the current wrapper and completion activation pair
- **AND** does not remove content outside the managed markers

#### Scenario: Installation is repeated

- **WHEN** the user runs `arashi shell install` more than once for the same startup file
- **THEN** the managed block and each wrapper or completion activation line appear exactly once
- **AND** the second unchanged installation does not rewrite unrelated startup-file content

#### Scenario: Canonical release installer configures shell integration

- **WHEN** the supported release installer performs its optional shell-integration setup
- **THEN** it writes the same shell-specific wrapper and separate completion activation lines owned by the current Arashi-managed block
- **AND** later `arashi shell install` recognizes or upgrades that block without duplication

#### Scenario: Wrapper generation remains separate

- **WHEN** the user runs `arashi shell init bash`, `arashi shell init zsh`, or `arashi shell init fish`
- **THEN** stdout contains only the parent-shell wrapper
- **AND** does not contain generated completion definitions or completion activation commands

#### Scenario: Install cannot determine a writable startup target

- **WHEN** the user runs `arashi shell install` and the system cannot identify or write an appropriate startup file
- **THEN** the system exits with an actionable error that tells the user how to run both `arashi shell init <shell>` and `arashi completion <shell>` for manual setup

### Requirement: Emit safe parent-shell directory directives

When `ARASHI_DIRECTIVE_FILE` is set for a wrapped invocation, the system SHALL write only Arashi-supported, safely escaped directives to that file and SHALL support a directory-change directive for the selected worktree path.

#### Scenario: Wrapped switch writes a directory-change directive

- **WHEN** `arashi switch` resolves to `cd` behavior and `ARASHI_DIRECTIVE_FILE` points to a writable directive file
- **THEN** the system writes a safely escaped `cd` directive for the selected worktree path to the directive file

#### Scenario: Directive path includes special characters

- **WHEN** the selected worktree path contains spaces or shell-sensitive characters
- **THEN** the system writes the directive using shell-appropriate escaping so the wrapper changes to the intended path

### Requirement: Prevent directive state from leaking to descendant processes

The system MUST remove `ARASHI_DIRECTIVE_FILE` from hook, launcher, and other child-process environments spawned by the CLI.

#### Scenario: Hooks run during an integrated invocation

- **WHEN** lifecycle hooks execute during a command run that received `ARASHI_DIRECTIVE_FILE`
- **THEN** the hook processes do not receive `ARASHI_DIRECTIVE_FILE` in their environments

#### Scenario: Launcher subprocesses run during an integrated invocation

- **WHEN** the command starts a launcher or other child process after receiving `ARASHI_DIRECTIVE_FILE`
- **THEN** the child process environment omits `ARASHI_DIRECTIVE_FILE`

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
