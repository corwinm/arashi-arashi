## Context

`.github/workflows/ci.yml` currently expands to 15 checks:

- quality: 1;
- Linux/Windows source tests: 2;
- Linux/macOS/Windows builds: 3;
- version/completion validation: 3;
- native materialization acceptance: 3;
- installed POSIX/JavaScript wrapper acceptance: 1;
- Windows installer acceptance: 1;
- native Windows hook-input acceptance: 1.

The post-build checks download the same platform artifacts and repeat runner/runtime setup. Historical failures show that merely concatenating their commands would be unsafe: an early Windows acceptance failure could skip later installer or hook-input coverage, while a matrix's default fail-fast behavior could cancel other platforms.

## Goals / Non-Goals

**Goals:**

- Reduce one CI run from 15 checks to exactly 9 without removing behavioral coverage.
- Retain independent quality, source-test, and native-build outcomes.
- Run all applicable acceptance groups even when an earlier group or another platform fails.
- Keep the platform artifacts and build dependency unchanged.
- Make topology and failure-sequencing drift executable through focused contract tests.

**Non-Goals:**

- Merge source tests into native builds or acceptance.
- Change platform, architecture, Node, Bun, package-manager, artifact, or release policy.
- Optimize application tests or acceptance fixture internals.

## Decisions

### Preserve build as an independent three-platform matrix

The existing `build` matrix continues to compile and upload Linux x64, macOS arm64, and Windows x64 artifacts after the quality gate. This preserves artifact production independently of acceptance and allows all platform acceptance jobs to start from the same immutable built payloads.

### One post-build acceptance matrix with platform profiles

Replace `validate`, `materialization-native`, `hook-input-wrapper`, `windows-installer-acceptance`, and `hook-input-native` with one `native-acceptance` include matrix:

- Ubuntu: version/completion, materialization, and installed POSIX/JavaScript wrapper/hook acceptance;
- macOS: version/completion and materialization;
- Windows: version/completion, materialization, transactional/default installer acceptance, and native hook-input acceptance.

Every matrix entry checks out source, sets up Node 24, downloads its platform artifact into `bin/`, and makes POSIX artifacts executable. Ubuntu and Windows additionally install pinned dependencies because their specialized suites require Vitest/node-pty.

### Continue independent coverage without hiding failures

Set `strategy.fail-fast: false` so one platform failure does not cancel acceptance on another platform. Give each major acceptance group an ID and a guarded `if: always() && ...` condition based only on its true setup/artifact prerequisites—not on preceding sibling acceptance outcomes. Do not use `continue-on-error`.

This yields two properties:

1. applicable later acceptance groups still execute after an earlier sibling group fails;
2. any failed acceptance step still makes the owning platform check fail.

### Contract semantic topology and failure behavior

Extend the existing CI workflow contract test to validate bounded job/step sections and assert:

- six job definitions expand to exactly nine checks: quality (1), tests (2), builds (3), native acceptance (3);
- build and acceptance matrices map all three supported OS/target/artifact combinations;
- the five obsolete post-build job IDs are absent;
- every existing general and platform-specific acceptance command remains reachable in the owning matrix job;
- `needs: [build]`, `strategy.fail-fast: false`, pinned runtime/dependency setup, and artifact paths remain intact;
- major sibling acceptance steps use `always()` with true prerequisites, while `continue-on-error`, failure-bypassing artifact behavior, and conditional platform loss are rejected.

Controlled mutations must prove each protected condition fails rather than relying only on positive substring checks.

## Risks / Trade-offs

- **Reduced job-level labels:** Five post-build job definitions become one matrix. Named steps preserve diagnostic ownership inside each platform check.
- **Longer platform checks:** Applicable suites run serially per platform, estimated at under four minutes on Windows, while the Linux/Windows source-test matrix remains the approximately seven-minute critical path.
- **Shared workspace:** Specialized suites use isolated temporary fixtures and cleanup. The checked-out wrappers and downloaded `bin/` artifact are deliberate shared prerequisites.
- **Guard complexity:** Explicit step IDs and conditions add YAML, but they preserve more failure evidence than straightforward sequential steps.

## Rollback

Before OpenSpec archival, revert the child PR and re-run the original 15-check PR/default-branch topology; leave this change unarchived or revise it to match the restored implementation.

After OpenSpec archival/meta merge, revert both the child implementation PR and the archived/meta specification commit (or deliver an equivalent coordinated spec correction), then run strict canonical OpenSpec validation and verify the restored 15-check default-branch workflow. Product state and persisted data require no migration.
