## Context

The explicit tab feature separates launch disposition (`window` or `tab`) from launcher selection. That separation is correct, but `resolveLaunchOptions` currently applies a configured `sesh`/`herdr` launcher even when `--tab` was the explicit trigger for launch behavior. The existing test supplies `defaultLaunch: false`, so it cannot detect that omission.

Windows Terminal commands use Bun's detached process runner. A real Bun 1.3.9 probe on the Windows test PC established that Git Bash exports the Windows path variable as uppercase `PATH`; Bun's Windows executable lookup fails in that environment but succeeds when the same value is supplied under canonical key `Path`. The `wt.exe` app execution alias is installed and resolvable by Windows itself.

## Goals / Non-Goals

**Goals:**

- Treat explicit `--tab` on switch and create as sufficient to bypass configured explicit launch defaults.
- Preserve explicit launcher-plus-disposition combinations such as `--herdr --tab`.
- Make all Bun child-process launches robust to case variants of the Windows path variable.
- Preserve existing Windows Terminal argv and detached startup semantics.

**Non-Goals:**

- Persist a tab preference in configuration.
- Change launcher detection precedence or Windows Terminal session reuse.
- Add fallback from a failed explicit tab request.
- Work around arbitrary missing executables or alter non-Windows environment key casing.

## Decisions

### Make disposition override participate in configured-launch opt-out

`resolveLaunchOptions` will treat switch `options.tab === true` as an opt-out of `configLaunchMode` unless an explicit launcher flag is present. `resolveCreateDefaults` will likewise treat `--tab` as explicit automatic launch when `--tmux`, `--sesh`, and `--herdr` are absent. This also makes `create --tab` resolve consistently with the existing `create --launch --tab` combination. Passing synthetic negative flags through Commander or mutating options was rejected because it obscures resolver contracts and makes direct executor callers differ from CLI callers.

### Preserve explicit launcher composition

Existing explicit launcher branches remain ahead of configured/default resolution. Therefore `--herdr --tab`, `--sesh --tab`, `--tmux --tab`, and other supported combinations still select that launcher and carry disposition `tab`; only implicit configured launchers are bypassed. Create's `--no-launch` and `--no-switch` remain compatible but overridden by tab's explicit launch-and-switch implications.

### Preserve the existing explicit `--cd` override

`switch --cd` is already resolved as explicit CLI behavior ahead of every configured `launch`, `sesh`, or `herdr` mode, so it needs no production or configuration change. It remains mutually exclusive with explicit launcher selectors and `--tab`; `--no-cd` intentionally differs because it disables only parent-shell directory change and may retain a configured launcher. Add focused coverage to keep that distinction explicit.

### Canonicalize the Windows path key at the shared spawn-environment boundary

`normalizeSpawnEnvironment` will accept an injectable platform (defaulting to `process.platform`) and, on `win32`, collapse every case-insensitive `path` key into one `Path` entry while preserving its exact value. This addresses the root cause for all Bun process launches from Git Bash instead of special-casing `wt.exe` or hardcoding `%LOCALAPPDATA%`.

Hardcoding the WindowsApps alias path was rejected because app execution aliases are installation/user state and Bun also failed to execute that zero-byte reparse point by absolute path in the reproduced environment. Routing through `cmd.exe` or PowerShell was rejected because it adds reparsing and weakens argv/lifecycle guarantees.

### Verify the production boundary on Windows

Unit tests will inject `win32` to prove environment normalization and launcher routing. Final verification will build the actual Windows artifact and run a Git Bash-hosted Bun/compiled-CLI probe on the Windows test PC, because macOS mocks cannot reproduce Bun's Windows environment lookup behavior.

## Risks / Trade-offs

- [Windows environments contain both `PATH` and `Path`] → Preserve the last enumerated case-insensitive value under one canonical `Path` key and add deterministic duplicate-key coverage.
- [Shared normalization changes all Windows child launches] → Keep the change limited to key casing, preserve every value and non-path key, then run the full suite and Windows cross-build.
- [Explicit `--tab` changes existing configured-launch behavior] → This is the requested correction; pin both implicit-config bypass and explicit-launcher composition in resolver and executor tests.
- [A test double can hide the real Bun failure] → Require a real Git Bash probe against the built Windows artifact before declaring the platform bug fixed.

## Migration Plan

Ship as a backward-compatible patch. No configuration migration is required. Rollback is the prior CLI release; no persisted state changes.

## Open Questions

None.
