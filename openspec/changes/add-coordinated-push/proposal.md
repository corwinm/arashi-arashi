## Why

Publishing coordinated feature branches is currently a manual, per-repository step after `arashi create`, `sync`, and local commits. A first-class `arashi push` command completes the coordinated branch lifecycle and reduces mistakes when humans or agents prepare related PRs across the parent repo and managed child repositories.

## What Changes

- Add an `arashi push` command that discovers repositories in the current coordinated workspace and publishes eligible current branches to their configured remotes.
- Support standard repository selection with `--only <repos>` plus `--set-upstream`, `--dry-run`, and `--json` options.
- Report per-repository pushed, skipped, and failed outcomes without manufacturing remote branches for intentionally untouched child repositories.
- Keep human output grouped and readable while JSON mode returns a single structured envelope suitable for automation.
- Document the new command in the CLI and docs site, including safety notes for dry-run/JSON usage.

## Capabilities

### New Capabilities
- `coordinated-branch-publishing`: Coordinated branch publishing behavior for `arashi push`, including repository eligibility, upstream handling, dry-run previews, and failure reporting.

### Modified Capabilities
- `machine-readable-cli-output`: Add the `arashi push --json` structured summary contract under the existing JSON envelope and stdout-isolation requirements.

## Impact

- `repos/arashi`: command registration, git push helpers, repository selection/eligibility logic, human and JSON output formatting, and unit/integration tests.
- `repos/arashi-docs`: new command reference page and relevant workflow/command cross-links.
- `repos/arashi-skills`: update Arashi workflow guidance so agents can use `arashi push` before opening cross-repo PRs.
