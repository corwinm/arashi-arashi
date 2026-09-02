## Why

Cross-repository command validation currently runs only when the meta repository changes, so child pull requests and merges can alter shared contracts without integration coverage. The workflow also consumes floating child branches and leaves revision evidence only in logs, making a green run difficult to reproduce or audit precisely.

## What Changes

- Make the authoritative meta workflow callable from each participating public child repository without a shared PAT or release credential.
- Pass the triggering child repository and full revision explicitly, validate them fail-closed, and check out that child at the immutable revision.
- Add minimal pull-request and `main` caller workflows to every participating child repository.
- Resolve every other repository once, record every exact revision in deterministic JSON, and use those checked-out revisions for the entire validation run.
- Publish the revision manifest to the job summary and as a digest-bearing workflow artifact.
- Preserve direct meta pull-request, `main`, and manual runs, including matching coordinated child branches for meta pull requests.
- Add controlled-drift tests for missing callers, floating triggering-child checkouts, incomplete manifests, and log-only revision reporting.

## Capabilities

### New Capabilities

<!-- None. -->

### Modified Capabilities

- `cross-repo-command-contracts`: Require child-triggered validation, immutable triggering revisions, and durable complete revision evidence.

## Impact

- `arashi-arashi`: shared workflow, workflow-contract checks, documentation, and OpenSpec artifacts.
- `arashi`, `arashi-docs`, `arashi-skills`, `arashi-vscode`, and `arashi-presentation`: one minimal caller workflow each.
- GitHub Actions only; no CLI, extension, documentation-site, skill-package, or presentation runtime behavior changes.
- Bootstrap requires the callable meta workflow to reach `main` before child callers can safely reference `@main`; the final OpenSpec closeout remains child-last/meta-last after that foundation is available.
