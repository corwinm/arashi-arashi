## Why

`defaults.create.launch` and `defaults.create.launchMode` expose launch enablement and launcher selection as separate public choices, allowing inert or surprising combinations and forcing users to compose two fields for one post-create action. Now that switch defaults use one canonical mode, create defaults should use the same direct launcher vocabulary while preserving create-specific switch and rollback semantics.

## What Changes

- Make `defaults.create.launch` and `defaults.editors.<host>.create.launch` the single canonical post-create launch choice with values `none`, `auto`, `sesh`, and `herdr`; keep `switch` as an independent boolean.
- Preserve the rule that any requested launch also selects the newly created primary worktree for post-create handling, while `launch: "none"` disables launch without disabling an independently configured switch.
- Preserve explicit CLI precedence: `--sesh` and `--herdr` select and imply launch, `--launch` selects automatic launch, `--no-launch` opts out of configured launch, and conflicting explicit launchers fail before workspace mutation.
- **BREAKING (canonical schema):** Replace the canonical create `launch` boolean with the launch-mode string and remove create-specific `launchMode` from canonical types, schema, authored examples, generated exports, and skill guidance.
- Retain a bounded runtime compatibility normalizer for legacy `launch` booleans plus `launchMode` / `launch_mode`; normalize every representable combination deterministically, emit exact replacement diagnostics for accepted mappings, and reject ambiguous, invalid, or conflicting combinations before mutation.
- Keep automatic launcher detection, sesh/Herdr process contracts, source-checkout resolution, argv safety, post-create failure preservation, standalone explicit-flag behavior, and editor-host scope precedence unchanged.
- Update CLI help/diagnostics, schema, semantic command contracts, canonical docs, generated agent-readable exports, and Arashi skills to agree on the simplified create model.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `create-command-defaults`: Replace the two-field create launch default with one canonical launch choice, define CLI and host-scope precedence, specify legacy normalization and diagnostics, and preserve post-create launch/switch/failure behavior.
- `switch-command`: Remove the now-stale guarantee that create launch configuration remains unchanged while preserving the independent switch mode contract.
- `cross-repo-command-contracts`: Require deterministic semantic comparison of the canonical create launch contract across CLI schema, docs, generated exports, and packaged skill guidance.

## Impact

- CLI configuration types and normalization, create default resolution, validation diagnostics, tests, generated JSON schema, help/docs, and command-contract enforcement in `repos/arashi`.
- Canonical create/config/tmux/Herdr workflow guidance plus generated Markdown and LLM exports in `repos/arashi-docs`.
- Create and launcher guidance, package checks, and semantic contracts in `repos/arashi-skills`.
- Cross-repository semantic contract enforcement in the meta-repository.
- `repos/arashi-vscode` continues passing only the hidden editor-host context; no extension API change is expected, but all supported host scopes consume the new canonical configuration vocabulary.
- Representable existing `version: "1.0.0"` create defaults remain readable through bounded compatibility normalization; ambiguous or inert two-field combinations are rejected with actionable single-field alternatives. Newly authored configuration and schema consumers move to the single `launch` string field.
