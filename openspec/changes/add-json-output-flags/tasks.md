## 1. Audit and Design

- [ ] 1.1 Audit every user-facing command and classify JSON support as supported, unsupported for specific modes, or not applicable.
- [ ] 1.2 Define the shared TypeScript types and helper functions for success and failure JSON envelopes.
- [ ] 1.3 Identify existing `list`, `add`, and `remove` JSON payload compatibility implications and choose a migration approach.

## 2. Core CLI Implementation

- [ ] 2.1 Add shared JSON envelope helpers and structured error helpers in the Arashi CLI.
- [ ] 2.2 Ensure JSON mode suppresses human stdout output, spinners, colors, banners, tables, and prompts.
- [ ] 2.3 Add structured JSON error output for command-level failures after option parsing.
- [ ] 2.4 Add non-interactive guardrails for commands that would otherwise prompt in JSON mode.

## 3. Command Coverage

- [ ] 3.1 Implement or align JSON output for existing JSON-capable commands: `list`, `add`, and `remove`.
- [ ] 3.2 Implement JSON output for workspace discovery and mutation commands: `clone`, `create`, `init`, and `install`.
- [ ] 3.3 Implement JSON output for maintenance/status commands: `pull`, `setup`, `status`, `sync`, and `update`.
- [ ] 3.4 Add structured unsupported-mode handling for shell integration, external launch, and interactive-session modes such as relevant `shell`, `switch`, and `create` variants.

## 4. Tests and Documentation

- [ ] 4.1 Add tests that run representative commands with `--json` and parse stdout as exactly one JSON document.
- [ ] 4.2 Add tests for JSON-mode command failures, unsupported modes, missing non-interactive inputs, and stdout isolation.
- [ ] 4.3 Update CLI documentation with the JSON envelope, command support matrix, unsupported-mode behavior, and examples.
- [ ] 4.4 Update `repos/arashi-skills` agent-facing command guidance so agents know when to prefer `--json` and how to handle structured unsupported-mode errors.
- [ ] 4.5 Run `bun run lint`, `bun run test`, and `bun run build` in `repos/arashi`; run relevant docs and skills checks if documentation or skill guidance changes.
