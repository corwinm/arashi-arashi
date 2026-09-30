## Why

Issue #389 removes the separately maintained T3 bridge from Arashi's handoff path and gives Arashi ownership of transport, authentication, model resolution, and safe recovery.

## What Changes

- Replace bridge subprocess dispatch with a narrow native adapter to stable official T3 >=0.0.43, negotiated orchestration protocol 1, matching CLI/server versions, and verified capabilities.
- Discover the selected local environment through its runtime file; authenticate through the official CLI session interface and verify HTTP scopes.
- Resolve model, provider instance, and effort from explicit flags, workspace/user `defaults.t3`, and the official catalog/defaults.
- Retain private receipt locking and bridge-era duplicate protection, adding identifiers and submission phase for partial-success reconciliation.
- Preserve the dedicated integration page and update command and skill guidance, compatibility evidence, and migration instructions.

## Capabilities

### Modified Capabilities

- `t3-code-workspace-handoff`: native official transport, prerequisites, selection, and recovery.

## Impact

CLI, CLI schema and generated command/completion contracts, docs, skills, and meta coordination. No VS Code invocation change is required: new options are additive and editor launch remains incompatible with T3 handoff. Child implementation, documentation, and skill PRs merge before the meta-repo syncs and archives the canonical specification.
