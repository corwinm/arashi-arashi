# Quickstart: Linter and Formatter Setup

## Goal

Enable contributors to run consistent lint and format checks locally and enforce the same standards in pull request validation.

## Prerequisites

1. The Arashi repository is available in `repos/arashi`.
2. Project dependencies are installed.
3. Contributor is working from the Arashi repository root.

## Steps

1. Configure repository-level lint and format rule files, including ignore patterns for generated or vendored artifacts.
2. Add contributor-facing scripts for lint, lint auto-fix, format, and format check.
3. Run lint and format checks locally on a sample change and confirm pass/fail diagnostics identify affected files.
4. Trigger pull request validation and verify lint and format checks execute as required gates.
5. Introduce an intentional lint and formatting violation and confirm pull request validation fails with actionable remediation guidance.
6. Fix violations and confirm pull request validation returns to passing state.

## Expected Results

- Contributors can run one documented set of commands for local quality checks.
- Lint and format checks consistently identify non-compliant files and issues.
- Pull request validation blocks merge when lint or format checks fail.
- Generated/vendor artifacts remain excluded from formatting and linting scope.
