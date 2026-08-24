# npm-binary-installation Delta Specification

## ADDED Requirements

### Requirement: JavaScript entrypoint intercepts uninstall before first-use dispatch

The shared JavaScript package boundary used by both generated `arashi` and `aw` bins SHALL recognize top-level `uninstall` before locating, downloading, installing, or executing the native first-use binary. It SHALL inspect package-manager ownership without mutating package files and SHALL delegate only when exactly one supported owner command is confidently proven. The normative program and argv mappings are: npm → `npm` plus `uninstall -g arashi`; pnpm → `pnpm` plus `remove -g arashi`; Yarn classic global layout → `yarn` plus `global remove arashi`; Bun → `bun` plus `remove -g arashi`; and Vite+ → `vp` plus `uninstall -g arashi`. Unsupported Yarn layouts and every unproven layout are guidance-only and MUST NOT be delegated automatically.

#### Scenario: Native binary is absent

- **WHEN** a package-managed user runs `aw uninstall` or `arashi uninstall` before first-use native installation
- **THEN** the JavaScript wrapper handles uninstall without downloading or launching a native binary
- **AND** no first-use cache or package payload is created

#### Scenario: npm global ownership is proven

- **WHEN** wrapper evidence confidently identifies npm as the sole owner
- **THEN** confirmed human apply runs `npm uninstall -g arashi` exactly once with preserved argv boundaries
- **AND** the wrapper does not directly unlink its shims, package directory, or cached native binary

#### Scenario: A supported non-npm owner is proven

- **WHEN** exactly one of pnpm, Yarn, Bun, or Vite+ is confidently identified as owner
- **THEN** apply delegates exactly once to the matching normative pnpm, Yarn, Bun, or Vite+ program and argv above
- **AND** does not invoke npm as a fallback

### Requirement: Ambiguous package ownership is inspection-only

When owner evidence is absent, contradictory, or identifies more than one plausible manager, the wrapper MUST fail closed without running any owner command or deleting any package-managed path. Human apply SHALL exit non-zero and print deterministic exact manual removal commands for every applicable supported npm, pnpm, Yarn, Bun, and Vite+ possibility. JSON inspection SHALL return the same candidates in a successful non-mutating `status: "refused"` plan and exit zero.

#### Scenario: Multiple lock or launcher signals exist

- **WHEN** ownership inspection leaves two or more managers plausible
- **THEN** human apply exits non-zero before mutation, while JSON inspection returns a successful `refused` plan
- **AND** lists the exact candidate commands without selecting or executing one

#### Scenario: No manager is confidently detected

- **WHEN** the wrapper cannot prove a supported owner
- **THEN** it reports manual channel remediation and all applicable exact commands
- **AND** preserves wrappers, package files, native cache, projects, and configuration

#### Scenario: JSON inspection is requested

- **WHEN** a package-managed invocation passes `--json` or `-j`
- **THEN** the wrapper emits exactly one stable inspection envelope containing owner evidence classification and candidate commands
- **AND** never runs a package manager, downloads a native binary, prompts, or mutates files

#### Scenario: JSON is combined with consent

- **WHEN** `--json` or `-j` is combined with `--yes` or `-y`
- **THEN** the wrapper rejects the conflict before owner-command execution
- **AND** emits one structured error document to stdout
