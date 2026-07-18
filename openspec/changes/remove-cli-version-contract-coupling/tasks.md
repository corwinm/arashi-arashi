## 1. CLI Contract

- [ ] 1.1 Add failing CLI tests that require schema version 2 and release-version-independent serialization
- [ ] 1.2 Remove `cliVersion`, bump the contract schema, and regenerate the canonical artifact
- [ ] 1.3 Run focused contract tests and contract freshness validation

## 2. Meta-Repository Consumer

- [ ] 2.1 Add failing meta-repository tests for schema version 2 contracts without `cliVersion`
- [ ] 2.2 Update contract parsing, diagnostics, and fixtures to validate schema version and commands
- [ ] 2.3 Run focused meta tests and the coordinated cross-repository contract check

## 3. Verification and Delivery

- [ ] 3.1 Run CLI format, lint, typecheck, full tests, build, and contract freshness gates
- [ ] 3.2 Run meta-repository format, typecheck, full tests, OpenSpec validation, and cross-repository checks
- [ ] 3.3 Independently review both repository diffs and address any blocking findings
- [ ] 3.4 Commit and open cross-linked CLI and meta/OpenSpec pull requests, then verify remote CI
