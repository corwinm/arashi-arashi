## ADDED Requirements

### Requirement: CLI continuous integration validates pull requests and main
The Arashi CLI CI workflow SHALL run for pull-request creation/update and pushes to `main`, SHALL install pinned dependencies from the lockfile, and SHALL report independent required outcomes for maintained quality, test, build, and native acceptance stages.

#### Scenario: Pull request updates
- **WHEN** a pull request is opened, synchronized, or reopened
- **THEN** the maintained CI stages run against the pull-request head and report pass/fail status

#### Scenario: Main receives a commit
- **WHEN** a commit is pushed to `main`
- **THEN** the same maintained gates run against that commit

### Requirement: Quality gates cover authored and generated source
CI SHALL validate the generated configuration schema, CLI contracts, shell completions, canonical documentation link, lint rules, and formatting before accepting the quality stage. Local package scripts SHALL expose equivalent focused checks and actionable fix commands.

#### Scenario: Generated or authored content drifts
- **WHEN** a generated contract is stale or source violates lint/format policy
- **THEN** the quality stage fails with diagnostics identifying the owning check

### Requirement: Supported binaries are built and smoke-tested natively
CI SHALL build the supported Linux x64, macOS arm64, and Windows x64 binaries, upload each named artifact only after a successful build, and validate each artifact on its native platform with version and generated-completion smoke checks before it is treated as releasable.

#### Scenario: Supported platform build succeeds
- **WHEN** source and quality gates pass for a supported platform
- **THEN** CI builds and uploads that platform's expected binary artifact
- **AND** native validation executes the binary's version and completion commands successfully

#### Scenario: One platform fails
- **WHEN** a supported platform build or validation fails
- **THEN** CI reports that platform as failed and does not present the complete build set as successful
