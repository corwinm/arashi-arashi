## 1. CLI Contract and Update Planning

- [ ] 1.1 Add `update` command options and help text for `--check`, `--dry-run`, and `--yes`.
- [ ] 1.2 Define update result/status types for current, available, skipped, succeeded, and failed outcomes.
- [ ] 1.3 Add semver/version comparison and latest-version lookup helpers with injectable fetch/process dependencies for tests.

## 2. Install Method Detection

- [ ] 2.1 Detect npm-managed entrypoint context from the JavaScript package root and package metadata.
- [ ] 2.2 Detect direct-binary/manual context in the native CLI command path.
- [ ] 2.3 Add conservative fallback behavior for ambiguous install methods with manual guidance and no mutation.

## 3. npm-Managed Update Flow

- [ ] 3.1 Intercept `arashi update` in `bin/arashi.js` before spawning the native binary.
- [ ] 3.2 Select supported package-manager commands for npm, pnpm, yarn, and bun when confidently detectable.
- [ ] 3.3 Enforce safe non-interactive behavior by requiring `--yes` for mutating updates outside an interactive prompt.
- [ ] 3.4 Run the selected package-manager command, re-read the updated package version, and refresh the matching platform binary.
- [ ] 3.5 Preserve the existing binary and report actionable recovery guidance if update or verification fails.

## 4. Direct-Binary Guidance Flow

- [ ] 4.1 Register a native `update` command in `src/index.ts`.
- [ ] 4.2 Implement direct-binary update checks against latest GitHub release metadata.
- [ ] 4.3 Print platform-specific release asset/manual replacement guidance without modifying files.

## 5. Binary Installer Integration

- [ ] 5.1 Extend installer helpers so update flows can refresh stale binaries for a selected package version.
- [ ] 5.2 Keep idempotent `arashi install` behavior for already-current binaries.
- [ ] 5.3 Verify updated binaries with the existing `--version` smoke test before reporting success.

## 6. Tests and Documentation

- [ ] 6.1 Add unit tests for version comparison, latest-version lookup, and install-method detection.
- [ ] 6.2 Add unit tests for npm-managed update command selection, check/dry-run modes, and non-interactive `--yes` enforcement.
- [ ] 6.3 Add unit tests for direct-binary guidance and unsupported/ambiguous install methods.
- [ ] 6.4 Update CLI README, docs site command guidance, and Arashi skill command references for `arashi update`.

## 7. Validation

- [ ] 7.1 Run `bun run lint` in `repos/arashi`.
- [ ] 7.2 Run `bun run test` in `repos/arashi`.
- [ ] 7.3 Run `bun run build` in `repos/arashi`.
- [ ] 7.4 Run relevant docs/skills validation if those repos are updated.
