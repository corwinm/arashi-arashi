## 1. CLI Test Coverage

- [x] 1.1 Add failing shared-launcher unit tests for cmux environment detection, ordinary Ghostty distinction, and socket-path-only non-detection.
- [x] 1.2 Add failing unit tests for the exact argv-safe `cmux workspace create` command, structured workspace identifier/ref parsing, and `cmux` launch result mode.
- [x] 1.3 Add failing unit tests for missing CLI, non-zero socket/access failures, malformed JSON, missing identifiers, and no-Ghostty-fallback behavior.
- [x] 1.4 Add precedence regression tests for explicit IDE flags, explicit sesh, nested tmux, ordinary Ghostty, and the existing terminal launchers.
- [x] 1.5 Add command-level coverage proving `switch` and explicit/configured post-create launch report and preserve the shared `cmux` launch result, including post-create launch failure after successful worktree creation.

## 2. CLI Implementation

- [x] 2.1 Add cmux managed-terminal detection and the `cmux` launch mode to shared launcher and command result types.
- [x] 2.2 Implement atomic cmux workspace creation/focus with exact `--cwd` argv handling, JSON parsing, and required workspace identifier/ref validation.
- [x] 2.3 Integrate cmux at the specified automatic precedence point while preserving explicit IDE, sesh, nested tmux, and existing terminal fallback behavior.
- [x] 2.4 Emit actionable `LAUNCH_FAILED` details for command execution, socket/access, and response validation failures without standalone Ghostty fallback.
- [x] 2.5 Run focused launcher, switch, and create tests, then the full `pnpm run lint`, `pnpm run test`, and `pnpm run build` gates in `repos/arashi`.

## 3. User Documentation

- [x] 3.1 Update canonical switch and create documentation with automatic cmux behavior, nested tmux precedence, the verified cmux CLI/version contract, and actionable socket/access troubleshooting.
- [x] 3.2 Update or add the smallest appropriate terminal workflow guidance and cross-link it from affected command pages without duplicating the cmux API reference.
- [x] 3.3 Run `pnpm validate` in `repos/arashi-docs` and smoke-check generated Markdown/`llms-full.txt` exports for the cmux guidance.

## 4. Agent Skill Guidance

- [x] 4.1 Update the smallest relevant `repos/arashi-skills` command or workflow reference with cmux detection, prerequisites, precedence, and troubleshooting guidance; keep the top-level skill unchanged unless routing changes.
- [x] 4.2 Run the repository's skill validation and packaging/security checks and verify the published skill boundary contains only intended artifacts.

## 5. Cross-Repository Verification

- [x] 5.1 Exercise a representative cmux launch contract against an installed or controlled fixture CLI, including a worktree path with spaces or shell-significant characters.
- [x] 5.2 Verify final diffs and clean status in every affected repository, cross-link the CLI/docs/skills/meta PRs, and record exact validation evidence before archive and merge closeout.
