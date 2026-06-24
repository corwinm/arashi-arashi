## 1. Version Confirmation

- [x] 1.1 Re-check the latest stable major releases for `actions/checkout` and `actions/setup-node` before editing workflows.
- [x] 1.2 Review upstream migration notes for each action major jump and record any required workflow input adjustments.
- [x] 1.3 Confirm whether `repos/arashi-skills` Node 20 setup pins are intentional compatibility coverage or stale CI runtime pins for issue #164.

## 2. `repos/arashi` Workflow Updates

- [x] 2.1 In `repos/arashi/.github/workflows/ci.yml`, update all `actions/checkout@v4` uses to the confirmed current stable major while preserving existing job behavior.
- [x] 2.2 In `repos/arashi/.github/workflows/release.yml`, update `actions/checkout@v4` and `actions/setup-node@v4` to confirmed current stable majors while preserving the existing Node setup configuration unless migration notes require changes.
- [x] 2.3 Review the `repos/arashi` workflow diffs for unrelated trigger, permission, job, command, or cache changes.
- [x] 2.4 Run relevant `repos/arashi` validation commands such as lint, tests, and build, or record why any check could not be run.

## 3. `repos/arashi-docs` Workflow Updates

- [x] 3.1 In `repos/arashi-docs/.github/workflows/docs-validate.yml`, update `actions/checkout@v4` to the confirmed current stable major while preserving existing docs validation behavior.
- [x] 3.2 In `repos/arashi-docs/.github/workflows/docs-link-health.yml`, update `actions/checkout@v4` to the confirmed current stable major while preserving existing link-check behavior.
- [x] 3.3 Review the `repos/arashi-docs` workflow diffs for unrelated trigger, permission, job, command, or cache changes.
- [x] 3.4 Run relevant `repos/arashi-docs` validation commands such as docs validation or link-health checks, or record why any check could not be run.

## 4. `repos/arashi-skills` Workflow Updates

- [x] 4.1 In `repos/arashi-skills/.github/workflows/security-audit.yml`, update `actions/checkout@v4` and `actions/setup-node@v4` to confirmed current stable majors.
- [x] 4.2 In `repos/arashi-skills/.github/workflows/release-security-gate.yml`, update all `actions/checkout@v4` uses and `actions/setup-node@v4` to confirmed current stable majors.
- [x] 4.3 Update or retain the `node-version: "20"` pins based on the decision from task 1.3, and document the reason in the implementation notes for issue #164.
- [x] 4.4 Review the `repos/arashi-skills` workflow diffs for unrelated trigger, permission, job, command, artifact, or security-gate changes.
- [x] 4.5 Run relevant `repos/arashi-skills` validation commands for security audit and release gate behavior, or record why any check could not be run.

## 5. `repos/arashi-vscode` Workflow Updates

- [x] 5.1 In `repos/arashi-vscode/.github/workflows/ci.yml`, update `actions/checkout@v4` to the confirmed current stable major while preserving existing Bun, cache, and extension validation behavior.
- [x] 5.2 In `repos/arashi-vscode/.github/workflows/release.yml`, update `actions/checkout@v4` to the confirmed current stable major while preserving existing release behavior.
- [x] 5.3 Review the `repos/arashi-vscode` workflow diffs for unrelated trigger, permission, job, command, or cache changes.
- [x] 5.4 Run relevant `repos/arashi-vscode` validation commands such as lint, tests, compile, package, or extension checks, or record why any check could not be run.

## 6. Cross-Repository Review

- [x] 6.1 Search all child repositories for remaining `actions/checkout@v4`, `actions/setup-node@v4`, and unreviewed `node-version: 20` or `node-version: "20"` workflow entries.
- [x] 6.2 Ensure each affected child repository has a separate implementation diff and references corwinm/arashi-arashi#164 in its PR or implementation notes.
- [x] 6.3 Cross-link related child-repository PRs if multiple repositories are changed for issue #164.
- [x] 6.4 Run `openspec validate update-actions-node-version` from the meta-repo and fix any proposal validation errors before implementation is considered ready.
