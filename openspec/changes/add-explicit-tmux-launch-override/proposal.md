## Why

Arashi can already choose plain tmux automatically, but users cannot request that launcher explicitly. This leaves one-off switching and post-create launches dependent on environment precedence and prevents deterministic tmux selection when configured defaults or another managed terminal context would otherwise win.

## What Changes

- Add `--tmux` to `arashi switch` and `arashi create`; on create it implies post-create launch.
- Make explicit tmux selection override configured switch/create defaults and automatic managed-context detection in configured and zero-config repositories.
- Require a non-empty `TMUX` environment value for explicit tmux launch and fail with an actionable usage error without trying another launcher.
- Reject `--tmux` combined with `--cd` or another explicit launcher before switching, creating worktrees, or launching.
- Keep `tmux` as a per-invocation override in this slice; configured `auto` continues to choose tmux inside an active tmux session, while existing create `launchMode` and unified switch-mode vocabularies remain unchanged.
- Preserve the current argv-safe `tmux new-window -c <worktree-path>` invocation and all automatic launch behavior when `--tmux` is absent.
- Keep JSON execution non-mutating by rejecting explicit tmux launch through the existing structured unsupported-mode contract.
- Update CLI help, canonical switch/create/tmux documentation, and Arashi skill guidance, and add contract tests proving configuration vocabularies remain unchanged.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `switch-command`: Add explicit plain-tmux selection, precedence, prerequisite, conflict, standalone, JSON, and no-regression requirements.
- `create-command-defaults`: Add explicit plain-tmux post-create launch semantics, validation timing, standalone behavior, and partial-success handling.
- `machine-readable-cli-output`: Define structured JSON rejection for tmux launch requests without side effects.
- `cross-repo-command-contracts`: Keep CLI help, generated configuration schema, docs, and skill command guidance aligned with the tmux option and configuration vocabulary.
- `docs-workflow-guidance-sections`: Document deterministic plain-tmux switching and post-create workflows and distinguish them from sesh.
- `arashi-skill-guidance`: Teach agents when and how to select plain tmux explicitly and how prerequisite/conflict failures behave.

## Impact

- `repos/arashi`: switch/create option parsing, launch resolution, switch errors/result typing, help and generated CLI command contracts, configuration no-change contract coverage, and focused unit/integration/standalone tests.
- `repos/arashi-docs`: canonical switch/create references and the tmux/sesh workflow guide, including generated agent-readable exports if required by validation.
- `repos/arashi-skills`: tmux/session shortcut and tutorial/troubleshooting guidance plus command-contract fixtures if affected.
- Meta-repository contract tooling: typed option-policy ingestion, cross-repository semantic checks, and deliberate-drift fixtures in `scripts/command-contracts.ts` and `tests/command-contracts.test.ts`.
- No new runtime dependency and no breaking change to existing invocations; automatic tmux, sesh, Herdr, cmux, IDE, terminal-app, platform fallback, and configured launcher behavior remains unchanged unless `--tmux` is selected explicitly.
