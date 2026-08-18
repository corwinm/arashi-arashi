## 1. Regression Evidence

- [x] 1.1 Add a real-Git regression proving effective-source inspection accepts a tracked `.gitignore` with CRLF line endings.
- [x] 1.2 Add deterministic RED coverage for malformed successful primary output followed by complete fallback provenance.
- [x] 1.3 Add deterministic RED coverage proving malformed, path-mismatched, and delimiter-ambiguous fallback output fails closed with actionable dual-query diagnostics.
- [x] 1.4 Add coverage preserving no-match and fatal-primary behavior without fallback.

## 2. Managed-Ignore Recovery

- [x] 2.1 Extract strict parsing for one complete NUL-delimited primary record and one unambiguous direct-argument fallback record.
- [x] 2.2 Add the one-shot direct-argument, non-`-z` Git fallback after malformed successful primary output.
- [x] 2.3 Keep process injection internal and preserve existing managed-ignore result/error contracts.

## 3. Validation and Delivery

- [x] 3.1 Run focused managed-ignore and init tests, then `pnpm run lint`, `pnpm run test`, and `pnpm run build` in `repos/arashi`.
- [x] 3.2 Run a native Windows CRLF initialization/recovery probe against the exact implementation revision.
- [x] 3.3 Complete exact-diff self-review, open the child implementation PR, and reconcile its CI/review findings.
- [x] 3.4 Update this checklist from evidence and complete all pre-archive OpenSpec validation and reconciliation.

## 4. Archive and Merge

- [x] 4.1 Archive the approved change, sync the archived artifacts to the meta PR, and complete the child-first merge workflow.
