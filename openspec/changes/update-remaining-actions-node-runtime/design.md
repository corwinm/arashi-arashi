## Context

Issue #164 upgraded the GitHub-owned checkout and setup-node actions implicated at that time. GitHub now reports additional workflow steps as targeting Node.js 20 and forces them onto Node.js 24. The initial inventory spanned four independently versioned child repositories and included both GitHub-owned and third-party actions: cache, artifact upload/download, Bun setup, and Azure login. Before merge, the inventory was refreshed and found that the meta-repository had since gained a cross-repository contract workflow using `actions/checkout@v4`; that workflow is included in this change as well.

The issue is about the runtime embedded inside each JavaScript action, not the Node version used by project commands. Existing cache keys, artifact transfer contracts, Bun versions, and Azure OIDC/managed-identity inputs are operational contracts that must survive the major-version upgrades.

## Goals / Non-Goals

**Goals:**

- Remove every action reference GitHub currently reports as targeting Node.js 20 across the meta-repository and four child repositories.
- Move affected actions to current stable majors designed for Node.js 24, verified immediately before implementation.
- Preserve cache, artifact, Bun setup, release, security-gate, and Azure OIDC behavior.
- Keep each child repository change independently reviewable and validated.
- Add Dependabot GitHub Actions coverage, or document an explicit equivalent, in the meta-repository and each child repository.
- Confirm representative completed runs no longer emit the Node.js 20 deprecation annotation.

**Non-Goals:**

- Changing explicit project `node-version` pins, package engine declarations, or supported user runtimes.
- Downgrading or otherwise changing already-current `actions/checkout@v7`, `actions/setup-node@v6`, or `oven-sh/setup-bun@v2` references.
- Redesigning cache keys, artifact names or locations, Bun versions, workflow topology, triggers, permissions, or release authentication.
- Addressing transient cache-service HTTP errors unless they persist independently after the upgrade.
- Broad workflow refactoring.

## Decisions

### Verify action majors and migration notes at implementation time

The implementation will target the current stable major of each affected action after reviewing its release and migration notes. Planning identified `actions/cache@v6`, `actions/upload-artifact@v7`, `actions/download-artifact@v8`, `oven-sh/setup-bun@v2`, and `azure/login@v3`, but the durable requirement remains version-agnostic so future maintenance does not encode stale versions.

Pinning exact patch SHAs was considered, but the existing repositories consistently track action major tags. This change will preserve that convention and rely on dependency automation to surface future releases.

### Cover GitHub-owned and third-party JavaScript actions

The existing durable requirement is generalized from GitHub-owned actions to all JavaScript actions used by the child workflows. The warning is determined by an action's embedded runtime regardless of publisher, and issue #201 includes `oven-sh/setup-bun` and `azure/login` alongside `actions/*`.

Limiting the sweep to `actions/*` was rejected because it would leave confirmed Node.js 20 warnings unresolved.

### Preserve operational inputs and validate producer-consumer pairs

Major upgrades will change only action references unless upstream migration notes require a narrowly documented adjustment. Cache paths, keys, restore keys, artifact names, upload paths, download destinations, Bun versions, Azure identity inputs, and `id-token: write` remain unchanged. Artifact upload and download in `arashi` will be upgraded and reviewed together because they form one transfer contract.

### Add repository-local dependency automation

Each affected repository initially lacked Dependabot configuration. The preferred implementation is a repository-local `.github/dependabot.yml` entry for the `github-actions` ecosystem at `/` on a weekly schedule. If repository policy makes Dependabot unsuitable, the implementation must document the equivalent automation and how it covers all workflows.

A single meta-repository configuration was rejected because Dependabot configuration does not propagate into independently versioned child repositories.

### Use local validation plus GitHub-hosted execution evidence

Each repository will run its normal relevant validation and YAML parsing/static review before PR creation. GitHub-hosted PR checks provide the authoritative integration evidence for caches, artifacts, setup actions, and runner compatibility. Release-only and security-gate-only paths will be triggered safely where practical; otherwise their limitation and a concrete verification plan will be recorded.

Local validation alone was rejected as final proof because it cannot emulate GitHub's action service, OIDC token issuance, cache service, or artifact service.

## Risks / Trade-offs

- **Major action upgrades can change defaults or input semantics** → Review each migration note and preserve every existing input unless a targeted change is required and documented.
- **Cache behavior can regress without failing CI** → Compare keys, paths, restore keys, and completed-run cache logs across representative operating systems.
- **Artifact generation changes can break producer-consumer handoff** → Upgrade upload/download together and inspect the validation jobs' downloaded layout.
- **Azure login is skipped during release dry runs** → Preserve OIDC permissions and inputs, then validate through a safe release-path plan without using throwaway public probes.
- **Release/security workflows run infrequently** → Trigger safely when practical; otherwise document the unexercised path and post-merge verification plan.
- **Dependabot can create coordinated update noise across repositories** → Use a predictable weekly schedule and keep PRs repository-local and reviewable.
- **Floating major tags can move within a major** → Preserve project convention and use automation plus CI to surface changes; exact SHA pinning remains outside this issue.

## Migration Plan

1. Reconfirm current stable releases, embedded runtimes, migration notes, and runner requirements.
2. Update workflow action references in each owning repository without unrelated workflow changes.
3. Add or document GitHub Actions dependency automation in the meta-repository and each child repository.
4. Parse changed YAML and run each repository's relevant lint, tests, build, docs, package, or security checks.
5. Re-scan every child workflow for confirmed Node.js 20-based action majors and verify already-current references and project runtime pins are untouched.
6. Open separate cross-linked child PRs referencing issue #201 and observe required GitHub-hosted checks.
7. Exercise or document safe verification plans for release/security-only paths.
8. Confirm representative completed runs have no Node.js 20 deprecation annotation.
9. Roll back an affected child PR independently if its action upgrade changes workflow behavior.

## Open Questions

- None. Exact stable patch releases and any newly published migration notes will be reconfirmed immediately before implementation.
