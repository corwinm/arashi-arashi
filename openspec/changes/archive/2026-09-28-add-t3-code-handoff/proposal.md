## Why

Arashi can create the exact coordinated checkout needed for a feature, but users currently have to copy that path into a separate T3 Code command and manually reconstruct the task. An optional, explicit handoff closes that gap while keeping the initiating conversation in its original workspace and avoiding host-UI assumptions that do not work for mobile clients.

## What Changes

- Add an optional `aw create <branch> --t3 [task]` integration, with `--prompt-file` as the alternative prompt source and strict pre-mutation validation.
- Add `--permission` with the bridge-compatible values `approval-required`, `auto-accept-edits`, and `full-access`; default to and explicitly pass `full-access`.
- Dispatch the task to the exact created parent checkout through an installed, compatible `@bvdm/t3code-cli`, using the current checkout and no UI opening.
- Make T3 handoff take deterministic precedence over configured terminal/editor launch defaults without making T3 a dependency of ordinary Arashi commands.
- Report workspace creation, project/thread creation, prompt dispatch, and UI outcome separately in human and JSON output.
- Preserve successfully created workspaces on handoff failure and retain a private receipt that permits safe retry after definite failure while stopping duplicate dispatch after success or an indeterminate interruption.
- Document supported bridge expectations, desktop/mobile navigation, recovery, and self-contained prompt preparation in canonical docs and packaged skill guidance.

## Capabilities

### New Capabilities

- `t3-code-workspace-handoff`: Optional T3 Code dispatch from an exact Arashi-created parent workspace, including input validation, adapter compatibility, outcome reporting, and safe retry behavior.

### Modified Capabilities

- `create-command-defaults`: Define explicit T3 handoff precedence over existing post-create switch and terminal/editor launch defaults.
- `machine-readable-cli-output`: Extend create JSON results with distinct, credential-safe handoff stages and effective permission mode.
- `arashi-skill-guidance`: Teach agents to prepare self-contained handoff prompts, invoke the supported workflow, and report where the new task is running.

## Impact

- `repos/arashi`: create command options, isolated T3 adapter and receipt persistence, human/JSON results, completion/contract metadata, and cross-platform tests.
- `repos/arashi-docs`: create command and agent workflow documentation, dependency/version expectations, recovery, and desktop/mobile behavior.
- `repos/arashi-skills`: focused workflow/command guidance and packaged guidance validation.
- `arashi-arashi`: OpenSpec artifacts and cross-repository contract validation. No initial VS Code UI or configuration schema change is required.
- External integration: installed `@bvdm/t3code-cli` compatible with the documented 0.1.x contract; Arashi never downloads it implicitly.
