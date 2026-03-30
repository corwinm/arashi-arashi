## Why

Running `arashi init` in a non-git directory currently fails at the exact moment a new user is trying to get started. We need `init` to help bootstrap a repository in place or in a child path, and we need the onboarding docs and skills to show the intended workflow clearly.

## What Changes

- Update `arashi init` so that when it is run outside a git repository, it prompts the user to create a repository in the current directory or in a child directory instead of stopping with an error.
- Support repository-target input that can be either `.` for the current directory or a simple child name such as `my-arashi-repo` for a new repository under the current working directory.
- Continue the normal Arashi workspace initialization flow after the repository is created so first-time setup remains a single guided workflow.
- Update getting-started documentation and skill guidance so users understand where to run `arashi init` and what the repository-target prompt means.

## Capabilities

### New Capabilities
- `init-repository-bootstrap`: Define how `arashi init` bootstraps a git repository when invoked from a directory that is not already a repository.
- `init-onboarding-guidance`: Define the required getting-started and skill guidance for running `arashi init` in the correct location and choosing current-directory versus child-directory repository creation.

### Modified Capabilities
- None.

## Impact

- Affected repo: `repos/arashi/` for CLI behavior, repository creation flow, and tests around `init`.
- Affected repos/content: `repos/arashi-docs/` for getting-started guidance and `repos/arashi-skills/` for workflow guidance updates.
- Affected behavior: first-run `init` experience in non-repository directories, prompt flow, and onboarding documentation.
