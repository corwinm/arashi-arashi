## MODIFIED Requirements

### Requirement: Hook context separates execution, target, and aggregate identity
Every executed lifecycle hook SHALL receive executor-owned `ARASHI_HOOK_NAME`, `ARASHI_HOOK_SCOPE`, `ARASHI_HOOK_SOURCE_PATH`, `ARASHI_HOOK_EXECUTION_PATH`, `ARASHI_HOOK_WORKSPACE_MODE`, `ARASHI_HOOK_INPUT`, and `ARASHI_MAIN_REPO_PATH` context for its logical hook name, scope, absolute source path, exact absolute execution cwd, `configured`/`standalone` mode, effective `tty`/`disabled`/`unavailable` input mode, and canonical absolute main root. Targeted invocations SHALL expose explicit `ARASHI_HOOK_TARGET_REPOSITORY`, `ARASHI_HOOK_TARGET_REPO_PATH`, and unambiguous `ARASHI_HOOK_TARGET_WORKTREE_PATH` values plus applicable branch context, and operation data MUST NOT overwrite executor-owned fields. `ARASHI_PARENT_REPO_PATH` SHALL be set only for configured repository-specific create and identify the absolute coordinated parent worktree; all other invocations SHALL omit it. Historical `ARASHI_REPO_NAME`, `ARASHI_REPO_PATH`, and `ARASHI_WORKTREE_PATH` SHALL remain compatibility aliases with the exact mode/scope mapping below. Untargeted configured workspace create MUST omit target fields and `ARASHI_REPO_NAME`, retain workspace root as the historical `ARASHI_REPO_PATH`, and omit worktree aliases.

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
- **AND** target repository/source path, `ARASHI_PARENT_REPO_PATH`, `ARASHI_BRANCH_NAME`, scope, source, workspace mode, and effective hook-input mode describe that same invocation

#### Scenario: Workspace create hook has no false target
- **WHEN** workspace `pre-create` or `post-create` runs without one repository target
- **THEN** workspace, branch, and effective hook-input context are populated
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

#### Scenario: Hook input metadata cannot be overwritten
- **WHEN** caller operation data contains `HOOK_INPUT` or `ARASHI_HOOK_INPUT`
- **THEN** the executor-owned effective input mode remains authoritative
- **AND** every executed configured or standalone hook receives exactly one documented value

### Requirement: Lifecycle script discovery is platform-native and fail-closed
Arashi SHALL discover `.sh` lifecycle scripts on POSIX and case-insensitive `.ps1`, `.cmd`, or `.bat` lifecycle scripts on Windows. Discovery and interpreter availability MUST be preflighted before lifecycle mutation. Windows PowerShell scripts in every input mode SHALL execute with system `powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File <absolute-script-path>`; `tty` mode SHALL inherit stdin, while `disabled` and `unavailable` modes SHALL receive immediate-EOF stdin. All forms SHALL pass the path as its own process argument and SHALL NOT fall back to `pwsh`. Windows command scripts SHALL execute with system `cmd.exe /d /e:on /v:off /s /c call <encoded-absolute-script-path>`, where one tested Windows-command-line escaping helper encodes the absolute path without concatenating environment values or user arguments; stdin SHALL be inherited only in `tty` mode and otherwise provide immediate EOF. If multiple supported candidates exist for one scope and logical lifecycle, discovery MUST fail and identify every conflicting path. Missing interpreters or an unsafe/unrepresentable command path MUST fail validation as `interpreter_unavailable` before mutation.

#### Scenario: POSIX script is discovered
- **WHEN** a POSIX lifecycle location contains exactly `<lifecycle>.sh`
- **THEN** Arashi validates and executes that script with the configured shell and input contract

#### Scenario: Native Windows script is discovered
- **WHEN** a Windows lifecycle location contains exactly one supported PowerShell or command script
- **THEN** Arashi invokes it through the matching native interpreter
- **AND** delivers the same lifecycle context, effective input mode, and failure semantics as POSIX

#### Scenario: Interactive PowerShell hook is eligible
- **WHEN** a PowerShell lifecycle hook executes with effective input mode `tty`
- **THEN** Arashi omits `-NonInteractive` and inherits terminal stdin
- **AND** `Read-Host` can receive native user input

#### Scenario: PowerShell hook input is unavailable or disabled
- **WHEN** a PowerShell lifecycle hook executes with effective input mode `disabled` or `unavailable`
- **THEN** Arashi omits `-NonInteractive` and uses immediate-EOF stdin
- **AND** `Read-Host` observes EOF instead of waiting on an unwritten pipe

#### Scenario: Windows script path contains shell metacharacters
- **WHEN** a native lifecycle script path contains spaces, `%`, `!`, `&`, or parentheses
- **THEN** Arashi passes the exact absolute path to the matching interpreter without evaluating path content as a second command

#### Scenario: Current cmd runtime is reconciled before native input ships
- **WHEN** implementation tests compare the runtime command with the canonical cmd invocation
- **THEN** `/s`, `call`, and the encoded-path helper are all present before interactive cmd acceptance is considered complete

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
Configured `arashi init` SHALL generate non-active examples whose filenames, comments, variables, cwd assumptions, failure claims, platform syntax, and hook-input behavior match the runtime contract. Input-capable examples SHALL check `ARASHI_HOOK_INPUT` before invoking Bash `read`, PowerShell `Read-Host`, or cmd `set /p`, SHALL explain immediate EOF outside `tty` mode, and SHALL warn against entering secrets. Human next steps SHALL activate one example at a time and establish required executable permissions without activating all examples implicitly.

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

#### Scenario: Generated example demonstrates native hook input safely
- **WHEN** init generates an input-capable lifecycle example for the current platform
- **THEN** the inert example checks for `ARASHI_HOOK_INPUT=tty` before using the native read primitive
- **AND** documents immediate EOF, invocation-only disablement, and the no-secrets rule without inventing persisted answers

### Requirement: Generated template behavior is command-tested
Arashi SHALL test init-generated hook examples and activation instructions through real temporary configured command workflows rather than validating only file existence or manually injected operation keys. Input-capable Bash, PowerShell, and cmd derivatives SHALL be activated and exercised through the real built CLI with eligible terminal input and with disabled or unavailable immediate EOF. Standalone user-global examples are documentation-authored, not init-generated, and SHALL be exercised separately through temporary documented global-hook workflows.

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

#### Scenario: Activated input example reads and receives EOF
- **WHEN** command tests activate the generated native input example
- **THEN** a terminal-capable run proves the native read receives an answer
- **AND** disabled and unavailable runs prove immediate EOF without waiting for timeout

### Requirement: Lifecycle hooks share one timeout contract
Configured create, configured remove, and standalone lifecycle hooks SHALL use a default timeout of `300000` milliseconds. A configured `hooks.timeout` integer from 1 through 2147483647 milliseconds SHALL override that default for every configured lifecycle hook. The timeout SHALL include all time spent waiting for inherited terminal input. Zero, negative, fractional, non-numeric, or out-of-range values MUST fail schema/configuration validation before hook discovery or lifecycle mutation and use the canonical structured configuration error in JSON mode.

#### Scenario: No timeout override exists
- **WHEN** any lifecycle hook runs without a configured timeout
- **THEN** the effective timeout is 300000 milliseconds

#### Scenario: Timeout override exists
- **WHEN** configured hooks set a valid `hooks.timeout`
- **THEN** workspace, repository, and user-global hooks in that configured lifecycle use the same override

#### Scenario: Hook times out
- **WHEN** a lifecycle hook exceeds its effective timeout while executing or waiting for input
- **THEN** the outcome identifies timeout rather than a generic exit failure
- **AND** lifecycle failure and rollback/finalization follow the applicable command contract

#### Scenario: Hook timeout configuration is invalid
- **WHEN** configured `hooks.timeout` is zero, negative, fractional, non-numeric, or greater than 2147483647
- **THEN** configuration validation fails before hook discovery or lifecycle mutation
- **AND** JSON mode emits the canonical structured configuration failure envelope
