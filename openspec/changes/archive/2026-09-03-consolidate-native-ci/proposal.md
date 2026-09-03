## Why

The CLI CI workflow reports 15 checks because native binary validation, materialization acceptance, installed-wrapper acceptance, Windows installer acceptance, and Windows hook-input acceptance are spread across five post-build job definitions. These jobs repeatedly start native runners, download the same artifacts, and set up overlapping runtimes even though their coverage can remain independently executable as guarded steps within one acceptance job per supported platform.

## What Changes

- Keep quality, source tests, and the three-platform native build matrix as separate outcomes.
- Replace the five post-build acceptance job definitions with one Linux/macOS/Windows `native-acceptance` matrix.
- Preserve every general and platform-specific acceptance command, while using `fail-fast: false` and guarded `always()` steps so one platform or acceptance group does not hide another applicable result.
- Keep artifact production in the build matrix and consume the same named Linux, macOS, and Windows artifacts from the consolidated acceptance matrix.
- Add workflow-contract coverage for exact check count, supported platform/artifact mapping, retained commands, fail-closed status, cross-platform continuation, and build-to-acceptance dependencies.

## Impact

- Expected CI checks per run: 15 → 9.
- No application behavior, supported platform, release artifact, or native acceptance scenario changes.
- Failures remain visible under the owning platform's `Native Acceptance` check and named steps.
- Full source tests remain the observed critical path; consolidation primarily reduces runner/setup duplication and check-list noise.

Tracks corwinm/arashi-arashi#352.
