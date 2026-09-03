## MODIFIED Requirements

### Requirement: CLI continuous integration validates pull requests and main

The Arashi CLI CI workflow SHALL run for pull-request creation/update and pushes to `main`, SHALL install pinned dependencies from the lockfile where required, and SHALL report nine maintained outcomes: one quality check, Linux and Windows source-test checks, Linux/macOS/Windows native build checks, and Linux/macOS/Windows native acceptance checks.

#### Scenario: Pull request updates

- **WHEN** a pull request is opened, synchronized, or reopened
- **THEN** the nine maintained CI outcomes run against the pull-request head and report pass/fail status

#### Scenario: Main receives a commit

- **WHEN** a commit is pushed to `main`
- **THEN** the same nine maintained outcomes run against that commit

#### Scenario: CI topology or acceptance ownership drifts

- **WHEN** a separate post-build validation/materialization/specialized job returns, a supported build or acceptance platform is omitted, acceptance is removed or assigned to the wrong platform, required setup or artifact mapping drifts, the acceptance matrix disconnects from `build`, a platform failure can cancel sibling platforms, an earlier acceptance failure can hide a later applicable group, or a failing acceptance can be treated as non-fatal
- **THEN** focused workflow-contract validation fails before the topology can be accepted

### Requirement: Supported binaries are built and smoke-tested natively

CI SHALL build and upload the supported Linux x64, macOS arm64, and Windows x64 named artifacts in an independent native build matrix. A dependent native acceptance matrix SHALL download each corresponding artifact and validate it on its native platform with version, generated-completion, and materialization checks. Linux acceptance SHALL additionally exercise installed POSIX/JavaScript wrapper and built-hook input behavior. Windows acceptance SHALL additionally exercise transactional/default installation and native hook-input behavior. The acceptance matrix SHALL run every applicable acceptance group whose true setup and artifact prerequisites succeeded, SHALL not cancel sibling platforms after one platform fails, and SHALL fail an owning platform outcome when any applicable acceptance group fails.

#### Scenario: Supported platform build succeeds

- **WHEN** source and quality gates pass for a supported platform
- **THEN** CI builds and uploads that platform's expected named binary artifact

#### Scenario: One platform build fails

- **WHEN** a supported platform build fails
- **THEN** CI reports that platform build as failed and does not upload its named artifact
- **AND** CI does not present the complete build set as successful

#### Scenario: General native acceptance succeeds

- **WHEN** a supported platform artifact is available
- **THEN** the corresponding native acceptance job executes the binary's version and completion commands
- **AND** executes the materialization acceptance fixture against that binary

#### Scenario: Linux specialized acceptance runs

- **WHEN** the Linux artifact and pinned test dependencies are available
- **THEN** Linux native acceptance prepares the installed package entrypoint and executes the maintained POSIX/JavaScript wrapper and built-hook acceptance suites

#### Scenario: Windows specialized acceptance runs

- **WHEN** the Windows artifact and required runtime/dependencies are available
- **THEN** Windows native acceptance executes transactional installer acceptance, default fresh-shell installer acceptance, and native hook-input acceptance

#### Scenario: One acceptance group fails

- **WHEN** one applicable general or specialized acceptance group fails
- **THEN** later applicable sibling groups still execute when their own prerequisites succeeded
- **AND** the owning platform outcome fails
- **AND** other supported platform entries are not canceled by matrix fail-fast behavior
- **AND** CI does not present the complete native acceptance set as successful
