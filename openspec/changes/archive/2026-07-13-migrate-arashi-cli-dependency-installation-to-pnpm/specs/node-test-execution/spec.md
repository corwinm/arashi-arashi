## ADDED Requirements

### Requirement: Tests execute on Node without Bun
The `arashi-arashi`, `arashi`, and `arashi-vscode` repositories SHALL execute unit and integration tests with Vitest on a supported Node runtime without importing `bun:test` or requiring Bun runtime globals in tests or test helpers.

#### Scenario: Unit test execution
- **WHEN** a contributor runs an affected repository's unit test script after a frozen pnpm install
- **THEN** Vitest executes the complete unit test suite on Node with equivalent assertions, lifecycle behavior, mocks, and exit status

#### Scenario: Integration test execution
- **WHEN** a contributor or CI runs an affected repository's integration test script
- **THEN** the integration suite executes on Node and exercises the same repository, CLI, or extension behavior previously covered under Bun

### Requirement: Bun test APIs are replaced rather than shimmed
Tests and test helpers SHALL use Vitest and Node-compatible APIs directly instead of maintaining a compatibility shim that exposes `bun:test` or Bun runtime globals.

#### Scenario: Test source audit
- **WHEN** tracked tests, fixtures, and test helpers are searched after migration
- **THEN** they contain no `bun:test` imports and no `Bun.file`, `Bun.write`, `Bun.spawn`, `Bun.spawnSync`, or other Bun runtime API calls

#### Scenario: Filesystem and subprocess helpers
- **WHEN** tests create fixtures, invoke Git, run the CLI, or inspect generated files
- **THEN** they use Node filesystem and child-process APIs or shared Node-compatible project helpers while preserving cleanup, timeout, signal, stdout, stderr, and cross-platform behavior

### Requirement: Existing coverage and platform contracts are preserved
The test migration SHALL preserve the behavioral coverage, test selection, timeout intent, and supported operating-system matrices of the existing suites.

#### Scenario: CLI test coverage
- **WHEN** the migrated `arashi` suite runs
- **THEN** unit and integration tests continue to cover real temporary workspaces, Git operations, JSON stdout isolation, hooks, Windows path behavior, and standalone binary/package smoke behavior represented by the existing suite

#### Scenario: VS Code extension-host coverage
- **WHEN** the migrated `arashi-vscode` integration suite runs
- **THEN** it still launches the real VS Code extension host, executes registered commands, uses the fixture CLI, and runs across the existing macOS, Ubuntu, and Windows CI matrix

#### Scenario: Meta-repository contract coverage
- **WHEN** the migrated `arashi-arashi` suite runs
- **THEN** it still validates the cross-repository CLI command contract and companion-surface coverage

### Requirement: CI proves Bun-independent test execution
CI SHALL run migrated test suites in an environment where test success does not depend on Bun being installed.

#### Scenario: Node-only test job
- **WHEN** a test job does not perform retained production compilation
- **THEN** the job installs Node and pnpm, does not install Bun, and completes the relevant test suite successfully

#### Scenario: Mixed build job
- **WHEN** a workflow job still needs Bun for standalone compilation
- **THEN** test execution remains a distinct Node/Vitest command and does not use Bun's test runner
