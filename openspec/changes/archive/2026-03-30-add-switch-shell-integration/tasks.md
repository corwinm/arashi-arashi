## 1. Shell integration commands and wrapper generation

- [x] 1.1 Add `arashi shell init <shell>` command plumbing in `repos/arashi` and generate wrapper output for the supported shells.
- [x] 1.2 Add `arashi shell install` logic that detects supported shell startup files and writes or updates an Arashi-managed initialization block.
- [x] 1.3 Add tests for supported and unsupported `shell init` cases plus installer success and actionable failure paths.

## 2. Directive runtime and switch mode resolution

- [x] 2.1 Add a shared directive-file utility that writes safely escaped `cd` directives and strips `ARASHI_DIRECTIVE_FILE` from descendant process environments.
- [x] 2.2 Extend switch configuration and CLI parsing to resolve `launch`, `cd`, and `auto` modes with explicit `--cd` and `--no-cd` overrides.
- [x] 2.3 Update `arashi switch` execution to emit directory-change directives when integration is active and to preserve existing launch or sesh behavior when launch mode is selected.
- [x] 2.4 Add actionable warnings for invocations that request `cd` behavior without active shell integration or when the wrapper path is bypassed.

## 3. Regression coverage for switch and safety behavior

- [x] 3.1 Add unit tests for switch mode precedence, directive escaping, and environment scrubbing.
- [x] 3.2 Add integration tests covering wrapped `switch --cd`, `auto` fallback to launch behavior, and explicit `--sesh` behavior when shell integration is installed.
- [x] 3.3 Add regression tests that verify hooks and launcher subprocesses do not inherit `ARASHI_DIRECTIVE_FILE`.

## 4. Documentation and skills synchronization

- [x] 4.1 Update `repos/arashi` docs and README content for `arashi shell init`, `arashi shell install`, switch mode defaults, and `--cd` or `--no-cd` usage.
- [x] 4.2 Update `repos/arashi-docs` with shell integration setup, examples, fallback diagnostics, and switch mode guidance.
- [x] 4.3 Update `repos/arashi-skills` guidance so automation workflows and command examples reflect the new shell integration behavior.

## 5. Validation

- [x] 5.1 Run `bun run lint` in `repos/arashi` and fix any failures.
- [x] 5.2 Run `bun test` in `repos/arashi` and fix failing tests.
- [x] 5.3 Run `bun run build` in `repos/arashi` to validate the distributable output.
- [x] 5.4 Manually verify shell integration setup and `arashi switch` behavior in at least one supported shell with both integrated and non-integrated invocation paths.
