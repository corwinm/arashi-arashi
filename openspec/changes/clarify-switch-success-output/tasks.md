## 1. Regression Coverage

- [x] 1.1 Add an exact human-output regression for a successful launched context and record the expected RED failure.
- [x] 1.2 Add an exact human-output regression for a successful parent-shell directory switch and record the expected RED failure.

## 2. Switch Output

- [x] 2.1 Add the shared selected-target-first formatter with explicit repository labeling.
- [x] 2.2 Use the formatter for launched-context and parent-shell directory-switch success messages.

## 3. Validation and Delivery

- [x] 3.1 Run focused switch tests and prove the regression tests fail with the previous output restored.
- [x] 3.2 Run the Arashi CLI lint, full test, and build gates after the final source edit.
- [x] 3.3 Review the exact diff, open the Arashi child PR, and verify its live head and CI state.

## 4. OpenSpec Closeout

- [x] 4.1 Reconcile implementation against this change, mark verified tasks complete, and validate OpenSpec.
- [ ] 4.2 Archive the completed change, sync canonical specs, and open the final meta PR that closes issue #339.
