## Context

The canonical launch-disposition contract currently classifies Terminal.app as able to create a true tab with `do script`. Live Terminal.app 2.15 testing disproved that assumption: `do script <command> in <window>` executes in the selected existing tab, while direct `make new tab` scripting fails. The current implementation still reaches an invalid AppleScript selector and returns an opaque `-1700` launch failure.

Arashi already has a pure launch-plan capability boundary and the stable `TAB_DISPOSITION_UNSUPPORTED` error code. It also has shell integration for `arashi switch --cd`, which can safely change the directory of a tab the user created manually.

## Goals / Non-Goals

**Goals:**

- Reject Terminal.app `tab` disposition before any Terminal AppleScript or fallback process runs.
- Preserve default Terminal.app new-window behavior.
- Give users an accurate manual workflow: press Command-T, then run `arashi switch --cd` in that tab when shell integration is active.
- Correct stale capability contracts and companion guidance.
- Prove no mutation and no fallback at command and shared-launcher boundaries.

**Non-Goals:**

- Automating Command-T through System Events or requesting Accessibility permission.
- Treating command execution in an existing tab as tab creation.
- Adding a new CLI option, configuration field, or persistent launcher policy.
- Changing iTerm2, Ghostty, or generic macOS default-window behavior.

## Decisions

### Classify Terminal.app tab disposition as unsupported in the pure launch plan

The Terminal.app/tab matrix row will resolve to `supported: false` with an application-specific reason before macOS target preflight. Both switch and post-create flows already consume this planning boundary, so one capability decision prevents state-changing AppleScript and pre-mutation create work.

**Alternative considered:** Correct only the AppleScript selector and then call `do script ... in targetWindow`. Rejected because it would execute in the user's existing selected tab and violate explicit disposition semantics.

### Offer a manual native-UI plus shell-integration workflow

Actionable guidance will say that Terminal.app cannot be scripted to create the requested tab safely, then offer two explicit alternatives:

1. Press Command-T manually and run `arashi switch --cd` in the new tab; this requires active Arashi shell integration.
2. Run `arashi switch --no-cd --no-default-launch` to force normal automatic launch instead of parent-shell directory switching or a configured named launcher. When launcher resolution reaches bare Terminal.app, its default disposition opens a new window.

The sequential manual workflow does not conflict with the CLI rule that rejects a single invocation combining `--tab` and `--cd`: the user creates the tab first, then invokes only `--cd` inside it.

**Alternative considered:** UI-script Command-T automatically. Rejected because System Events requires Accessibility permission, depends on frontmost focus/timing, and cannot preserve exact preflight-window safety.

### Keep the structured error contract stable

The error remains `TAB_DISPOSITION_UNSUPPORTED` with existing `{ disposition, launcher }` detail. The application-specific reason may be surfaced in human and structured error messages, but no schema or exit-code change is introduced. Existing shell-integration errors remain authoritative if the user later invokes `--cd` without active integration.

### Correct canonical and companion capability matrices

The `launch-disposition` requirement will replace the false Terminal.app true-tab scenario with unsupported-before-mutation behavior and manual guidance. Canonical docs, generated agent exports, packaged skills, and semantic checks will be audited so no maintained surface continues to claim scripted Terminal.app tab creation.

## Risks / Trade-offs

- **Users may read `arashi switch --cd` as universally available.** → State explicitly that shell integration must be active and preserve existing `--cd` diagnostics.
- **Users may assume merely omitting `--tab` always launches Terminal.app.** → Recommend `--no-cd --no-default-launch` for launch intent and describe the new Terminal window as conditional on automatic resolution selecting Terminal.app.
- **A future Terminal.app release may add a supported API.** → Keep the capability decision isolated in the launcher matrix so it can be revised after authoritative API and exact-target verification.
- **Guidance can drift across CLI, docs, and skills.** → Extend semantic contract checks and deliberate-drift fixtures around the Terminal.app row and manual fallback.
- **Current users lose an apparently supported path.** → The current path already fails; the change replaces an opaque failure with fail-closed, actionable behavior.

## Migration Plan

1. Update canonical OpenSpec and semantic checks.
2. Add RED tests at plan, switch/create pre-mutation, and user-guidance boundaries.
3. Implement the unsupported Terminal.app/tab plan and remove unreachable tab mutation code where safe.
4. Update docs and packaged guidance, regenerate exports/contracts, and run full cross-repository validation.
5. Roll back by reverting the capability row and companions; no persisted data migration exists.

## Open Questions

None. The maintainer selected the manual Command-T plus `arashi switch --cd` workflow, with default new-window launch as the other supported alternative.
