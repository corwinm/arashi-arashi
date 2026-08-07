## 1. Rate-limit classification

- [x] 1.1 Add focused failing tests that distinguish primary/secondary GitHub rate-limit 403 responses from generic 403 and unrelated failures.
- [x] 1.2 Implement a typed rate-limit release-check error using GitHub response status and headers.

## 2. Unpinned installer planning

- [x] 2.1 Add focused failing POSIX and Windows plan plus execution-boundary tests proving fallback spawns remove even an inherited `ARASHI_VERSION` while known-release plans retain the detected version.
- [x] 2.2 Allow direct-binary installer plans and spawned environments to represent an unpinned latest-release attempt without changing install directory, shell/PATH, checksum, or Windows deferral behavior.

## 3. Confirmation and inspection boundaries

- [x] 3.1 Add focused failing tests for interactive accept, decline, cancellation, `--yes`, non-interactive no-flag, human `--check`/`--dry-run`, bare `--json`, `--json --check`, `--json --dry-run`, preserved `--json --yes` rejection, and non-rate-limit error behavior.
- [x] 3.2 Route only typed rate-limit failures through warning, plan, prompt/`--yes`, and installer execution while preserving normal successful-check and generic failure paths.
- [x] 3.3 Ensure human and structured output clearly state that update availability and the target version were not verified, use the normative `GITHUB_RATE_LIMITED` JSON error contract, and keep POSIX success, Windows scheduling, and installer-failure messages version-neutral.

## 4. Validation and delivery

- [x] 4.1 Run focused update tests after the final source edit.
- [x] 4.2 Run format check, lint, typecheck, full test suite, build, and `git diff --check` in the Arashi CLI repository.
- [x] 4.3 Review companion documentation and generated CLI contract surfaces, updating only those whose maintained behavior contract requires it.
- [x] 4.4 Validate the OpenSpec change and reconcile implementation evidence in this checklist.
- [x] 4.5 Open and cross-link the Arashi CLI implementation PR and meta/OpenSpec PR, then verify exact-head CI and review gates.
