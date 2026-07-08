## 1. Command Surface Audit

- [x] 1.1 Compare `arashi --help` top-level commands with `package.json` contributed command-palette actions and record the supported/omitted mapping in the implementation notes or PR body.
- [x] 1.2 Decide whether `list` needs a separate command-palette entry or remains represented by the worktree panel and refresh flow.

## 2. Extension Command Registration

- [x] 2.1 Add command IDs, activation events, and `contributes.commands` entries for status, move, prune, setup, shell integration, update, and install workflows.
- [x] 2.2 Add command handler registrations that reuse the existing command-runner, progress, output logging, failure handling, and panel refresh patterns.

## 3. Command Flows and Safety UX

- [x] 3.1 Implement `Arashi: Status` using `arashi status --json` and show a concise native summary while logging full output.
- [x] 3.2 Implement `Arashi: Move Changes` prompts for source/target worktrees, require confirmation, invoke `arashi move --json`, and summarize moved/skipped/failed repositories when available.
- [x] 3.3 Implement `Arashi: Prune Stale Worktrees` as dry-run preview plus confirmation before applying prune, using structured output where available.
- [x] 3.4 Implement `Arashi: Run Setup` with optional repository selection, confirmation before running setup scripts, structured result handling, and panel refresh after success.
- [x] 3.5 Implement `Arashi: Manage Shell Integration` with a confirmed shell-install path and output-channel diagnostics for shell integration output.
- [x] 3.6 Implement `Arashi: Update Arashi` with check/dry-run/apply choices, confirmation before `--yes`, and structured result handling.
- [x] 3.7 Implement `Arashi: Install Binary` with confirmation before mutation and graceful handling if the CLI install command does not support JSON on the user's installed version.

## 4. Documentation and Tests

- [x] 4.1 Update the extension README feature list and command-palette documentation to include the expanded command surface and confirmation behavior.
- [x] 4.2 Add unit tests for argument builders, cancellation paths, confirmation requirements, JSON enforcement, and panel refresh behavior for the new commands.
- [x] 4.3 Update registration/integration tests so contributed commands and handler registrations include the new command IDs.

## 5. Validation and PRs

- [x] 5.1 Run `bun run lint`, `bun test`, and `bun run build` in `repos/arashi-vscode`.
- [x] 5.2 Open a focused `corwinm/arashi-vscode` implementation PR linked to issue #183 and the OpenSpec/meta PR.
- [ ] 5.3 After implementation review, archive/sync this OpenSpec change, validate the synced specs directly, and update the meta PR body from `Tracks` to `Closes #183` before final merge.
