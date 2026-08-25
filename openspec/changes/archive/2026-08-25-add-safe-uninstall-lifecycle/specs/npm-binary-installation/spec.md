# npm-binary-installation Delta Specification

## ADDED Requirements

### Requirement: Package wrapper intercepts uninstall before native dispatch

The npm-package JavaScript wrapper SHALL recognize `uninstall` before downloading, locating, or dispatching the native executable. It SHALL derive ownership from package-root evidence, use environment evidence only as corroboration, and delegate only when exactly one supported global owner is confidently identified.

#### Scenario: Native payload is missing

- **WHEN** a package-managed user runs `aw uninstall` or `arashi uninstall` and the native payload is unavailable
- **THEN** the JavaScript wrapper still inspects and can delegate package removal
- **AND** does not attempt first-use native download

#### Scenario: Owner evidence conflicts

- **WHEN** package-root evidence is conflicting, unsupported, or insufficient
- **THEN** the wrapper exits with labeled candidate guidance
- **AND** executes no manager and directly deletes no package file or shim

### Requirement: Supported package owners use exact global removal argv

The normative package-manager invocations SHALL be exactly:

- npm: program `npm`, args `uninstall`, `-g`, `arashi`;
- pnpm: program `pnpm`, args `remove`, `-g`, `arashi`;
- Yarn classic global: program `yarn`, args `global`, `remove`, `arashi`;
- Bun: program `bun`, args `remove`, `-g`, `arashi`;
- Vite+: program `vp`, args `uninstall`, `-g`, `arashi`.

Confirmed apply SHALL execute exactly one selected command. Dry-run SHALL print but not execute it.

#### Scenario: pnpm owns the installation

- **WHEN** package-root evidence confidently identifies pnpm and the user confirms or supplies `--yes`
- **THEN** the wrapper executes exactly `pnpm remove -g arashi` once

#### Scenario: Dry-run inspects a package owner

- **WHEN** the user supplies `--dry-run` for a confidently identified owner
- **THEN** the wrapper prints the exact program and ordered arguments
- **AND** does not spawn the manager

#### Scenario: Unsupported Yarn layout is detected

- **WHEN** evidence indicates a Yarn layout other than supported classic global ownership
- **THEN** automatic delegation refuses with bounded manual guidance
