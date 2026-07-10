## Why

Coordinated Arashi work often spans multiple repositories and may be paused, reviewed, or handed to another human or agent before it is complete. A first-class handoff report gives the next worker a consistent snapshot of workspace state, changed repositories, related links, validation evidence, remaining tasks, and safe next commands instead of relying on ad hoc free-form summaries.

## What Changes

- Add an `arashi handoff` command that produces an agent/human-friendly Markdown handoff report for the current coordinated workspace.
- Add `arashi handoff --json` for automation-safe structured report data using Arashi's existing JSON envelope contract.
- Support caller-supplied context fields for links, validation evidence, remaining tasks, risks/blockers, and next commands without requiring Arashi to infer everything from free-form text.
- Include per-repository status from Arashi workspace inspection so reports reflect actual coordinated workspace state.
- Document when and how agents and humans should create handoff reports during multi-repo work, and add companion skill guidance.

## Capabilities

### New Capabilities
- `agent-handoff-reporting`: Defines the handoff-report workflow, Markdown output contract, report inputs, per-repository status inclusion, documentation, and agent guidance.

### Modified Capabilities
- `machine-readable-cli-output`: Adds the `handoff --json` structured output contract to the existing JSON envelope and stdout-isolation requirements.

## Impact

- `repos/arashi`: new CLI command, workspace/report assembly logic, Markdown renderer, JSON data shape, and tests.
- `repos/arashi-docs`: new or updated command/workflow documentation explaining handoff reports for humans and agents.
- `repos/arashi-skills`: companion agent guidance describing when to generate handoff reports and how to include validation/results/context.
- No breaking changes to existing commands or configuration are intended.
