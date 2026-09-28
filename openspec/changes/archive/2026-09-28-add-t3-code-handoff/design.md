## Context

`aw create` already owns repository selection, hook execution, coordinated worktree creation, rollback, exact destination paths, post-create launch, and JSON reporting. T3 Code owns project/thread creation and agent execution. The published community bridge `@bvdm/t3code-cli` 0.1.2 exposes the required `handover` contract and stable JSON output, requires Node.js 22.16 or newer, and is intentionally installed separately. Its packaged `--version` currently reports `0.1.0`, so compatibility must use the reported 0.1.x contract rather than assume the npm package metadata is available at runtime.

The handoff crosses a mutation boundary: Arashi can know that workspace creation completed, but an interrupted bridge process may have created a project/thread before Arashi receives its response. Retrying such an invocation blindly would create a second thread.

## Goals / Non-Goals

**Goals:**

- Validate all user-controlled handoff inputs before Git, hooks, managed-ignore, or worktree mutation.
- Dispatch only to the exact successful parent worktree and never ask T3 to create another checkout.
- Keep the bridge optional, installed explicitly, version-checked, argv-safe, and replaceable.
- Default to no host UI, explicitly pass full-access unless overridden, and return distinct stage outcomes.
- Preserve created workspaces after post-create handoff failures and make retries safe against duplicate threads.
- Keep ordinary create, standalone, launch, and VS Code behavior unchanged when `--t3` is absent.

**Non-Goals:**

- Moving or copying the initiating conversation, scraping chat history, monitoring agent completion, or deleting workspaces/threads.
- A T3 plugin/SDK abstraction, new VS Code UI, automatic desktop/mobile navigation, or environment provisioning/pairing.
- Claiming Windows, Linux, or mobile end-to-end validation without running it.

## Decisions

### Compose an isolated adapter after coordinated create

Add a small `lib/t3-handoff` boundary that accepts only the exact parent worktree, validated prompt source, effective permission, and injectable process/filesystem dependencies. `create` calls it only after all requested worktrees and required setup complete successfully. It invokes an installed `t3code` executable with an argv array:

```text
t3code --json handover
--cwd <exact-parent-worktree>
--workspace-mode folder
--project-policy create
--checkout current
  --open none
  --permission <effective-mode>
  --prompt-file <validated-file>
```

`--workspace-mode folder` prevents the bridge from walking to a different Git root. `--checkout current` prevents T3 worktree creation. Inline prompts are staged in a private temporary file so multiline content and platform command-length/quoting rules do not leak into argv; the file is removed in `finally`. User prompt files are read before mutation to prove readability and non-whitespace content, then their validated bytes are staged the same way to close the validation/use race.

Alternatives rejected: embedding bridge code would duplicate authentication/orchestration; an implicit `npx ...@latest` would download moving code during every invocation; shell command strings would be unsafe and non-portable.

### Treat the bridge as an explicit optional prerequisite

Before workspace mutation, the adapter resolves `t3code` from `PATH`, runs `t3code --version`, and accepts the documented reported 0.1.x contract (including the published 0.1.2 package's known `0.1.0` embedded-version quirk). Missing executables, malformed output, or versions outside that compatibility line fail with installation/pinning guidance. Arashi does not add an npm runtime dependency or invoke a package runner.

Canonical installation guidance pins the evaluated package version (`npm install --global @bvdm/t3code-cli@0.1.2`) and documents Node.js 22.16+ plus the supported reported 0.1.x line. Compatibility can be expanded only with tests for the newer response contract.

### Make prompt and permission validation a pre-mutation gate

Commander exposes `--t3 [task]`, `--prompt-file <path>`, and `--permission <mode>`. A handoff requires `--t3` and exactly one nonempty source: the optional inline value or `--prompt-file`. `--prompt-file` without `--t3`, both sources, omitted values, whitespace-only values/files, unreadable files, and invalid permission values fail before repository discovery that can mutate state. Permission defaults to `full-access` and is always present in adapter argv and results.

No T3 configuration is added in this change. This keeps precedence explicit flag → built-in `full-access` and avoids expanding workspace schema before a durable configuration need exists.

### T3 replaces implicit post-create launch defaults

An explicit T3 handoff suppresses configured post-create switch/terminal/editor launch defaults. Explicit existing create launch/switch flags are rejected with T3 as conflicting intents in the initial interface, rather than silently ignored or producing a second context. JSON mode is supported because the bridge is run synchronously and its selected result is incorporated into Arashi's one-document envelope. Dry-run validates inputs/tooling and reports a handoff plan without invoking the bridge or writing a receipt.

### Persist a minimal private receipt before dispatch

Store one receipt per canonical parent-workspace path beneath the parent repository's Git common directory, not in the worktree. The file name is the SHA-256 of the canonical path. Persist with owner-only permissions and atomic replacement. An owner-only adjacent lock file serializes receipt inspection, state transition, and bridge dispatch so simultaneous create processes cannot both pass the duplicate check. A killed process may leave that lock in place; this intentionally fails closed until the user reconciles T3 state. The receipt contains schema version, workspace path, branch, prompt digest (never prompt text), effective permission, bridge version, timestamps, status, and sanitized environment/project/thread/opening identifiers when available.

Statuses are:

- `dispatching`: written immediately before spawning the bridge.
- `succeeded`: valid success JSON captured; blocks duplicate create handoff.
- `failed`: the adapter proves dispatch did not start (spawn failure) or receives a recognized pre-dispatch bridge failure; safe retry may replace it.
- `indeterminate`: interruption, malformed response, or an unclassified nonzero result after spawn; blocks automatic retry and directs the user to reconcile the exact project/thread in T3 first.

A subsequent `aw create <same-branch> --conflict REUSE_EXISTING --t3 ...` targets the same exact parent workspace. It may retry only a matching `failed` receipt. A matching `succeeded`, `dispatching`, or `indeterminate` receipt stops before bridge dispatch with identifiers and reconciliation guidance. A different prompt digest or permission is treated as a new intent only after explicit receipt resolution; the initial implementation does not add a force-duplicate switch. When reconciliation proves no thread exists, guidance permits manual removal of only the reported receipt and adjacent lock before retrying.

### Sanitize and normalize the bridge result

Parse only `{ok,data}` / `{ok,error}` from bridge output and copy an allowlist into Arashi results: bridge version, environment ID/server version, workspace root, project ID/created flag, thread ID, effective permission, dispatch status, and UI mode/kind/exact-thread flag. Omit project/thread titles because the thread title is derived from the prompt; also omit authentication material, URLs, raw commands, prompt/message text, provider options, stdout, and stderr. Human output gives the exact workspace, project/thread identifiers, effective permission, no-UI result, and manual desktop/mobile selection guidance.

Create exit behavior distinguishes workspace failure from handoff failure. A handoff failure returns nonzero with the successful creation details and receipt/retry guidance; it never rolls back the workspace. UI opening is always `none` in this interface, but remains its own successful/skipped stage so future explicit UI support cannot redefine dispatch success.

## Risks / Trade-offs

- **Bridge 0.1.x is community-maintained and its response can drift** → Pin the evaluated install, require a compatible reported line, parse an allowlist, and fail closed on malformed responses.
- **A killed process can leave an already-created thread without returned identifiers** → Write `dispatching` first, convert interruption/unknown termination to `indeterminate`, and require T3 reconciliation before another dispatch.
- **Receipts can become stale after users delete T3 state** → Preserve identifiers and provide manual recovery guidance; do not silently clear or force duplicate in the initial interface.
- **Strict explicit-launch conflicts reduce composition** → Prefer one deterministic initial workflow; a later change can add an explicit T3 UI/open option with separately modeled outcome semantics.
- **Cross-platform end-to-end environments are not all available** → Cover argv, spaces, multiline prompts, permissions, executable discovery, and receipt behavior with platform-neutral/injected tests; accurately label only macOS/manual T3 evidence as end-to-end.

## Migration Plan

This is additive. Release CLI support first, then canonical docs and packaged guidance against that command contract. Users install the pinned bridge only when they choose T3 handoff. Rolling back the CLI leaves Git-common-directory receipts inert and leaves all created workspaces and T3 threads intact.

## Open Questions

None for the initial interface. Explicit T3 UI opening, receipt administration, configuration defaults, and broader bridge version support require separate evidence and design.
