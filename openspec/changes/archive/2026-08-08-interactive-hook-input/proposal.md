## Why

Lifecycle hooks currently receive an unwritten stdin pipe, so native shell input such as Bash `read`, PowerShell `Read-Host`, and cmd `set /p` can hang until the hook timeout. Arashi needs an explicit terminal-aware input contract that enables trusted human workflows while remaining prompt-free and immediate-EOF-safe in JSON, disabled, and non-TTY automation modes.

## What Changes

- Add a first-class lifecycle-hook input policy that inherits terminal stdin only for eligible human TTY invocations and otherwise provides immediate EOF.
- Expose `ARASHI_HOOK_INPUT=tty|disabled|unavailable` to every executed lifecycle hook.
- Add `--no-hook-input` to `create` and `remove` without changing the existing meaning of create's `--interactive` repository-selection option.
- Make `--json` always disable hook input and preserve exactly one JSON document on stdout while leaving public hook-outcome schemas unchanged.
- Announce the hook lifecycle, scope, source, and target before yielding terminal input, then stream interactive stdout/stderr bytes immediately while preserving exact captured output.
- Preserve existing sequential ordering, timeout, failure, rollback, partial-success, dry-run, scope, target multiplicity, and hook-outcome semantics across configured and standalone create/remove.
- Verify native POSIX and Windows shell input through real CLI/PTY or native integration paths, including immediate EOF, unterminated prompts, timeout, interruption, and terminal restoration.
- Update canonical CLI and website documentation, generated command contracts/examples/exports, and packaged skill guidance with semantic drift checks.
- Keep persistent hook-input configuration, declarative prompt schemas, stored answers, GUI-rendered prompts, and a prompt DSL outside this initial capability.

## Capabilities

### New Capabilities

- `interactive-lifecycle-hook-input`: Defines input availability, command policy, attribution, raw streaming, exact capture, interruption, and cross-platform native-shell acceptance behavior for lifecycle hooks.

### Modified Capabilities

- `lifecycle-hook-contracts`: Extends the common executor-owned environment, process, timeout, failure, generated-example, and command-tested contracts with explicit input availability and terminal behavior.
- `machine-readable-cli-output`: Requires JSON create/remove hook execution to use immediate EOF and prevents interactive hook bytes or banners from contaminating the one-document stdout contract.
- `docs-workflow-guidance-sections`: Publishes the canonical input-mode matrix, native-shell examples, option/JSON precedence, and no-secret warning across source and generated guidance.
- `arashi-skill-guidance`: Teaches agents the same invocation-only input contract without implying persisted answers or configuration.
- `cross-repo-command-contracts`: Semantically validates option ownership, mode values, precedence, immediate EOF, and synchronized docs/skill guidance.

## Impact

- `repos/arashi`: lifecycle hook execution, configured/standalone create and remove orchestration, CLI options/types, runtime process wiring, generated CLI command contracts, init examples, and POSIX/Windows integration tests.
- `repos/arashi-docs`: lifecycle-hook configuration and workflow guidance, automation/JSON safety, native shell examples, and security warnings.
- `repos/arashi-skills`: packaged Arashi guidance and generated exports used by agents.
- Meta repository: OpenSpec contracts and cross-repository semantic checkers/fixtures.
- No new prompt DSL or third-party runtime dependency is intended; native shell input remains inside the existing trusted-script and lifecycle timeout boundaries.
