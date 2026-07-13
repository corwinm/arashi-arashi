## 1. Regression Coverage

- [x] 1.1 Add focused parser tests for valid positive and zero depths.
- [x] 1.2 Add focused parser tests that reject non-numeric, partial, fractional, negative, and unsafe values.
- [x] 1.3 Run the focused tests and confirm they fail for the missing validation behavior.

## 2. CLI Validation

- [x] 2.1 Add a strict `--max-depth` option parser that returns a non-negative safe integer or throws a clear invalid-argument error.
- [x] 2.2 Wire the validated numeric value through the list command without reparsing it during execution.
- [x] 2.3 Run the focused tests and confirm all accepted and rejected cases pass.

## 3. Changed-Files Quality Helper

- [x] 3.1 Add a failing regression that runs the helper against a changed TypeScript file with the repository-standard oxlint config name.
- [x] 3.2 Update the helper to load `.oxlintrc.json` and verify `pnpm run quality:changed` succeeds.

## 4. Verification and Delivery

- [x] 4.1 Run lint, the full test suite, and build in `corwinm/arashi`.
- [x] 4.2 Validate the OpenSpec change and check both repositories for clean diffs.
- [x] 4.3 Commit, push, and cross-link the child implementation PR and meta/OpenSpec PR.
- [ ] 4.4 Verify remote CI succeeds after all implementation commits before presenting the change for merge.
