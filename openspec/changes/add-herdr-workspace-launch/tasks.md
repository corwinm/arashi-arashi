## 1. CLI Contract and Test Coverage

- [x] 1.1 Add failing real-Git-topology tests for non-bare main-checkout resolution across configured linked repositories, coordinated `--all` augmentation, create primary selection, implicit standalone linked worktrees, main-checkout targets, explicit unavailable state for bare repositories, and the existing invocation-relative `WorktreeInfo.isMain` pitfall.
- [x] 1.2 Add failing configuration/default-resolution tests for `launchMode: "herdr"` in switch, generic create, and editor-scoped create defaults.
- [x] 1.3 Add failing command tests for `switch --herdr`, `create --herdr` implying launch, CLI help/human launch output, create sesh conflicts, switch IDE/sesh conflicts, `--cd`, `--no-cd`, `--no-default-launch`, `--no-launch`, and pre-mutation JSON-mode rejection.
- [x] 1.4 Add failing shared-launcher tests for exact normalized `HERDR_ENV=1` detection (including absent, empty, `0`, `true`, and unrelated Herdr variables), explicit/configured/automatic precedence, nested tmux behavior, and cmux/IDE/terminal regressions.
- [x] 1.5 Add failing launcher tests for exact argv-safe `herdr worktree open` arguments, first-open and already-open payloads, `worktree_opened`/boolean-reuse/workspace-ID validation, structured API errors, missing binary/server/socket errors, non-zero exit, malformed JSON, and protocol-mismatched JSON.
- [x] 1.6 Add failing create integration tests proving coordinated and standalone worktrees survive Herdr launch/process/response failures.

## 2. CLI Implementation

- [x] 2.1 Extend switch candidate discovery and creation with Git-resolved non-bare main-checkout or unavailable-source state for configured, augmented, create, standalone, and bare candidates without relying on invocation-relative `WorktreeInfo.isMain`.
- [x] 2.2 Extend launch result types, config types/schema normalization, generated schema, defaults, CLI options, help, semantic contracts/generated contract JSON, errors, and human output with `herdr` while preserving JSON execution restrictions.
- [x] 2.3 Implement exact `HERDR_ENV=1` detection and resolve explicit launcher, configured launch mode, automatic tmux, automatic Herdr, cmux/IDE/terminal, and fallback precedence.
- [x] 2.4 Implement `herdr worktree open --cwd ... --path ... --label ... --focus --json` as an argv array and validate `worktree_opened`, boolean `already_open`, and a non-empty `result.workspace.workspace_id`.
- [x] 2.5 Emit actionable `LAUNCH_FAILED` diagnostics for execution, server/socket, exit, and response failures without fallback or Git rollback.
- [x] 2.6 Update Arashi's maintained `README.md`, `docs/configuration.md`, and `docs/commands/switch.md` where the affected launch/config behavior is documented, then run focused tests, `pnpm run lint`, `pnpm run test`, `pnpm run build`, schema checks, contract checks, and workspace-level `pnpm contracts:check`.

## 3. User Documentation

- [x] 3.1 Update canonical switch/create command and configuration references for explicit, configured, and automatic Herdr launch behavior and launcher conflicts.
- [x] 3.2 Add `docs/workflows/herdr.md` and workflow-index links with prerequisites, verified Herdr v0.7.4 command/response contract, workspace reuse/grouping, bare-source limitation, and Arashi-versus-Herdr ownership boundaries.
- [x] 3.3 Document troubleshooting for missing CLI, unavailable default server/socket, invalid responses, and stale Herdr workspaces; any optional pre-remove cleanup example uses `herdr workspace close` and never Git-mutating `herdr worktree remove`.
- [x] 3.4 Update curated agent exports in `scripts/generate-agent-exports.ts`, regenerate outputs, run `pnpm validate` in `repos/arashi-docs`, and smoke-check Herdr guidance in generated Markdown, `llms.txt`, and `llms-full.txt`.

## 4. Agent Skill Guidance

- [x] 4.1 Add `herdr` to optional command metadata and update the smallest relevant Arashi session/workflow references with `switch --herdr`, `create --herdr`, detection, reuse, and ownership guidance.
- [x] 4.2 Verify skill commands against built CLI help and run the repository's validation, packaging, and security checks.

## 5. Real Integration and Cross-Repository Verification

- [x] 5.1 Exercise the installed Herdr v0.7.4 CLI against an existing Arashi worktree and verify repeated open returns the same workspace ID with `already_open: true`.
- [x] 5.2 Exercise source/target paths and labels containing spaces or shell-significant characters with a controlled fixture or real temporary worktree.
- [x] 5.3 Independently review the implementation against every spec scenario, fix findings, rerun all affected repository validation, and verify clean coordinated status.
- [x] 5.4 Cross-link CLI, docs, skills, and meta/OpenSpec PRs with exact validation evidence before archive and merge closeout.
