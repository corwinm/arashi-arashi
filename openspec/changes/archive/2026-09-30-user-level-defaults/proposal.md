## Why

Personal create, switch, editor, and worktree-layout preferences currently must be repeated in shared workspace configuration or on every invocation. Standalone repositories cannot be personalized without adopting workspace state.

## What Changes

- Add a partial user configuration at `~/.arashi/config.json` with its own schema and required version metadata.
- Resolve supported fields per leaf with CLI > workspace > user > built-in precedence, preserving explicit disabling values.
- Apply personal worktree location and naming in configured and standalone create, including zero-config bootstrap and linked-worktree invocation.
- Qualify shared absolute user roots per repository to prevent collisions.
- Add read-only `aw config effective` inspection with values, sources, and file provenance.
- Update canonical documentation and installed Arashi skill guidance; retain the VS Code extension's existing editor-host integration because the CLI resolves user defaults at execution time.

## Impact

- `repos/arashi`: loading, merging, schema, path resolution, inspection command, tests.
- `repos/arashi-docs`: configuration, standalone, init/create/switch, and command guidance.
- `repos/arashi-skills`: personal-default and diagnostics workflow guidance.
- `repos/arashi-vscode`: reviewed; no code change required because create already passes `--editor-host vscode` and invokes the CLI for every operation.
