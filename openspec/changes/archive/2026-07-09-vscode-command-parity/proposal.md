## Why

The Arashi CLI has grown beyond the VS Code extension's command surface: `status`, `move`, `prune`, `setup`, `shell`, `update`, and `install` are now common workflows, but editor-first users still need to drop to a terminal for them. Bringing the command palette closer to CLI parity makes the extension a more complete control surface while preserving safety for destructive or environment-mutating actions.

## What Changes

- Audit the Arashi CLI command list against VS Code contributed commands and document the supported command-palette surface in the extension README.
- Add high-value missing command-palette flows for:
  - `Arashi: Status`
  - `Arashi: Move Changes`
  - `Arashi: Prune Stale Worktrees`
  - `Arashi: Run Setup`
  - `Arashi: Manage Shell Integration`
  - `Arashi: Update Arashi`
  - `Arashi: Install Binary`
- Prefer structured JSON output for commands whose output is parsed or summarized by the extension (`status`, `prune`, `move`, `setup`, `update`, and `install` where supported).
- Add native VS Code confirmations/previews before destructive or environment-changing flows such as moving changes, pruning stale metadata, installing shell integration, applying updates, or installing binaries.
- Keep command behavior aligned with the CLI; the extension orchestrates prompts, confirmations, progress, logging, and panel refresh rather than reimplementing Arashi logic.

## Capabilities

### New Capabilities

- _None._

### Modified Capabilities

- `vscode-command-integration`: Expand the registered VS Code command surface, structured-output usage, safety confirmations, and documentation requirements for newer CLI workflows.
- `vscode-worktree-panel`: Refresh visible panel state after newly added commands that can change workspace or worktree status.

## Impact

- `repos/arashi-vscode/package.json` command contributions and activation events.
- `repos/arashi-vscode/src/constants.ts`, `src/commands/flows.ts`, and `src/commands/handlers.ts` for command IDs, prompt builders, confirmations, execution, and structured result parsing.
- `repos/arashi-vscode/tests/` unit/integration coverage for command registration, argument construction, confirmations, cancellations, JSON enforcement, and panel refresh behavior.
- `repos/arashi-vscode/README.md` command-palette support documentation.
- No CLI behavior change is intended; any CLI gaps discovered during implementation should become focused follow-up issues rather than being folded into this extension PR unless they are blockers.