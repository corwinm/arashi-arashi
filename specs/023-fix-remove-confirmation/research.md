# Research: Fix Remove Command Confirmation

## Decision 1: Use `@inquirer/prompts` with explicit cancellation handling

- Decision: Keep prompts in the command handler and wrap them with a small helper that catches `ExitPromptError`/`AbortPromptError`, returning a controlled result instead of exiting the process.
- Rationale: Ensures the selection flow stays open until a submit or explicit cancel, and avoids premature exits on Ctrl+C or aborted prompts.
- Alternatives considered: Raw `readline` prompts (more manual state handling), full `inquirer` package (heavier, not needed for single prompts).

## Decision 2: Guard prompts with a non-interactive check

- Decision: Check `process.stdin.isTTY` before invoking prompts and fail with a clear error if not interactive.
- Rationale: Prevents hanging or rejected prompts in CI/piped environments and meets the non-interactive requirement.
- Alternatives considered: Allow prompts in non-TTY with fallback defaults (risky for destructive actions), environment variable overrides only.

## Decision 3: Preserve commander-driven argument parsing and validation

- Decision: Validate branch arguments in the command action and use `program.error()` for consistent exit messaging.
- Rationale: Centralizes argument validation and ensures clean exit codes without stack traces.
- Alternatives considered: Manual argument parsing inside the command logic (less consistent with existing CLI patterns).

## Decision 4: Maintain chalk/ora output patterns with TTY-aware spinners

- Decision: Keep using chalk for color and ora for spinners; rely on ora's non-TTY disable behavior and provide clear text output.
- Rationale: Meets user-centric output expectations without breaking logs in CI.
- Alternatives considered: Plain console output only (less informative in interactive mode), custom spinner implementation.

## Decision 5: Resolve branch inputs via worktree listing before removal

- Decision: Map branch inputs to worktree entries using `git worktree list --porcelain`, and error clearly on invalid branches before prompting for confirmation.
- Rationale: Aligns with common git tooling safety patterns and prevents accidental deletion of the wrong worktree.
- Alternatives considered: Passing branch names directly to `git worktree remove` (fails with ambiguous errors), skipping confirmation for branch removal (violates requirements).
