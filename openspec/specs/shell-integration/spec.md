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
