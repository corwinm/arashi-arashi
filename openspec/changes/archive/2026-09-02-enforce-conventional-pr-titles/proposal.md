## Why

Arashi's release-bearing repositories use squash merges and semantic-release, so a pull request title becomes the commit subject analyzed for versioning. CI currently accepts plain descriptive titles, allowing release-worthy changes to land on `main` without a recognized release type.

## What Changes

- Add deterministic pull-request title validation to the CLI and VS Code extension repositories.
- Require recognized Conventional Commit types with an optional scope and breaking marker.
- Run the title check when a pull request is opened, synchronized, reopened, or edited.
- Keep push CI independent of pull-request-only title metadata.
- Add local contract tests for accepted/rejected title syntax and workflow event wiring.

## Capabilities

### New Capabilities

- `conventional-pr-title-validation`: Define release-compatible pull-request title validation across Arashi's semantic-release repositories.

### Modified Capabilities

None.

## Impact

- Affected repositories: `arashi`, `arashi-vscode`, and the meta-repository specification.
- Affected systems: GitHub Actions pull-request validation and semantic-release commit classification.
- No repository rulesets, branch protection, product runtime behavior, or dependencies change.
