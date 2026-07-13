## Context

The `list` command stores `--max-depth` as a string and converts it with `parseInt` while constructing core options. `parseInt` accepts partial numbers, while malformed values become `NaN`. The recursive depth comparison cannot stop traversal when its limit is `NaN`.

While validating this change, `pnpm run quality:changed` also exposed a stale hardcoded `oxlint.json` path. The repository's checked-in configuration is `.oxlintrc.json`, so changed TypeScript files caused the helper to fail before linting.

## Goals / Non-Goals

**Goals:**

- Validate the option at the CLI boundary before invoking repository discovery.
- Accept only non-negative safe integers, including zero.
- Return Commander's standard invalid-argument failure with an actionable message.
- Keep the core list API numeric and unchanged for valid callers.

**Non-Goals:**

- Change the default maximum depth.
- Change traversal semantics for valid values.
- Add validation for unrelated CLI options.
- Address the separate empty repository-filter issue tracked in arashi-arashi#207.

## Decisions

Use a focused Commander option parser that converts the raw string into a number and throws `InvalidArgumentError` for malformed input. This rejects partial values before command execution and follows the CLI's existing framework behavior better than validating deep inside repository traversal.

Require a decimal digit string whose numeric value is a safe integer. This admits `0` and ordinary non-negative depths while rejecting signs, fractions, exponent notation, whitespace-only input, and values that cannot be represented safely.

Test the parser directly for boundary behavior and retain command integration through the existing command contract. A pure parser gives precise, fast regression coverage without invoking process exit or filesystem traversal.

Point the changed-files helper at `.oxlintrc.json` and exercise it from a temporary Git repository containing a changed TypeScript file. This tests the real process boundary and prevents the no-changed-files fast path from concealing future configuration drift.

## Risks / Trade-offs

- [Previously tolerated partial values become errors] → This is intentional because accepting `2junk` conceals user mistakes.
- [Very large but technically safe depths can still request broad scans] → Safe-integer validation prevents numeric corruption; practical policy limits are outside this focused fix.
- [Exporting a parser expands the module surface] → Keep it narrowly named and used only by the command definition and focused tests.
