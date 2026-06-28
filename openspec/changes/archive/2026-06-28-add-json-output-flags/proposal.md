## Why

Agents, scripts, and other tooling need reliable structured output from Arashi commands without scraping human-oriented progress text. Arashi already has partial JSON support, but the behavior is inconsistent across commands and lacks a shared success/error envelope.

## What Changes

- Add a consistent `--json` mode for automation-relevant commands that return structured command results.
- Standardize JSON stdout as exactly one parseable document using an envelope with `ok`, `command`, `schemaVersion`, `data`, `warnings`, and structured `error` fields.
- Suppress spinners, colors, banners, tables, and progress output on stdout while JSON mode is active.
- Emit command-level failures as structured JSON when the command accepts `--json`, while preserving non-zero exit codes.
- Prevent JSON mode from triggering prompts; missing non-interactive input returns a structured error such as `INTERACTIVE_INPUT_REQUIRED`.
- Explicitly reject `--json` for modes whose primary result is shell code emission, external app launch, or an interactive session unless they can return a safe non-interactive plan/result.
- Document command support and output shape for automation consumers.

## Capabilities

### New Capabilities
- `machine-readable-cli-output`: JSON-mode behavior, error envelopes, non-interactive requirements, and command support policy for automation-friendly Arashi CLI output.

### Modified Capabilities

## Impact

- Affected repo: `repos/arashi` for CLI options, shared JSON helpers, command implementations, and tests.
- Affected docs and skill guidance: `repos/arashi-docs`, `repos/arashi-skills`, and possibly `repos/arashi/README.md` for the supported command list, JSON envelope examples, and agent-facing automation guidance.
- Likely affected commands: `clone`, `create`, `init`, `install`, `pull`, `setup`, `status`, `switch`, `sync`, and `update`; existing `list`, `add`, and `remove` support should be audited and may need envelope alignment.
- External API/dependencies: none expected.
