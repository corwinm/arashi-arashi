## ADDED Requirements

### Requirement: npm package exposes canonical and alias bins
The npm package SHALL expose `arashi` and `aw` bin names mapped to the same `bin/arashi.js` entrypoint and SHALL preserve package-manager executable-collision handling rather than mutating global bin paths independently.

#### Scenario: Packed package metadata is inspected
- **WHEN** the canonical npm archive is packed and its metadata is inspected
- **THEN** `bin.arashi` and `bin.aw` both resolve to `./bin/arashi.js`
- **AND** the archive contains the shared entrypoint and every file required for first-use binary installation

#### Scenario: Package is globally installed
- **WHEN** a clean supported POSIX or Windows fixture globally installs the packed npm archive
- **THEN** both package-manager-generated executable shims resolve successfully
- **AND** neither shim requires a separate native alias binary

#### Scenario: Package manager detects an executable collision
- **WHEN** the package manager cannot claim `aw` in its managed global bin location
- **THEN** installation follows the package manager's normal collision failure behavior
- **AND** Arashi does not overwrite the unrelated executable through custom global-bin mutation

### Requirement: npm entrypoint behavior is equivalent through both names
The shared npm entrypoint SHALL provide equivalent first-use binary installation, explicit `install`, wrapper-intercepted `update`, stdout and stderr isolation, exit status, and native command dispatch through `arashi` and `aw`.

#### Scenario: Alias first use has no platform binary
- **WHEN** a user runs `aw <command>` from a packed npm installation and the matching native binary is absent
- **THEN** the shared entrypoint downloads and verifies the installed package version's platform binary
- **AND** runs the requested command with the same result as canonical `arashi` first use

#### Scenario: Explicit install runs through the alias
- **WHEN** a user runs `aw install` through the generated package-manager shim
- **THEN** the shared wrapper intercepts the command before native dispatch
- **AND** preserves the canonical install command's idempotency, JSON, error, and partial-download cleanup contracts

#### Scenario: Update runs through the alias
- **WHEN** a user runs a supported human or JSON `aw update` invocation through the generated package-manager shim
- **THEN** the shared wrapper intercepts it at the same boundary as `arashi update`
- **AND** preserves conflict precedence, lookup, confirmation, package-manager planning, binary refresh, stdout/stderr, and exit-status behavior

#### Scenario: Alias completion triggers first-use installation
- **WHEN** a clean packed installation runs `aw completion <shell>` without a native binary
- **THEN** first-use installation completes through the canonical binary installer
- **AND** stdout contains only the sourceable completion program
