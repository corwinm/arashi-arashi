# lifecycle-hook-contracts Specification

## Purpose
Define lifecycle-hook discovery, ordering, execution context, timeout, failure, rollback, structured outcomes, generated examples, and platform-native behavior across configured and standalone Arashi workflows.

## Requirements
### Requirement: Configured create hooks have deterministic lifecycle points
Configured create SHALL execute active hooks in this order: workspace `pre-create` once before branch or worktree mutation; repository-specific `pre-create.<repo>` after that repository's worktree is materialized; repository-specific `post-create.<repo>` after its pre hook; and workspace `post-create` once after coordinated Git creation and before move-changes or switch/launch handling. Workspace hooks SHALL run with the configured workspace root as cwd; repository-specific hooks SHALL run with that repository's new worktree as cwd. Any validation failure, timeout, or nonzero create-hook exit MUST fail create and enter the existing owned Git rollback boundary.

#### Scenario: Workspace pre-create rejects the operation
- **WHEN** configured workspace `pre-create` fails
- **THEN** Arashi creates no branch or worktree
- **AND** reports the workspace hook failure

#### Scenario: Workspace create hook cwd
- **WHEN** configured workspace `pre-create` or `post-create` executes
- **THEN** its cwd and `ARASHI_HOOK_EXECUTION_PATH` are the configured workspace root

#### Scenario: Repository pre-create runs after materialization
- **WHEN** `pre-create.<repo>` executes
- **THEN** the repository worktree already exists
- **AND** the hook cwd and target worktree context identify that new worktree

#### Scenario: Repository or workspace post-create fails
- **WHEN** a repository-specific or workspace post-create hook fails after worktrees were created
- **THEN** create exits nonzero and rolls back Git mutations owned by the invocation
- **AND** reports both the hook failure and any rollback warning

### Requirement: Hook context separates execution, target, and aggregate identity
Every executed lifecycle hook SHALL receive executor-owned `ARASHI_HOOK_NAME`, `ARASHI_HOOK_SCOPE`, `ARASHI_HOOK_SOURCE_PATH`, `ARASHI_HOOK_EXECUTION_PATH`, `ARASHI_HOOK_WORKSPACE_MODE`, and `ARASHI_MAIN_REPO_PATH` context for its logical hook name, scope, absolute source path, exact absolute execution cwd, `configured`/`standalone` mode, and canonical absolute main root. Targeted invocations SHALL expose explicit `ARASHI_HOOK_TARGET_REPOSITORY`, `ARASHI_HOOK_TARGET_REPO_PATH`, and unambiguous `ARASHI_HOOK_TARGET_WORKTREE_PATH` values plus applicable branch context, and operation data MUST NOT overwrite executor-owned fields. `ARASHI_PARENT_REPO_PATH` SHALL be set only for configured repository-specific create and identify the absolute coordinated parent worktree; all other invocations SHALL omit it. Historical `ARASHI_REPO_NAME`, `ARASHI_REPO_PATH`, and `ARASHI_WORKTREE_PATH` SHALL remain compatibility aliases with the exact mode/scope mapping below. Untargeted configured workspace create MUST omit target fields and `ARASHI_REPO_NAME`, retain workspace root as the historical `ARASHI_REPO_PATH`, and omit worktree aliases.

| Mode and scope | Execution path | Explicit target repo path | Explicit target worktree | `REPO_NAME` | `REPO_PATH` | `WORKTREE_PATH` |
| --- | --- | --- | --- | --- | --- | --- |
| Configured workspace create | workspace root | unset | unset | unset | workspace root | unset |
| Configured repository-specific create | new child worktree | child source checkout | new child worktree | child name | new child worktree | new child worktree |
| Configured remove, any scope, one target | child source checkout except workspace scope uses workspace root | child source checkout | target worktree when exactly one | child name | child source checkout | target worktree when exactly one |
| Standalone global create/remove | standalone main root | standalone main root | lifecycle target worktree when exactly one | main-root basename | standalone main root | lifecycle target worktree when exactly one |

`ARASHI_BRANCH_NAME` SHALL be the requested create branch. Remove SHALL set it only when the current repository invocation has exactly one branch target.

#### Scenario: Repository-specific create hook receives context
- **WHEN** `post-create.<repo>` runs in configured mode
- **THEN** `ARASHI_HOOK_EXECUTION_PATH` and `ARASHI_HOOK_TARGET_WORKTREE_PATH` identify the new child worktree
- **AND** target repository/source path, `ARASHI_PARENT_REPO_PATH`, `ARASHI_BRANCH_NAME`, scope, source, and workspace mode describe that same invocation

#### Scenario: Workspace create hook has no false target
- **WHEN** workspace `pre-create` or `post-create` runs without one repository target
- **THEN** workspace and branch context are populated
- **AND** explicit target fields, `ARASHI_REPO_NAME`, and worktree aliases are omitted rather than borrowed from one child
- **AND** compatibility `ARASHI_REPO_PATH` identifies the workspace root

#### Scenario: Compatibility path alias is consumed
- **WHEN** an existing hook reads `ARASHI_REPO_PATH` or `ARASHI_WORKTREE_PATH`
- **THEN** Arashi preserves the documented lifecycle-specific compatibility value for this change
- **AND** new guidance directs portable scripts to explicit execution and target fields

#### Scenario: Stale branch aliases are absent from recommendations
- **WHEN** Arashi generates or publishes create-hook guidance
- **THEN** it uses `ARASHI_BRANCH_NAME`
- **AND** does not claim runtime support for `ARASHI_BRANCH` or `ARASHI_BASE_BRANCH`

### Requirement: Lifecycle script discovery is platform-native and fail-closed
Arashi SHALL discover `.sh` lifecycle scripts on POSIX and case-insensitive `.ps1`, `.cmd`, or `.bat` lifecycle scripts on Windows. Discovery and interpreter availability MUST be preflighted before lifecycle mutation. Windows PowerShell scripts SHALL execute with system `powershell.exe -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -File <absolute-script-path>` with the path as its own process argument; this contract SHALL NOT fall back to `pwsh`. Windows command scripts SHALL execute with system `cmd.exe /d /e:on /v:off /s /c call <encoded-absolute-script-path>`, where one tested Windows-command-line escaping helper encodes the absolute path without concatenating environment values or user arguments. If multiple supported candidates exist for one scope and logical lifecycle, discovery MUST fail and identify every conflicting path. Missing interpreters or an unsafe/unrepresentable command path MUST fail validation as `interpreter_unavailable` before mutation.

#### Scenario: POSIX script is discovered
- **WHEN** a POSIX lifecycle location contains exactly `<lifecycle>.sh`
- **THEN** Arashi validates and executes that script with the configured shell contract

#### Scenario: Native Windows script is discovered
- **WHEN** a Windows lifecycle location contains exactly one supported PowerShell or command script
- **THEN** Arashi invokes it through the matching native interpreter
- **AND** delivers the same lifecycle context and failure semantics as POSIX

#### Scenario: Windows script path contains shell metacharacters
- **WHEN** a native lifecycle script path contains spaces, `%`, `!`, `&`, or parentheses
- **THEN** Arashi passes the exact absolute path to the matching interpreter without evaluating path content as a second command

#### Scenario: Windows interpreter is unavailable
- **WHEN** the required system interpreter cannot be resolved during lifecycle preflight
- **THEN** Arashi reports `interpreter_unavailable` before branch, worktree, or removal mutation

#### Scenario: Multiple native scripts conflict
- **WHEN** one lifecycle location contains multiple extensions supported by the current platform
- **THEN** Arashi exits before mutation with an actionable ambiguity error
- **AND** does not select by extension or filesystem order

#### Scenario: Windows contains only a shell script
- **WHEN** a Windows lifecycle location contains only `<lifecycle>.sh`
- **THEN** Arashi does not execute it through an implicit Git Bash dependency
- **AND** reports or documents the native activation requirement

### Requirement: Init generates inert scope-correct examples and valid activation guidance
Configured `arashi init` SHALL generate non-active examples whose filenames, comments, variables, cwd assumptions, failure claims, and platform syntax match the runtime contract. Human next steps SHALL activate one example at a time and establish required executable permissions without activating all examples implicitly.

#### Scenario: Workspace create examples are generated
- **WHEN** configured init generates workspace create examples
- **THEN** they use only workspace-level context available to one workspace invocation
- **AND** do not require a repository-specific worktree path

#### Scenario: Repository create example is activated on POSIX
- **WHEN** a user follows the printed repository-specific activation command
- **THEN** exactly one example becomes the requested hook filename with executable mode
- **AND** the generated command is valid when copied verbatim

#### Scenario: Setup example is generated
- **WHEN** configured init generates setup guidance on POSIX
- **THEN** the example is placed at `.arashi/setup.sh.example`
- **AND** describes setup cwd without promising lifecycle-hook variables or changing Git `core.hooksPath`

#### Scenario: Windows init handles the unsupported setup example honestly
- **WHEN** configured init runs on Windows
- **THEN** it does not generate or recommend a PowerShell setup example that normal setup discovery cannot find
- **AND** existing setup discovery behavior and precedence remain unchanged

#### Scenario: Windows examples are generated
- **WHEN** configured init runs on Windows
- **THEN** generated lifecycle examples and activation guidance use supported native extensions and commands
- **AND** remain inactive until explicitly copied

### Requirement: Lifecycle hooks share one timeout contract
Configured create, configured remove, and standalone lifecycle hooks SHALL use a default timeout of `300000` milliseconds. A configured `hooks.timeout` integer from 1 through 2147483647 milliseconds SHALL override that default for every configured lifecycle hook. Zero, negative, fractional, non-numeric, or out-of-range values MUST fail schema/configuration validation before hook discovery or lifecycle mutation and use the canonical structured configuration error in JSON mode.

#### Scenario: No timeout override exists
- **WHEN** any lifecycle hook runs without a configured timeout
- **THEN** the effective timeout is 300000 milliseconds

#### Scenario: Timeout override exists
- **WHEN** configured hooks set a valid `hooks.timeout`
- **THEN** workspace, repository, and user-global hooks in that configured lifecycle use the same override

#### Scenario: Hook times out
- **WHEN** a lifecycle hook exceeds its effective timeout
- **THEN** the outcome identifies timeout rather than a generic exit failure
- **AND** lifecycle failure and rollback/finalization follow the applicable command contract

#### Scenario: Hook timeout configuration is invalid
- **WHEN** configured `hooks.timeout` is zero, negative, fractional, non-numeric, or greater than 2147483647
- **THEN** configuration validation fails before hook discovery or lifecycle mutation
- **AND** JSON mode emits the canonical structured configuration failure envelope

### Requirement: Configured create reports a complete hook outcome ledger
Configured create SHALL record workspace and repository-specific hook skips, successes, validation failures, timeouts, and nonzero exits in one deterministic outcome ledger used by human and JSON results.

#### Scenario: Workspace and repository hooks succeed
- **WHEN** configured create runs active workspace and repository-specific hooks successfully
- **THEN** its result includes an ordered outcome for every evaluated hook location

#### Scenario: Workspace hook fails
- **WHEN** a workspace create hook fails
- **THEN** failure output identifies its logical name, scope, source, status, and available diagnostics
- **AND** recovery guidance is derived from the same ledger

### Requirement: Generated template behavior is command-tested
Arashi SHALL test init-generated hook examples and activation instructions through real temporary configured command workflows rather than validating only file existence or manually injected operation keys. Standalone user-global examples are documentation-authored, not init-generated, and SHALL be exercised separately through temporary documented global-hook workflows.

#### Scenario: Generated pre-create is activated
- **WHEN** an integration test activates the generated pre-create example and runs create
- **THEN** the test proves its branch context, timing, executable activation, and failure boundary against production orchestration

#### Scenario: Generated post-create fails
- **WHEN** an activated generated post-create derivative exits nonzero
- **THEN** the command-level test observes create failure and rollback
- **AND** no test claims continuation by setting an unrelated sentinel value

#### Scenario: Documented standalone global example is activated
- **WHEN** an integration test activates the documented standalone targeted/shared global example in an isolated home directory
- **THEN** standalone create/remove exercises the documented path, native extension, context, and cleanup contract
- **AND** the test does not claim that `arashi init` generated the example

