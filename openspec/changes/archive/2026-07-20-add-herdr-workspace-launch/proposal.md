## Why

Arashi-managed worktrees cannot currently join Herdr's persistent workspace flow, so users invoking `arashi switch` or post-create launch from Herdr fall through to generic terminal behavior. Herdr v0.7.4 is now installed and locally verified to open an existing Git worktree, focus it, and reuse the same workspace on repeated requests without taking over worktree creation.

## What Changes

- Detect Herdr-managed panes from the exact normalized `HERDR_ENV=1` signal before IDE and generic terminal fallbacks.
- Add explicit `--herdr` launch selection to `arashi switch` and `arashi create`, including deterministic conflict validation with other explicit launchers.
- Add `herdr` to configured switch and create launch modes, including editor-scoped create defaults where launch modes are accepted.
- Resolve each switch target's non-bare source/main checkout through Git, represent repositories without a valid Herdr source explicitly, and invoke Herdr's existing-worktree contract with argv-safe paths and labels.
- Validate Herdr's JSON response and workspace identifier, reuse already-open workspaces, and report actionable binary, socket, process, and response failures without falling back to another launcher.
- Preserve completed Arashi worktree creation if post-create Herdr launch fails, and keep Herdr workspace cleanup out of `arashi remove`.
- Document Herdr prerequisites, automatic versus explicit/configured behavior, Arashi/Herdr ownership boundaries, reuse behavior, grouping, troubleshooting, and optional hook-based cleanup.
- Align the Arashi skill's optional-command and workflow guidance with the final CLI contract.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `switch-command`: Add explicit, configured, and automatically detected Herdr launch behavior with source-checkout metadata, workspace reuse, response validation, failure handling, and launcher precedence.
- `create-command-defaults`: Add Herdr as an explicit/configured post-create launch mode while preserving successfully created worktrees when launch fails.

## Impact

- `repos/arashi`: Git-backed switch candidate source resolution, shared launch types and implementation, create/switch option and default resolution, configuration schema/types, generated CLI contracts, maintained CLI docs/help/output/errors, and unit/integration coverage.
- `repos/arashi-docs`: canonical command, configuration, integrations, lifecycle, and troubleshooting guidance plus generated agent-readable exports.
- `repos/arashi-skills`: optional command metadata and focused session/workflow references.
- Runtime integration with the external Herdr CLI/socket contract (`herdr worktree open`); no package dependency and no Herdr-owned Git create/remove operation are introduced.
