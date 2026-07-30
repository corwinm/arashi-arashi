## Why

Arashi currently recognizes Kitty but treats it as a generic tab-launch fallback, so repeated switches create duplicate tabs and the launched worktree is absent from Kitty's native session model. Kitty 0.43+ provides live sessions, exact user-variable markers, structured state, and remote focus primitives that let Arashi map each worktree to a reusable terminal context while keeping Git worktree ownership in Arashi and window ownership in Kitty.

## What Changes

- Promote positively detected Kitty 0.43+ to a first-class automatic launch context after tmux, Herdr, cmux, and supported IDE precedence and before generic terminal/platform fallback.
- Give each canonical worktree path a deterministic collision-resistant identity and a separate readable repository/branch session label.
- Reuse and focus an existing exact Arashi-marked Kitty window; otherwise create a session-backed tab at the exact worktree path, attach the identity marker and readable title, and validate Kitty's structured response/state before reporting success.
- Fail closed with actionable launch detail after Kitty is selected when the executable/version, remote-control permission, response validation, focus, launch, or race reconciliation fails.
- Use the same managed Kitty flow for `arashi switch` and automatic post-create launch while preserving successful worktrees when post-create launch fails.
- Document Kitty 0.43+, remote-control prerequisites, live-only session ownership, reuse behavior, troubleshooting, and the fact that `arashi remove` does not close Kitty sessions.
- Keep the first slice auto-detected only: no `--kitty` flag, persistent Kitty launch mode, generated session file, restart restoration, layout template, or remove-time Kitty mutation.

## Capabilities

### New Capabilities

- `kitty-worktree-sessions`: Define deterministic live Kitty session identity, exact discovery/reuse, validated session-backed launch, race handling, failure behavior, and ownership boundaries.

### Modified Capabilities

- `switch-command`: Add managed Kitty to automatic context detection, launch results, precedence, and fail-closed launcher behavior.
- `create-command-defaults`: Require automatic post-create launch to reuse the shared managed Kitty flow and preserve created worktrees on Kitty launch failure.
- `cross-repo-command-contracts`: Keep canonical Kitty workflow guidance and packaged skill guidance aligned with the CLI behavior and prerequisites.
- `docs-workflow-guidance-sections`: Add a discoverable canonical Kitty workflow and troubleshooting surface.
- `arashi-skill-guidance`: Add concise packaged agent guidance for safe Kitty reuse and managed failure handling.

## Impact

- `repos/arashi`: `src/lib/switch-launcher.ts`, switch launch result types/callers, process/version/state parsing, unit and command/integration tests, and generated CLI contract review.
- `repos/arashi-docs`: canonical switch/create and terminal workflow guidance, installation prerequisites, and troubleshooting; generated agent-readable exports where applicable.
- `repos/arashi-skills`: terminal/worktree workflow guidance and packaged contract coverage.
- Meta-repository: OpenSpec artifacts and cross-repository semantic validation for the Kitty contract.
- `repos/arashi-vscode`: review only; no change is expected because Kitty remains automatic and VS Code does not expose launcher result modes.
- Runtime prerequisite: Kitty 0.43+ with remote control permitted by Kitty configuration/policy. No new package dependency is required.
