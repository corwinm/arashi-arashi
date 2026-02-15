# Research Notes: Windows CLI Compatibility

## Decision 1: Use a cross-platform launcher entry point for npm installs

- **Decision**: Use a single launcher entry point that runs on Windows and delegates to the correct platform wrapper at runtime.
- **Rationale**: npm-generated Windows launchers work best with a Node-compatible entry point; delegating from a single entry avoids shell-specific failures in PowerShell and Git Bash.
- **Alternatives considered**: Keep a shell-script launcher (rejected due to PowerShell incompatibility); provide separate PowerShell and Bash launch scripts (rejected due to duplication and inconsistent behavior).

## Decision 2: Detect shell context with safe fallbacks

- **Decision**: Determine the Windows shell context using environment signals and provide a safe default path when shell detection is ambiguous.
- **Rationale**: Git Bash and PowerShell expose different environment hints; using a defensive fallback avoids blocking launches when detection is uncertain.
- **Alternatives considered**: Require users to set a shell flag (rejected due to added friction); fail fast on unknown shells (rejected due to reduced usability).

## Decision 3: Provide consistent, actionable startup failures

- **Decision**: Normalize startup failures into clear, user-focused messages that explain the issue and next steps.
- **Rationale**: Windows users currently receive ambiguous platform errors; clear guidance reduces support and improves self-serve recovery.
- **Alternatives considered**: Pass through raw errors (rejected due to low clarity); suppress errors silently (rejected due to poor debuggability).
