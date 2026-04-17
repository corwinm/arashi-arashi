## 1. CLI create defaults

- [x] 1.1 Extend Arashi config types, normalization, and schema output to support editor-scoped create defaults under the existing defaults tree.
- [x] 1.2 Add create invocation support for editor-host context and update create default resolution so terminal invocations use generic defaults while editor-hosted invocations use host-specific defaults or no defaults.
- [x] 1.3 Add CLI tests covering terminal precedence, editor-specific override precedence, and no-default fallback when an editor host has no configured create defaults.

## 2. VS Code extension integration

- [x] 2.1 Update the extension create argument builder and command handlers to pass the detected editor host when invoking `arashi create`.
- [x] 2.2 Add extension tests covering VS Code, Cursor, and unknown-host create invocations so host context is passed only when supported.

## 3. Docs and validation

- [x] 3.1 Update CLI configuration guidance with examples for generic create defaults versus editor-scoped create defaults, and review whether companion docs need matching updates.
- [x] 3.2 Run the relevant validation commands in `repos/arashi/` and `repos/arashi-vscode/`, then fix any failures introduced by the change.
