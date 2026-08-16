## MODIFIED Requirements

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

## ADDED Requirements

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
