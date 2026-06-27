## Context

Arashi commands currently mix human-oriented output, process spinners, hooks, prompts, and a few ad hoc JSON result shapes. `list --json`, `add --json`, and `remove --json` exist today, but they do not share the proposed envelope. Other automation-relevant commands still require consumers to parse text. The feature should make the CLI reliable for agents while preserving the existing human experience by default.

## Goals / Non-Goals

**Goals:**

- Provide a stable, lightweight JSON envelope for command success, warnings, and command-level failure.
- Keep stdout parseable as exactly one JSON document whenever a command accepts `--json`.
- Audit every command and classify it as supported, unsupported for a mode, or not automation-relevant.
- Make JSON mode non-interactive and explicit about missing required input.
- Add tests that parse stdout and assert there is no human-only output in JSON mode.
- Document the supported commands, envelope, and unsupported-mode error behavior.

**Non-Goals:**

- Replacing human-readable default output.
- Guaranteeing JSON for errors that occur before Commander/Arashi can parse command options.
- Streaming progress events as JSON lines; this change uses a single-document stdout contract.
- Designing a long-term remote API or daemon protocol.

## Decisions

### Shared JSON envelope helper

Implement shared helpers in `repos/arashi/src/lib` (or a similarly central module) to write success and failure envelopes consistently:

```json
{
  "ok": true,
  "command": "status",
  "schemaVersion": 1,
  "data": {},
  "warnings": []
}
```

Failures use the same top-level metadata plus an `error` object:

```json
{
  "ok": false,
  "command": "create",
  "schemaVersion": 1,
  "error": {
    "code": "WORKTREE_EXISTS",
    "message": "Worktree already exists",
    "details": {}
  },
  "warnings": []
}
```

Rationale: a common helper avoids drift and lets existing ad hoc JSON commands migrate incrementally while preserving command-specific payloads under `data`.

### JSON mode controls stdout, not all process output

Commands in JSON mode must reserve stdout for the final JSON document. Progress, diagnostics, hook output, and verbose details must be suppressed, captured into `data`/`warnings`, or written to stderr only when that behavior is intentional and documented.

Rationale: most automation reads stdout as the result channel. Allowing verbose diagnostics on stderr preserves debugging without corrupting parsers.

### Non-interactive by construction

`--json` must not prompt. Commands that can otherwise prompt, such as repository selection or confirmations, must require flags/arguments in JSON mode and return `INTERACTIVE_INPUT_REQUIRED` or a more specific structured error when input is insufficient.

Rationale: tools and agents often run without a TTY and need deterministic failures rather than hung processes.

### Explicit unsupported-mode errors

Commands or subcommands whose core purpose is to emit shell integration (`shell init`), launch an editor/terminal (`switch` launch modes, `create --launch`), or enter an interactive session may return `JSON_UNSUPPORTED_FOR_MODE`. If a safe plan/result is useful, the command may instead return a non-mutating plan under `data`.

Rationale: this avoids forcing awkward JSON around actions where the primary output is intentionally not structured data, while still making unsupported cases machine-readable.

### Compatibility path for existing JSON commands

Existing `list`, `add`, and `remove` JSON modes should be treated as part of the audit. They should be migrated to the shared envelope unless implementation review finds a compatibility reason to temporarily preserve their existing shape behind a documented transition path.

Rationale: automation consumers benefit most from one convention, but existing users of the current JSON shape should be considered during implementation review.

## Risks / Trade-offs

- [Risk] Migrating existing JSON output could break early consumers of `list`, `add`, or `remove`. → Mitigate by documenting the envelope change in the proposal/PR and considering compatibility aliases only if real consumers are identified.
- [Risk] Hook or package-manager output can leak to stdout in JSON mode. → Mitigate with command-level tests that execute representative commands and parse stdout as JSON.
- [Risk] Some commands have side effects that are hard to summarize. → Mitigate with explicit command support classifications and `JSON_UNSUPPORTED_FOR_MODE` for launch/shell/interactive modes.
- [Risk] A single JSON document hides long-running progress. → Mitigate by keeping human mode unchanged and allowing documented stderr diagnostics for verbose JSON invocations.
