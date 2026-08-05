## Why

`arashi switch --tab` is an explicit per-invocation launch request, but it still inherits configured `sesh` or `herdr` launchers unless the user redundantly adds `--no-default-launch`. The same precedence gap exists for `arashi create --tab`: although tab implies `--launch`, it inherits configured create launchers while explicit `--launch --tab` selects automatic launch. On Windows, the correct Windows Terminal tab command also fails from Git Bash because Bun cannot resolve executables when that environment exposes the case-insensitive Windows path variable only as uppercase `PATH`.

## What Changes

- Make `arashi switch --tab` and `arashi create --tab` bypass configured explicit launch defaults by themselves while preserving any launcher explicitly selected in the same invocation.
- Describe `--tab` as an authoritative one-invocation launch override in CLI help and generated command policy metadata.
- Canonicalize the case-insensitive Windows path environment key before Bun child-process spawning so `wt.exe` and other PATH executables resolve from Git Bash.
- Preserve Windows Terminal's exact tab argv, active profile, selected cwd, detached lifecycle, and fail-closed behavior.
- Add focused resolver, environment-normalization, and Windows launcher regression coverage plus a real Windows Git Bash verification.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `switch-command`: Define that explicit `--tab` bypasses a configured `sesh` or `herdr` default without requiring a separate opt-out flag.
- `launch-disposition`: Define create-tab configured-launcher precedence and require Windows process environments to preserve executable resolution across case variants of the Windows PATH key.

## Impact

The CLI implementation and tests in `corwinm/arashi` are affected, along with the generated CLI command contract and canonical OpenSpec requirements in `corwinm/arashi-arashi`. No persistent configuration shape or schema changes. User documentation and packaged skill guidance are updated to project the same switch/create override policy. Existing `switch --cd` precedence is preserved and pinned by regression coverage.
