## MODIFIED Requirements

### Requirement: Interactive hook execution is attributable before input
Before a `tty` hook can read inherited stdin, Arashi SHALL print a human-only attribution banner that identifies the logical lifecycle, scope, source kind, source owner, and applicable workspace or target repository/worktree. File-backed attribution SHALL include the absolute source script path. Inline-config attribution MUST omit a source path and MUST NOT contain, quote, truncate, hash, or otherwise derive snippet text. Configured and standalone hook execution SHALL remain sequential across lifecycle points, scopes, and targets so no two hook processes compete for terminal input.

#### Scenario: Configured repository hook asks a question
- **WHEN** a configured repository-specific file or inline hook starts in `tty` mode
- **THEN** the completed banner identifies its lifecycle, repository scope, source kind/owner, target repository, and target worktree before the child can read stdin
- **AND** a file identifies its absolute path while inline attribution reveals no snippet text

#### Scenario: Workspace hook has no false target
- **WHEN** an untargeted configured workspace hook starts in `tty` mode
- **THEN** the banner identifies the workspace scope and source kind/owner
- **AND** does not borrow a child repository or worktree merely for attribution

#### Scenario: Multiple scopes and targets prompt sequentially
- **WHEN** remove evaluates interactive hooks across multiple scopes or repository targets
- **THEN** each hook exits before the next hook starts
- **AND** each prompt is preceded by attribution for that exact scope and target

### Requirement: Interactive output is immediate and exactly captured
For `tty` execution, Arashi SHALL forward each stdout and stderr chunk to the corresponding parent terminal stream as it arrives without adding prefixes or newlines, while retaining the exact per-stream bytes in the internal `HookResult` capture path. An unterminated prompt MUST be visible before input is supplied. The existing string projection MUST preserve ordinary shell text exactly, including internal blank lines and all trailing newline bytes. Public `LifecycleHookOutcome` schemas may change only by adding the approved `sourceKind`, `sourceOwnerKind`, `sourceOwnerName`, and nullable `sourceScriptPath` semantics; all other fields and reporting behavior SHALL remain unchanged. Non-interactive human execution MAY retain the existing prefixed line renderer, and quiet/JSON execution SHALL remain capture-only.

#### Scenario: Prompt has no trailing newline
- **WHEN** a hook writes a prompt to stdout or stderr without a newline and then reads input
- **THEN** the prompt is visible before the user supplies an answer
- **AND** captured output contains the exact prompt without an added prefix or newline

#### Scenario: Captured newlines are preserved
- **WHEN** an interactive hook emits internal blank lines and multiple trailing newlines
- **THEN** its captured stdout and stderr preserve those sequences exactly
- **AND** terminal streaming does not duplicate or normalize them

#### Scenario: Interactive streams retain their destinations
- **WHEN** an interactive hook writes to both stdout and stderr
- **THEN** stdout bytes are forwarded only to parent stdout and stderr bytes only to parent stderr
- **AND** each captured stream remains exact independently of cross-stream scheduling
