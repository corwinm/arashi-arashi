## 1. Regression Coverage

- [ ] 1.1 Add an exact human-output regression for a successful launched context and record the expected RED failure.
- [ ] 1.2 Add an exact human-output regression for a successful parent-shell directory switch and record the expected RED failure.

## 2. Switch Output

- [ ] 2.1 Add the shared selected-target-first formatter with explicit repository labeling.
- [ ] 2.2 Use the formatter for launched-context and parent-shell directory-switch success messages.

## 3. Validation and Delivery

- [ ] 3.1 Run focused switch tests and prove the regression tests fail with the previous output restored.
- [ ] 3.2 Run the Arashi CLI lint, full test, and build gates after the final source edit.
- [ ] 3.3 Review the exact diff, open the Arashi child PR, and verify its live head and CI state.

## 4. OpenSpec Closeout

- [ ] 4.1 Reconcile implementation against this change, mark verified tasks complete, and validate OpenSpec.
- [ ] 4.2 Archive the completed change, sync canonical specs, and open the final meta PR that closes issue #339.
