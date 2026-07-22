## Why

`defaults.switch.mode` and `defaults.switch.launchMode` expose two internal resolution phases as separate user choices, allowing configurations whose effective behavior is surprising or partly inert. In particular, current `auto` chooses parent-shell `cd` before launcher detection, so managed contexts such as tmux, Herdr, cmux, and integrated IDE terminals are bypassed whenever shell integration is active.

## What Changes

- Make `defaults.switch.mode` the single canonical switch default with values for contextual automatic behavior (`auto`), parent-shell switching (`cd`), automatic launcher selection (`launch`), and explicit supported launchers (`sesh` and `herdr`). The mode set may be extended with `tmux` when the explicit tmux work in #223 is adopted, but this change does not add the `--tmux` override itself.
- Change `auto` to try strictly detected managed launcher contexts in the established order before using parent-shell `cd`; use normal terminal/platform launch fallback when neither a managed context nor parent-shell switching is available.
- Preserve explicit CLI launcher flags, `--cd`/`--no-cd`, launcher-conflict validation, and the `--no-default-launch` opt-out at higher precedence than configured defaults.
- **BREAKING (canonical schema):** Remove `defaults.switch.launchMode` from the canonical schema and authored examples while retaining a bounded runtime compatibility normalizer for legacy configurations.
- Normalize representable legacy combinations deterministically: automatic launch values map to `launch`, explicit launcher values map to their corresponding unified mode, and `auto` plus an explicit legacy launcher preserves that explicit launcher. Reject legacy combinations that encode a configured `cd` primary action plus a different explicit fallback launcher because the unified model cannot preserve both intents; return actionable migration guidance instead of silently discarding either value.
- Keep `defaults.create` and editor-scoped create defaults unchanged because their post-create switch/launch decisions remain independently meaningful.
- Update CLI diagnostics, schema, generated command contracts, canonical and agent-readable documentation, and the Arashi skill package to use the unified model consistently.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `switch-command`: Replace the two-field configured switch behavior with one unified mode, invert contextual `auto` precedence, define CLI/config precedence and fallback behavior, and specify legacy normalization and rejection semantics.

## Impact

- CLI configuration types and normalization, switch behavior/launcher resolution, warnings/errors, tests, generated JSON schema, command help/docs, and semantic command contracts in `repos/arashi`.
- Canonical switch/config/shell and launcher workflow guidance plus generated Markdown and LLM exports in `repos/arashi-docs`.
- Switch, session, and launcher guidance in `repos/arashi-skills`.
- Existing `version: "1.0.0"` configuration remains readable through compatibility normalization, but authored configuration and schema consumers move to the unified `mode` field.
