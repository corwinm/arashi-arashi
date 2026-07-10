## Why

Arashi’s public command contract is repeated across the CLI, documentation, agent skills, and VS Code extension, but those independently maintained surfaces can drift without a shared machine-readable source or automated comparison. Recent additions have already exposed gaps such as a docs page omitted from the command index and newer CLI commands lacking explicit VS Code parity decisions.

## What Changes

- Derive a versioned command contract from the CLI’s actual Commander registration tree, supplemented by explicit semantic metadata for JSON support and companion-surface expectations.
- Add deterministic generation and freshness validation for the CLI-owned contract artifact.
- Add a cross-repository checker that compares the CLI contract with docs command pages and index entries, curated skills references, and VS Code contributed-command mappings.
- Require intentional omissions or unsupported companion surfaces to be recorded with explicit reasons, and report them separately from missing or stale coverage.
- Add focused repository-local checks where appropriate, including VS Code manifest, command-ID, and handler consistency.
- Document how maintainers run the checks and update the contract when the command surface changes.

## Capabilities

### New Capabilities

- `cross-repo-command-contracts`: Defines generation, validation, exclusions, and reporting for command metadata shared across the CLI, docs, skills, and VS Code extension.

### Modified Capabilities

- `vscode-command-integration`: Requires extension command mappings and intentional CLI parity gaps to be machine-checkable against the shared command contract.

## Impact

- `corwinm/arashi`: reusable CLI program construction, semantic command metadata, generated contract artifact, tests, scripts, contributor documentation, and CI freshness checks.
- `corwinm/arashi-arashi`: cross-repository policy/configuration, validation script and tests, documentation, and CI orchestration that checks out the four child repositories.
- `corwinm/arashi-docs`: command index drift fixes and contract-check integration expectations for canonical command pages.
- `corwinm/arashi-skills`: structured command coverage markers or metadata suitable for deterministic validation while preserving curated workflow-oriented guidance.
- `corwinm/arashi-vscode`: explicit CLI mappings/exclusions and repository-local manifest/registry/handler consistency tests.
