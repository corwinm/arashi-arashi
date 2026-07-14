## Why

cmux terminals identify themselves as Ghostty, so Arashi currently falls through to its generic Ghostty launcher and opens the selected worktree outside the user's cmux workspace flow. cmux now provides a structured workspace-creation API that can open and focus an exact working directory, allowing Arashi's existing shared launcher to support cmux directly.

## What Changes

- Detect cmux-managed terminal sessions from cmux-specific environment identifiers before generic Ghostty detection.
- Add a `cmux` launch result mode to the shared worktree launcher used by `arashi switch` and `arashi create --launch`.
- Create and focus a cmux workspace rooted at the exact selected worktree through the structured cmux CLI contract.
- Report actionable launch failures when the cmux CLI, socket access, or response contract is unavailable instead of silently opening standalone Ghostty.
- Preserve existing explicit IDE, tmux/sesh, terminal-app, and platform fallback precedence.
- Document cmux prerequisites, automatic behavior, supported version contract, and troubleshooting, with aligned agent skill guidance where needed.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `switch-command`: Extend automatic terminal launch behavior with first-class cmux workspace detection, creation, focus, reporting, and precedence rules.
- `create-command-defaults`: Require post-create launch behavior to use the shared cmux workspace integration when creation runs from a cmux-managed terminal.

## Impact

- `repos/arashi/src/lib/switch-launcher.ts` and its launch-mode consumers and tests.
- `repos/arashi` command tests for both switch and post-create launch paths.
- `repos/arashi-docs` switch/create or terminal workflow guidance and generated agent-readable exports.
- `repos/arashi-skills` detailed command/workflow references if cmux guidance is added there.
- Runtime integration with the external `cmux` CLI and its local control socket; no new package dependency is expected.
