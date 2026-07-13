## 1. Regression Coverage

- [x] 1.1 Add focused parser tests for valid positive and zero depths.
- [x] 1.2 Add focused parser tests that reject non-numeric, partial, fractional, negative, and unsafe values.
- [x] 1.3 Run the focused tests and confirm they fail for the missing validation behavior.

## 2. CLI Validation

- [x] 2.1 Add a strict `--max-depth` option parser that returns a non-negative safe integer or throws a clear invalid-argument error.
- [x] 2.2 Wire the validated numeric value through the list command without reparsing it during execution.
- [x] 2.3 Run the focused tests and confirm all accepted and rejected cases pass.

## 3. Verification and Delivery

- [x] 3.1 Run lint, the full test suite, and build in `corwinm/arashi`.
- [x] 3.2 Validate the OpenSpec change and check both repositories for clean diffs.
- [ ] 3.3 Commit, push, and cross-link the child implementation PR and meta/OpenSpec PR.
- [ ] 3.4 Verify remote CI succeeds before presenting the change for merge.
