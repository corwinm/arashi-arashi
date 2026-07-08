## Context

The VS Code extension currently contributes command-palette flows for the original worktree-management set (`init`, `add`, `clone`, `create`, `pull`, `sync`, `switch`, `remove`) plus repository-navigation helpers. The CLI now exposes a broader user-facing surface:

- `init`, `install`, `add`, `clone`, `create`, `move`, `list`, `status`, `remove`, `prune`, `pull`, `sync`, `shell`, `setup`, `switch`, `update`

The extension already has shared command-runner infrastructure, native prompt abstractions, progress notifications, failure handling, output-channel logging, and a worktree panel backed by JSON CLI output. The implementation should extend those patterns rather than creating command-specific one-offs where a shared helper is sufficient.

## Goals / Non-Goals

**Goals:**

- Expose the most useful missing CLI workflows from the command palette.
- Use native VS Code inputs, quick-picks, confirmations, progress notifications, and output-channel logging consistently.
- Prefer `--json` whenever the extension parses or summarizes command output.
- Require explicit confirmation for destructive or environment-mutating flows.
- Refresh the worktree panel after commands that can change visible Arashi state.
- Keep documentation and tests aligned with the new command surface.

**Non-Goals:**

- Reimplement Arashi command semantics inside the extension.
- Add a full terminal emulator or interactive shell session inside the extension.
- Guarantee parity with every CLI option in the first slice; the extension should cover safe/high-value defaults and obvious prompts first.
- Change CLI output contracts or command behavior unless a blocker is discovered and split into a focused follow-up.

## Decisions

### Add command-palette entries for high-value workflows, not every subcommand option

The extension will add entries for `status`, `move`, `prune`, `setup`, `shell`, `update`, and `install`. `list` is already represented by the worktree panel and refresh flow, so it does not need a separate `Arashi: List` command unless implementation discovers a useful non-panel scenario.

Alternatives considered:

- **Expose every CLI command and option one-for-one.** Rejected for the first slice because it would create a large UX surface without clear safety defaults.
- **Only add status/prune.** Rejected because issue #183 specifically calls out several newer workflows and the existing command-runner infrastructure can support a broader but still bounded set.

### Use structured output for extension-consumed results

Commands whose results are summarized in notifications or used for decisions should be invoked with `--json` when the CLI supports it. Human-output commands are acceptable only when the extension merely logs output and reports success/failure without parsing.

Expected JSON-backed flows include:

- `status --json` for clean/dirty summaries.
- `move --json` for moved/skipped/failed repository summaries.
- `prune --dry-run --json` for preview and `prune --json` for apply results.
- `setup --json` for per-repository setup outcomes.
- `update --check --json`, `update --dry-run --json`, and confirmed `update --yes --json`.
- `install --json` if supported by the CLI at implementation time; otherwise the extension should treat it as a non-parsed command and log output.

### Confirm before destructive or environment-mutating operations

The extension should add native confirmation before:

- Moving uncommitted changes between worktrees.
- Applying `prune` after a dry-run preview finds stale metadata.
- Running setup scripts across repositories.
- Installing shell integration.
- Applying updates or installing/reinstalling the Arashi binary.

Status/check/dry-run flows should not require confirmation.

### Keep shell integration bounded

`arashi shell` has subcommands such as `init` and `install`. The extension should prioritize `shell install` behind confirmation because it is a durable environment change. If users need generated shell wrapper code, the extension can run `shell init` and log/copy output as a follow-up, but the first implementation should not attempt shell-specific startup-file editing itself.

### Refresh panel after state-changing flows

The extension should refresh the worktree panel after successful `move`, `prune`, `setup`, `install`, and `update` when those commands can change visible status or availability. It should not present a successful refresh after failed commands.

## Risks / Trade-offs

- **Risk: CLI JSON shape differs by command.** → Mitigation: keep parsers narrow, tolerate unknown fields, and fall back to output-channel diagnostics when JSON is malformed or unsupported.
- **Risk: Overly broad command parity creates confusing UX.** → Mitigation: use clear command names, bounded prompts, and document which CLI workflows are exposed.
- **Risk: Destructive actions run without sufficient preview.** → Mitigation: use dry-run/preview modes where available (`prune`, `update`) and native confirmation before mutation.
- **Risk: `install`/`update` availability differs by install channel or platform.** → Mitigation: rely on CLI errors for unsupported cases, show user-visible failure messages, and log details instead of guessing platform behavior in the extension.

## Migration Plan

1. Add extension commands and tests in `corwinm/arashi-vscode` on the coordinated branch.
2. Update `README.md` in the same repo to list the command-palette surface and note confirmation behavior.
3. Validate with `bun run lint`, `bun test`, and `bun run build`.
4. Open a focused implementation PR for `corwinm/arashi-vscode` linked to the OpenSpec/meta PR and issue #183.
5. Archive/sync this OpenSpec change after implementation review and before merging the meta PR.
