## ADDED Requirements

### Requirement: Register generated completion for both executable names

Each deterministic Bash, Zsh, and Fish completion program SHALL register the same canonical completion model and dynamic query behavior for direct and wrapper-function invocation through `arashi` and `aw`.

#### Scenario: Bash completion is sourced

- **WHEN** a clean Bash session sources the generated completion program
- **THEN** `_arashi` is registered for both `arashi` and `aw`
- **AND** neither name requires `complete_aliases` or a user-defined shell alias

#### Scenario: Zsh completion is sourced

- **WHEN** a clean or already-initialized Zsh completion system sources the generated program
- **THEN** `compdef` associates `_arashi` with both executable names without resetting existing completion state

#### Scenario: Fish completion is sourced

- **WHEN** a clean Fish session sources the generated program
- **THEN** native `complete` definitions invoke the same completion function for `arashi` and `aw`

#### Scenario: Generated alias registration is stale

- **WHEN** a generated shell artifact omits either supported executable name or uses a different candidate model
- **THEN** repository-local generation or freshness validation exits unsuccessfully

### Requirement: Alias completion preserves dynamic and distribution parity

Completion invoked for an `aw` command line SHALL accept `aw` as the root token, query the canonical machine-only backend without recursion, and return the same safe static and dynamic candidates as the equivalent `arashi` command line across source, compiled, npm-installed, and direct-installed distributions.

#### Scenario: Alias dynamic completion runs in a workspace

- **WHEN** completion is requested for an `aw` repository, group, worktree, branch, path, shell, or constrained-value slot
- **THEN** it returns the same values and descriptions as the equivalent `arashi` request
- **AND** preserves local-only, bounded, silent-failure, no-prompt, no-hook, no-network, and non-mutation guarantees

#### Scenario: Alias wrapper-function completion runs

- **WHEN** a supported shell sources both shell integration and completion and completes `aw <arguments>`
- **THEN** completion remains attached to the `aw` parent-shell function
- **AND** parent-shell directive behavior remains intact after completion activation

#### Scenario: Real-shell dual-name matrix runs

- **WHEN** completion acceptance executes in clean Bash, Zsh, and Fish processes
- **THEN** each shell proves equivalent direct and wrapper-function completion for both names, including static and dynamic candidates, conflicts, positional boundaries, descriptions where native, and special-character insertion
- **AND** every fixture proves non-mutation and cleans up temporary state

#### Scenario: Packed npm first use emits alias completion

- **WHEN** a clean packed npm installation runs `aw completion <shell>` with no native binary
- **THEN** canonical first-use installation succeeds
- **AND** stdout contains only the same sourceable artifact emitted by `arashi completion <shell>`
