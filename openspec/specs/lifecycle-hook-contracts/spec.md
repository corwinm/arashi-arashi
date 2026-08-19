# lifecycle-hook-contracts Specification

## Purpose
Define lifecycle-hook discovery, ordering, execution context, timeout, failure, rollback, structured outcomes, generated examples, and platform-native behavior across configured and standalone Arashi workflows.
## Requirements
### Requirement: Configured create hooks have deterministic lifecycle points
Configured create SHALL execute active hooks and declarative repository materialization in this order: workspace `pre-create` once before branch, worktree, or materialization mutation; repository-specific `pre-create.<repo>` after that repository's Git worktree is materialized; that repository's configured copy entries in array order and symlink entries in array order; repository-specific `post-create.<repo>` after materialization; and workspace `post-create` once after coordinated Git creation/materialization and before move-changes or switch/launch handling. Workspace hooks SHALL run with the configured workspace root as cwd; repository-specific hooks SHALL run with that repository's new worktree as cwd. Any validation failure, timeout, nonzero create-hook exit, or materialization failure MUST fail create and enter the existing owned rollback boundary. Materialization is declarative worktree construction rather than a hook, so `--no-hooks` MUST NOT disable it.

#### Scenario: Workspace pre-create rejects the operation
- **WHEN** configured workspace `pre-create` fails
- **THEN** Arashi creates no branch, worktree, copy, or link
- **AND** reports the workspace hook failure

#### Scenario: Workspace create hook cwd
- **WHEN** configured workspace `pre-create` or `post-create` executes
- **THEN** its cwd and `ARASHI_HOOK_EXECUTION_PATH` are the configured workspace root

#### Scenario: Repository pre-create runs after Git materialization but before declarative materialization
- **WHEN** `pre-create.<repo>` executes
- **THEN** the repository Git worktree already exists
- **AND** the hook cwd and target worktree context identify that new worktree
- **AND** configured copy and symlink entries have not yet been applied

#### Scenario: Repository post-create observes declarative materialization
- **WHEN** a repository has configured copy or symlink entries and its pre-create boundary succeeds
- **THEN** Arashi applies copy entries then symlink entries before `post-create.<repo>`
- **AND** the post hook can rely on every non-skipped entry having succeeded

#### Scenario: Hooks are disabled but materialization remains enabled
- **WHEN** configured create uses `--no-hooks`
- **THEN** no workspace or repository hook is discovered or executed
- **AND** configured repository copy and symlink materialization still runs at the corresponding construction boundary

#### Scenario: Repository materialization fails
- **WHEN** a copy or symlink entry fails after the repository worktree exists
- **THEN** repository post-create does not run
- **AND** create reports the materialization failure and enters owned rollback

#### Scenario: Repository or workspace post-create fails
- **WHEN** a repository-specific or workspace post-create hook fails after worktrees and materialized entries were created
- **THEN** create exits nonzero and rolls back Git and filesystem objects owned by the invocation
- **AND** reports both the hook failure and any rollback warning

### Requirement: Hook context separates execution, target, and aggregate identity
Every executed lifecycle hook SHALL receive executor-owned `ARASHI_HOOK_NAME`, `ARASHI_HOOK_SCOPE`, `ARASHI_HOOK_EXECUTION_PATH`, `ARASHI_HOOK_WORKSPACE_MODE`, `ARASHI_HOOK_INPUT`, and `ARASHI_MAIN_REPO_PATH` context for its logical hook name, scope, exact absolute execution cwd, `configured`/`standalone` mode, effective `tty`/`disabled`/`unavailable` input mode, and canonical absolute main root. File-backed hooks SHALL additionally receive `ARASHI_HOOK_SOURCE_PATH` as their absolute source path; inline-config hooks MUST omit `ARASHI_HOOK_SOURCE_PATH` and SHALL receive no environment value containing configured snippet text. Targeted invocations SHALL expose explicit `ARASHI_HOOK_TARGET_REPOSITORY`, `ARASHI_HOOK_TARGET_REPO_PATH`, and unambiguous `ARASHI_HOOK_TARGET_WORKTREE_PATH` values plus applicable branch context, and operation data MUST NOT overwrite executor-owned fields. `ARASHI_PARENT_REPO_PATH` SHALL be set only for configured repository-specific create and identify the absolute coordinated parent worktree; all other invocations SHALL omit it. Historical `ARASHI_REPO_NAME`, `ARASHI_REPO_PATH`, and `ARASHI_WORKTREE_PATH` SHALL remain compatibility aliases with the exact mode/scope mapping below. Untargeted configured workspace create MUST omit target fields and `ARASHI_REPO_NAME`, retain workspace root as the historical `ARASHI_REPO_PATH`, and omit worktree aliases.

| Mode and scope | Execution path | Explicit target repo path | Explicit target worktree | `REPO_NAME` | `REPO_PATH` | `WORKTREE_PATH` |
| --- | --- | --- | --- | --- | --- | --- |
| Configured workspace create | workspace root | unset | unset | unset | workspace root | unset |
| Configured repository-specific create | new child worktree | child source checkout | new child worktree | child name | new child worktree | new child worktree |
| Configured remove, any scope, one target | child source checkout except workspace scope uses workspace root | child source checkout | target worktree when exactly one | child name | child source checkout | target worktree when exactly one |
| Standalone global create/remove | standalone main root | standalone main root | lifecycle target worktree when exactly one | main-root basename | standalone main root | lifecycle target worktree when exactly one |

`ARASHI_BRANCH_NAME` SHALL be the requested create branch. Remove SHALL set it only when the current repository invocation has exactly one branch target.

#### Scenario: Repository-specific create hook receives context
- **WHEN** `post-create.<repo>` file or the corresponding repository-owned inline hook runs in configured mode
- **THEN** `ARASHI_HOOK_EXECUTION_PATH` and `ARASHI_HOOK_TARGET_WORKTREE_PATH` identify the new child worktree
- **AND** target repository/source path, `ARASHI_PARENT_REPO_PATH`, `ARASHI_BRANCH_NAME`, scope, source-kind-appropriate attribution, workspace mode, and effective hook-input mode describe that same invocation
- **AND** file attribution includes the absolute source path while inline attribution omits that path and exposes no snippet text

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

#### Scenario: Source path reflects source kind
- **WHEN** a file-backed and an inline-config hook execute in separate non-ambiguous invocations
- **THEN** the file hook receives its absolute `ARASHI_HOOK_SOURCE_PATH`
- **AND** the inline hook omits that variable and receives no snippet-bearing replacement

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

### Requirement: Requested create bases are preflighted before lifecycle hooks

Configured and standalone create SHALL complete configuration validation and strict resolution of every requested explicit or configured base before discovering or executing create hooks and before any create mutation. A removed `defaults.create.baseBranch` property or resolution failure MUST produce no hook outcome that claims execution.

#### Scenario: Configured base is missing before workspace hook

- **WHEN** root, meta, or child `baseBranch` cannot be resolved in a selected repository
- **THEN** Arashi fails before workspace `pre-create` or any repository create hook executes
- **AND** no branch, worktree, managed-ignore, setup, or launch mutation occurs

#### Scenario: Removed legacy property is rejected before hook discovery

- **WHEN** configured create reads `defaults.create.baseBranch`
- **THEN** configuration validation fails with canonical migration guidance before hook discovery or execution
- **AND** no branch, worktree, managed-ignore, setup, or launch mutation occurs

#### Scenario: Standalone explicit base is missing before global hook

- **WHEN** standalone create receives `--base` that cannot be resolved
- **THEN** Arashi fails before user-global `pre-create` executes
- **AND** no standalone destination or branch is created

#### Scenario: Hook context remains target-oriented

- **WHEN** any create hook executes after successful base preflight
- **THEN** `ARASHI_BRANCH_NAME` remains the requested target branch
- **AND** Arashi does not introduce or advertise `ARASHI_BASE_BRANCH`

### Requirement: Configured create inline sources preserve exact lifecycle parity
Configured create SHALL resolve root inline workspace hooks and repository-owned inline create hooks into the same existing orchestration locations as their file alternatives. Workspace `pre-create` SHALL run once before branch or worktree mutation; each repository `pre-create` SHALL run after that repository worktree is materialized and immediately before its `post-create`; workspace `post-create` SHALL run once after coordinated Git creation and before move-changes or switch/launch handling. Workspace cwd, repository worktree cwd, selected-repository order, failure reporting, and owned Git rollback SHALL be identical for inline and file sources.

#### Scenario: All configured create inline fields execute
- **WHEN** root and repository configuration define `pre-create` and `post-create` inline hooks without ambiguity
- **THEN** each executes exactly once at the established workspace or repository boundary
- **AND** observed cwd, context, and order match file-backed configured create

#### Scenario: Inline workspace pre-create fails
- **WHEN** inline workspace `pre-create` exits nonzero, times out, or fails preflight
- **THEN** create performs no branch or worktree mutation
- **AND** reports the same classified failure and ledger behavior as a file source

#### Scenario: Inline post-create fails
- **WHEN** inline repository or workspace post-create fails after worktree creation
- **THEN** create enters the existing owned Git rollback boundary
- **AND** preserves the hook failure and rollback warnings in human and JSON results

### Requirement: Inline execution uses the source-neutral process contract
Inline Bash SHALL execute as `bash -c <snippet>`, inline PowerShell as system `powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -Command <snippet>`, and inline cmd as the hardened `cmd.exe /d /e:on /v:off /s /c <snippet>` production adapter. Snippet payload, cwd, and environment SHALL be passed as distinct subprocess inputs rather than concatenating paths or environment values into executable command text. The existing timeout, TTY/immediate-EOF input, sequential attribution, output capture, quiet, JSON isolation, exit, timeout, signal, and cleanup behavior SHALL apply unchanged.

#### Scenario: Inline hook reads eligible input
- **WHEN** a human TTY invocation executes a Bash, PowerShell, or cmd inline hook that reads stdin
- **THEN** it receives the same attributed inherited input and `ARASHI_HOOK_INPUT=tty` behavior as the equivalent file hook

#### Scenario: Input is disabled or unavailable
- **WHEN** `--no-hook-input`, JSON mode, or a non-TTY parent makes input disabled or unavailable
- **THEN** the inline process receives immediate EOF and the exact effective input metadata
- **AND** it does not wait for an unwritten stdin pipe

#### Scenario: Native metacharacters remain payload
- **WHEN** cwd or target paths contain spaces and shell metacharacters and the inline payload uses native `%`, `!`, `&`, or parentheses syntax
- **THEN** the production adapter executes the configured payload once in the exact cwd
- **AND** does not evaluate path/environment content as a second command

### Requirement: Hook disabling and timeout behavior are source-neutral
A valid configuration containing inline hooks SHALL obey the existing `--no-hooks` and `hooks.timeout` contracts. `--no-hooks` SHALL prevent inline/file discovery, interpreter preflight, and execution after configuration validation and SHALL preserve existing disabled outcome/preview behavior. The configured timeout default and valid override SHALL apply to inline and file sources equally, including time waiting for terminal input.

#### Scenario: Hooks are disabled
- **WHEN** configured create is invoked with `--no-hooks`
- **THEN** no inline or file hook is discovered, preflighted, or executed
- **AND** create otherwise follows its existing no-hooks behavior

#### Scenario: Inline hook times out
- **WHEN** an inline hook exceeds the effective timeout
- **THEN** its result is classified as `timeout`
- **AND** create rollback and human/JSON reporting match the file-hook timeout contract

### Requirement: Native integration and file-only compatibility are acceptance gates
The CLI repository SHALL exercise configured inline create through the real built CLI on native POSIX and Windows CI. Tests SHALL activate all four workspace and repository lifecycle configuration fields across create/remove acceptance, SHALL execute Bash on POSIX and PowerShell and cmd on Windows through production subprocess adapters, and SHALL include spaces and shell metacharacters. Existing file-only configured and standalone lifecycle fixtures MUST continue to pass without inline configuration or changed observable behavior.

#### Scenario: Native platform matrix runs
- **WHEN** lifecycle acceptance runs on POSIX and Windows
- **THEN** native jobs prove selected interpreter, lifecycle timing, cwd, input, timeout, failure, and no-disclosure behavior through real processes
- **AND** platform injection alone is not the only Windows evidence

#### Scenario: Existing file-only workspace runs
- **WHEN** a valid workspace contains only native hook files and no inline fields
- **THEN** create/remove discovery, execution, outcomes, doctor, and dry-run behavior remain backward-compatible
