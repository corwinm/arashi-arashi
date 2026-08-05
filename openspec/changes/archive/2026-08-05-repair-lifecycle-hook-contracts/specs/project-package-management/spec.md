## MODIFIED Requirements

### Requirement: pnpm orchestrates project scripts
Affected repositories SHALL use pinned Corepack pnpm to run package scripts and dependency-local executables that do not intrinsically require the Bun runtime. Coordinated child-worktree setup SHALL honor each child's committed `packageManager` and lockfile, SHALL avoid selecting the ancestor meta workspace, and SHALL propagate install/build failure to Arashi.

#### Scenario: Standard validation entry points
- **WHEN** a contributor runs documented lint, typecheck, test, build, or validation scripts through pnpm
- **THEN** pnpm resolves and orchestrates the declared scripts and local tools without using Bun as the dependency installer

#### Scenario: Coordinated worktree setup
- **WHEN** Arashi creates a coordinated worktree for an affected pnpm repository and executes its post-create hook
- **THEN** the hook sets `CI=true` using syntax native to the current shell and runs `corepack pnpm --ignore-workspace install --frozen-lockfile`
- **AND** POSIX guidance may use `CI=true command`, PowerShell guidance uses `$env:CI = "true"` before the command, and command-script guidance uses `set "CI=true"`
- **AND** uses the child's pinned pnpm version and committed lockfile rather than the ancestor meta workspace
- **AND** any required install or build failure makes the hook fail

#### Scenario: Every configured pnpm child has an explicit provisioning policy
- **WHEN** a configured Arashi child repository declares pnpm
- **THEN** the meta workspace either provides the same ready-after-create provisioning hook or explicitly documents that repository as manual setup
- **AND** the default Arashi project policy is automatic provisioning

#### Scenario: Docs deployment
- **WHEN** Netlify or GitHub Actions builds and validates `arashi-docs`
- **THEN** dependencies are installed from `pnpm-lock.yaml` with pinned pnpm and existing generated-content and site validation behavior is preserved
