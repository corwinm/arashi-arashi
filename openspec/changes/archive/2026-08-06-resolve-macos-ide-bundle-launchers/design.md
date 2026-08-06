## Context

Arashi represents each supported IDE with a command token (`code`, `cursor`, or `kiro`). Explicit IDE switching first runs `which`/`where`; a failed lookup is treated as definitive absence. That is reliable in terminal sessions but not for macOS GUI applications, where the editor can be installed with an official launcher inside its application bundle while Finder/Spotlight-launched processes expose a different PATH.

The VS Code extension resolves the worktree itself and invokes `arashi switch <path> --path --vscode`, so the failure occurs in the shared CLI launcher and affects direct CLI callers as well as the extension. The explicit IDE remains authoritative and must not degrade into another editor or terminal.

## Goals / Non-Goals

**Goals:**

- Resolve explicit supported IDE requests to one concrete executable target.
- Prefer existing PATH behavior, then use verified official macOS app-bundle launchers.
- Support standard system and per-user application directories without user-specific paths.
- Preserve argv safety, explicit-launcher authority, existing error codes, and no-fallback behavior.
- Make availability and execution deterministic under injected platform, environment, home-directory, filesystem, and process dependencies.

**Non-Goals:**

- Searching arbitrary filesystem locations or invoking unverified third-party wrappers.
- Persisting IDE paths in Arashi configuration.
- Changing CLI flags, generated option metadata, JSON behavior, automatic IDE precedence, or VS Code extension command registration.
- Falling back to `open`, another IDE, or a terminal after an explicit IDE request fails.
- Claiming a macOS bundle mapping for an editor until its official layout is verified.

## Decisions

### Resolve an executable target instead of a boolean

Introduce a resolver that returns the command to execute plus its resolution source, or `null`. PATH lookup returns the canonical command token so existing shell behavior remains unchanged. A verified bundle candidate returns its absolute launcher path. Availability checks and execution use the same resolved target rather than independently reconstructing a command.

This avoids the current false-negative boolean and keeps command construction centralized. A boolean-only bundle check was rejected because the later launch would still use the missing PATH token.

### Preserve PATH precedence

The resolver first checks the canonical command through the existing platform lookup. Only a failed PATH lookup on macOS proceeds to bundle candidates. This preserves aliases, package-manager shims, alternative installations intentionally exposed by the user, and current behavior on Linux and Windows.

### Use verified bundled CLIs, not generic application opening

For each editor with a verified official macOS bundle layout, candidates are constructed under:

- `/Applications/<Editor>.app/.../<launcher>`
- `<home>/Applications/<Editor>.app/.../<launcher>`

The official bundled CLI receives the existing `--new-window <worktree>` argv. `open -a`/`open -na` was rejected as the primary fallback because argument delivery and process reuse differ when an app is already running, while the bundled launcher implements the editor's supported command-line protocol.

VS Code and Cursor mappings are verified by installed application layouts. Kiro keeps PATH-only behavior unless its official bundled launcher layout is verified before implementation; adding a guessed mapping is out of scope.

### Keep explicit failure boundaries

If neither PATH nor a verified bundle resolves, Arashi returns `IDE_NOT_FOUND` before launch. If a resolved target exits unsuccessfully, Arashi returns the existing launch failure and does not try another candidate, IDE, or terminal. Candidate discovery is resolution within the requested IDE, not fallback to a different launch mode.

### Inject discovery dependencies

The resolver accepts injected platform, environment, home directory, path-existence check, and process runner. Tests use synthetic paths and runners rather than relying on applications installed on a developer or CI host. Paths containing spaces remain single argv elements.

Configured and zero-config switch integration tests exercise the same resolver through their real switch boundaries.

## Risks / Trade-offs

- **[Bundle layouts change]** → Keep mappings explicit and covered by path-construction tests; PATH remains preferred, and unknown layouts fail actionably.
- **[Home directory is absent]** → Skip per-user candidates and retain system candidates without inventing a path.
- **[Candidate exists but is not executable or fails]** → Treat it as the selected launcher's execution failure and preserve no fallback.
- **[Preflight and execution drift]** → Carry the resolved target through the launch plan/preflight path where applicable, or use one shared resolver at both boundaries with identical injected dependencies and tests.
- **[Kiro layout is unverified]** → Keep current PATH-only support until authoritative evidence exists; do not guess based solely on other Electron editors.

## Migration Plan

1. Add strict failing resolver and switch-path tests.
2. Implement target resolution and verified macOS mappings without changing option or config contracts.
3. Run focused switch tests, complete CLI validation, and a packaged/native macOS acceptance test with an isolated synthetic bundle launcher.
4. Release through the normal Arashi CLI process. Rollback is a source revert; no persisted state or migration is involved.

## Open Questions

- Confirm an authoritative Kiro macOS bundled-CLI location before implementation. If it cannot be verified, retain PATH-only Kiro support and record that limitation explicitly in implementation evidence.
