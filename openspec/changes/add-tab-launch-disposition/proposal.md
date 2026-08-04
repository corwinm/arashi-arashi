## Why

Arashi currently delegates launch disposition to each detected terminal or managed launcher, so the same `switch` or post-create launch can open a tab, window, or managed workspace depending on the application. With #106 establishing a same-app new-window default on Windows, Arashi now needs one explicit cross-platform contract: launches default to a new window or equivalent independent managed session, while tab reuse is opt-in and never silently downgraded.

## What Changes

- Add a CLI-only `--tab` launch-disposition override to `arashi switch` and `arashi create` for one invocation; do not add a persisted configuration field.
- Make the shared launcher carry an explicit `window` or `tab` disposition instead of allowing individual integrations to choose implicitly.
- Define an explicit disposition mapping for Windows Terminal, Terminal.app, iTerm2, WezTerm, Kitty, Ghostty, tmux, cmux, Herdr, Git Bash/Mintty, supported IDE launchers, and generic platform fallbacks.
- Reconcile managed Kitty detection with its canonical one-of-marker contract so disposition routing does not preserve the merged implementation's narrower detector.
- Preserve the detected application, active profile or shell where supported, and exact selected worktree directory in both dispositions.
- Fail with actionable guidance before switching or post-create mutation when `--tab` resolves to an integration that cannot provide a tab or documented tab-equivalent; never retry as a new window after a requested tab fails.
- Preserve created worktrees when a tab-capable launch fails only after successful creation, consistent with existing post-create launcher failure semantics.
- Reject `--tab` under machine-readable launch modes and define its interactions with explicit launchers and negative launch/switch flags.
- Bump and regenerate the CLI command contract with generalized option-policy metadata, then add coordinated docs/skills validation for the new CLI-only behavior.

## Capabilities

### New Capabilities

- `launch-disposition`: Shared window/session versus tab launch semantics and per-integration mappings.

### Modified Capabilities

- `switch-command`: Register, validate, resolve, and propagate `--tab` through automatic and explicit switch launch paths.
- `create-command-defaults`: Apply the same one-off disposition to post-create launches without expanding persisted create configuration.
- `cross-repo-command-contracts`: Represent and enforce disposition option policy across CLI, documentation, and skill artifacts.
- `machine-readable-cli-output`: Preserve structured JSON rejection precedence for the new human-only launch option at both public command boundaries.
- `kitty-worktree-sessions`: Define managed Kitty's identity-backed tab/session as the explicit independent-session and tab-equivalent mapping.
- `docs-workflow-guidance-sections`: Explain the default independent-context behavior, `--tab`, supported mappings, and unsupported cases.
- `arashi-skill-guidance`: Teach agents the same CLI-only disposition contract and failure boundaries.

## Impact

- **CLI implementation:** `repos/arashi/src/commands/switch.ts`, `repos/arashi/src/commands/create.ts`, `repos/arashi/src/lib/switch-launcher.ts`, Kitty integration code, error types, and launcher-focused tests.
- **Generated contracts:** `repos/arashi/contracts/cli-commands.json` and its generator/schema/tests; configuration schema and normalization remain unchanged.
- **Companion guidance:** canonical CLI docs, generated agent-readable docs, and the packaged Arashi skill plus their focused self-tests.
- **Meta validation:** coordinated semantic checks and deliberate-drift fixtures for command-specific option policy and launcher disposition guidance.
- **External tools:** no new runtime dependency; existing launcher argv/protocols change where required to make disposition explicit.
