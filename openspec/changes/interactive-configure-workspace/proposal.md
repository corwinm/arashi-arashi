## Why

Arashi validates `.arashi/config.json`, but users still need schema knowledge and manual JSON editing to inspect or change an existing workspace. The repository editor delivered by #274 now provides the canonical mutation, validation, preview, and active-file transaction boundaries needed to add a focused interactive `aw configure` command without becoming a generic schema form.

## What Changes

- Add `aw configure` for TTY-only interactive inspection and editing of explicitly supported workspace, workspace-hook, command-default, editor-default, meta-policy, and existing-repository settings.
- Present persisted state separately from inherited or built-in effective values, and support explicit keep, edit, and clear actions without exposing unsupported schema fields.
- Reuse and generalize the #274 repository editor for existing repository copy, symlink, and inline-or-active-file lifecycle hooks, preserving canonical normalization, validation, suggestions, active paths, and retry/skip behavior.
- Preview the exact serialized candidate JSON plus a separate readable active-file plan, then perform one final confirmation, at most one expected-byte configuration save, and transaction-owned no-replace active-file installation with rollback.
- Keep ordinary inspection and diagnostics free of inline command bodies while using visible plaintext command entry and an exact serialized final preview.
- Make non-TTY and `--json` invocations non-mutating and non-prompting; provide sanitized structured inspection if JSON inspection is exposed, without broad `--set` or `--unset` mutation flags.
- Update CLI contracts and guidance, canonical website configuration docs, generated agent-readable exports, packaged Arashi skill guidance, and coordinated semantic validation together.

## Capabilities

### New Capabilities

- `interactive-workspace-configuration`: Defines `aw configure` scope selection, explicit descriptors, configured/effective state, keep/edit/clear actions, exact preview, transactional persistence, invocation modes, and PTY coverage.

### Modified Capabilities

- `interactive-repository-configuration`: Extends the shared repository editor from new-repository onboarding to existing repository configuration while retaining the #274 path, hook, active-file, validation, and safety contracts.
- `docs-workflow-guidance-sections`: Adds concise public guidance for inspecting and changing supported configuration through `aw configure`.
- `docs-agent-readable-exports`: Includes canonical `aw configure` behavior in generated Markdown and LLM discovery surfaces.
- `arashi-skill-guidance`: Teaches agents to prefer the interactive command for supported existing-workspace edits while preserving direct JSON guidance for unsupported fields.
- `cross-repo-command-contracts`: Adds the configure command and normalized inspection/editing semantics to CLI-derived and coordinated companion-surface validation.

## Impact

- **CLI (`repos/arashi`)**: new command registration and implementation, generalized editor descriptors/adapters, prompt and transaction orchestration, sanitized JSON inspection, PTY/unit/integration tests, command contracts, README guidance, and generated completion/contract artifacts.
- **Docs (`repos/arashi-docs`)**: configuration and command guidance, generated agent-readable exports, and repository-local semantic checks.
- **Skills (`repos/arashi-skills`)**: focused workspace command guidance plus authored/extracted-package checks.
- **Meta repository**: OpenSpec deltas, coordinated contract fixtures/checkers, and child-first delivery evidence.
- No config schema expansion, generic schema-derived editor, implicit mutation, broad non-interactive setters, crash-safe replacement claim, native-helper expansion, or new filesystem-race guarantee is introduced.
