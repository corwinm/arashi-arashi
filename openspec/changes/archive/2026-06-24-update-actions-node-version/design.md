## Context

Issue #164 reports GitHub Actions warnings that `actions/checkout@v4` and `actions/setup-node@v4` target deprecated Node.js 20 runtimes and are being forced to run on Node.js 24. The meta-repo coordinates four child repositories, and planning discovered Node-backed GitHub-owned actions in workflows under `repos/arashi/`, `repos/arashi-docs/`, `repos/arashi-skills/`, and `repos/arashi-vscode/`.

The warning is about the JavaScript runtime used by actions, not necessarily the Node version used by project commands. Some workflows also set up a project Node version directly. Those pins should be reviewed separately from action major versions so the implementation does not accidentally change build semantics.

## Goals / Non-Goals

**Goals:**
- Remove deprecated Node 20 action runtime warnings for the child repository workflows tracked by issue #164.
- Update `actions/checkout` and `actions/setup-node` uses from v4 to the latest stable major versions available at implementation time.
- Review explicit `node-version: "20"` pins and update them only where the workflow is using Node 20 as a stale CI runtime rather than as a documented project compatibility target.
- Keep each child repository's workflow changes isolated to that repository.
- Validate that affected workflows still exercise the same CI, release, docs, and security-gate behavior after action upgrades.

**Non-Goals:**
- Reworking workflow structure, job names, triggers, permissions, artifact retention, or caching strategy.
- Updating non-GitHub actions such as `oven-sh/setup-bun` unless a separate runtime deprecation warning is found.
- Changing application package engines, supported user Node versions, or release artifact formats.
- Implementing workflow changes in this proposal-only step.

## Decisions

1. **Use current stable major action tags at implementation time.**
   - Check the upstream releases for `actions/checkout` and `actions/setup-node` before editing workflows, then update v4 uses to the newest stable major tags.
   - Planning-time verification on June 24, 2026 found `actions/checkout` latest at v7.0.0 and `actions/setup-node` latest at v6.4.0.
   - Rationale: the issue requests current Node-backed actions; pinning the proposal to an older expected v5 target would be stale before implementation.
   - Alternative considered: update only to v5. That would address the original Node 24 transition for some actions but would not satisfy the broader "current node version" request once newer majors exist.

2. **Separate action runtime upgrades from project Node setup versions.**
   - Replace deprecated action majors wherever found.
   - For explicit `node-version` values, update Node 20 pins only after confirming the workflow does not intentionally test Node 20 compatibility.
   - Rationale: `actions/setup-node@v4` running on Node 20 is distinct from a workflow choosing Node 20 for project commands.
   - Alternative considered: update all `node-version` values to 24. That could change package compatibility coverage and introduce unrelated failures.

3. **Keep changes scoped to child repositories.**
   - The OpenSpec artifacts live in the meta-repo; later workflow edits belong under the affected `repos/<project>/` child repositories.
   - Rationale: the workspace rules require implementation in the owning child repository and separate commits/PRs per repository.
   - Alternative considered: make a meta-repo-only workflow sweep. That would not update the actual workflow files that GitHub runs for each child project.

4. **Validate behavior with repository-local checks plus workflow syntax review.**
   - Run each affected child repository's relevant lint/test/build/docs/security commands when practical.
   - Inspect workflow YAML after edits for unchanged triggers, jobs, permissions, and command steps except for the intended version updates.
   - Rationale: action major upgrades can include behavior changes even when workflow syntax remains valid.

## Risks / Trade-offs

- **New action majors may introduce breaking input or runtime behavior** -> Review release notes for each action major jump and preserve existing inputs such as fetch depth, cache settings, and Node setup options.
- **Explicit Node 20 workflow pins may be intentional compatibility coverage** -> Check package metadata and workflow purpose before changing them; leave intentional compatibility tests in place with a note if no change is made.
- **Multiple child repos require separate implementation histories** -> Plan tasks by repository and do not combine child repo changes into one git commit.
- **Local validation may not fully reproduce GitHub-hosted runner behavior** -> Combine local commands with workflow YAML review, and expect GitHub Actions to be the final confirmation after PRs are opened later.

## Migration Plan

1. In each affected child repository, update deprecated GitHub-owned action majors to current stable tags.
2. Review and update stale explicit Node 20 setup pins where consistent with each repository's supported runtime.
3. Run repository-local validation commands and inspect workflow diffs for unintended behavior changes.
4. Open child-repository PRs with references to corwinm/arashi-arashi#164 and cross-link related PRs if multiple repositories are changed.

Rollback is to revert the workflow version bumps in the affected child repository if a new action major causes a release-blocking CI regression.

## Open Questions

- Should `repos/arashi-skills` continue testing Node 20 explicitly for compatibility, or should its security workflows move to Node 24 with this change?
