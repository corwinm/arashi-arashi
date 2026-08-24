## Why

Arashi's official direct installers can add a multi-entrypoint executable payload, persistent PATH state, and managed shell integration, but users currently have no ownership-aware way to reverse those changes. Ad-hoc deletion is unsafe because the current ledger proves only alias ownership and does not distinguish installer-added PATH/profile state from pre-existing user state; a first-class uninstall lifecycle is needed before Arashi can promise clean, trustworthy removal.

## What Changes

- Add `aw uninstall` / `arashi uninstall` with human confirmation, `--dry-run`, `--yes`, and inspection-only JSON behavior; preserve every workspace, repository, worktree, and project configuration file.
- Add hosted POSIX and PowerShell uninstall scripts so a verified direct installation can be removed when the CLI binary is unavailable or must exit before its own payload is deleted.
- Expand direct-installer ownership metadata from alias-only schema v1 to a versioned whole-installation contract covering every payload destination plus only those PATH/profile mutations Arashi actually created.
- Make direct uninstall a preflighted, retryable transaction: reject ambiguous or modified ownership, remove only proven state, roll back recoverably on failure, preserve unrelated neighbors, and support deterministic retry after interruption or partial completion.
- Intercept npm-managed uninstall at the shared JavaScript package boundary, delegate removal only to a confidently detected owning package manager, and otherwise return exact manual commands without deleting package-manager-owned files directly.
- Add `aw shell uninstall` / `arashi shell uninstall` to remove only complete, unambiguous Arashi-managed integration blocks while preserving all surrounding startup-file bytes.
- Add `/uninstall` and `/uninstall.ps1` hosted routes, command and installation guidance, generated agent-readable exports, packaged skill guidance, completion, generated CLI policy, and coordinated semantic validation.
- Treat legacy alias-only ledgers, manual installs, malformed state, modified payloads, pre-existing PATH entries, and ambiguous package managers as fail-closed migration or manual-remediation cases rather than adopting or deleting them.

## Capabilities

### New Capabilities

- `cli-uninstallation`: User-facing uninstall command behavior, channel detection, confirmation/inspection contracts, preserved data boundaries, results, and recovery guidance.
- `installer-ownership-lifecycle`: Whole-installation ownership schema, hosted uninstall scripts, preflight, deferred self-removal, transactional deletion, rollback, interruption, and retry semantics across POSIX and Windows.

### Modified Capabilities

- `executable-aliases`: Extend direct-install ownership from aliases to the complete canonical-plus-alias payload and keep uninstall parity through both executable names.
- `windows-powershell-installer`: Record removable Windows payload/PATH ownership and add native deferred uninstall with rollback and fresh-shell acceptance.
- `npm-binary-installation`: Intercept uninstall before native first-use dispatch and delegate only to a confidently detected owning package manager.
- `shell-integration`: Add safe managed-block removal separate from whole-product uninstall.
- `shell-completions`: Include the new top-level and shell subcommands through the canonical generated completion model.
- `machine-readable-cli-output`: Define inspection-only uninstall JSON envelopes, stdout isolation, stable errors, and apply rejection.
- `cli-option-conventions`: Publish uninstall confirmation, dry-run, JSON, and conflict policy through the typed command contract.
- `cross-repo-command-contracts`: Require docs, generated exports, packaged skills, completion, and reasoned VS Code exclusion to agree with the uninstall contract.
- `docs-workflow-guidance-sections`: Document safe channel-specific removal, migration/refusal cases, shell-only removal, and preserved user data.
- `docs-agent-readable-exports`: Propagate uninstall guidance and hosted recovery routes to generated Markdown and LLM exports.
- `arashi-skill-guidance`: Teach agents to inspect first, preserve project state, and use the channel-appropriate official removal path without broad filesystem deletion.

## Impact

- `repos/arashi`: command registration and typed/generated contracts; npm wrapper/package-manager mapping; POSIX and PowerShell installers/uninstallers; ownership ledger migration; shell integration; completion; release/package assets; direct/npm/native Windows acceptance tests.
- `repos/arashi-docs`: uninstall command and installation guidance, Netlify hosted-script redirects, semantic checks, and generated public/LLM exports.
- `repos/arashi-skills`: smallest setup/troubleshooting references, semantic source/package checks, and regenerated packaged skill artifact.
- Meta-repository: OpenSpec deltas plus a registered coordinated uninstall-contract checker and controlled mismatch fixtures.
- `repos/arashi-vscode` is intentionally unchanged at runtime; the generated command policy and coordinated checker must record that machine installation removal is outside editor-command scope.
- No project configuration schema, workspace topology, repository content, or worktree data is removed or migrated.
