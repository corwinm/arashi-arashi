## 1. Contract and RED Coverage

- [ ] 1.1 Add switch resolver and command-contract tests proving `--tab` alone bypasses configured sesh/Herdr while explicit launcher composition remains authoritative.
- [ ] 1.2 Add Windows environment-normalization tests for uppercase `PATH`, canonical `Path`, duplicate case variants, and non-Windows preservation.
- [ ] 1.3 Run focused tests and record expected RED failures against current production behavior.

## 2. CLI Implementation

- [ ] 2.1 Make tab disposition opt out of configured explicit launch defaults without mutating parsed options or changing direct-caller behavior.
- [ ] 2.2 Canonicalize the Windows executable search path key at the shared child-process environment boundary.
- [ ] 2.3 Update switch help and generated command policy semantics, then regenerate the CLI contract.

## 3. Companion Guidance

- [ ] 3.1 Update canonical switch and launch-disposition docs to state that `--tab` alone bypasses configured explicit launcher defaults.
- [ ] 3.2 Update packaged Arashi command guidance with the same standalone override and explicit-launcher composition contract.
- [ ] 3.3 Run focused companion semantic checks and regenerate deterministic exports if required.

## 4. Validation and Delivery

- [ ] 4.1 Run focused CLI tests, full tests, typecheck, lint, formatting, contract freshness, native build, and Windows cross-build after the final source edit.
- [ ] 4.2 Build the Windows artifact and verify executable resolution from real Git Bash on the Windows test PC while preserving Windows Terminal tab argv/lifecycle.
- [ ] 4.3 Validate OpenSpec and coordinated cross-repository contracts, review diffs, and commit each owning repository separately.
- [ ] 4.4 Open and cross-link child and meta PRs, verify current-head CI, then archive and close out only after child PRs merge.
