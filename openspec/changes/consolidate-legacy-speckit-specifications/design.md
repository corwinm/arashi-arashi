## Context

The repository contains 39 numbered Spec Kit directories (326 tracked files), 15 `.specify/` toolkit files, and nine `/speckit.*` OpenCode commands alongside 69 canonical OpenSpec capabilities and the active `/opsx-*` workflow. The legacy material mixes durable product decisions, implementation-era plans, completed checklists, exploratory research, and contracts that were later superseded.

This migration must remove the duplicate system without treating every old sentence as current policy. Canonical OpenSpec and verified current implementation behavior outrank stale Draft-era assumptions; Git history remains the archive for removed source artifacts.

## Goals / Non-Goals

**Goals:**

- Give every numbered legacy directory an explicit disposition.
- Port still-current behavior that has no canonical OpenSpec owner.
- Keep capability boundaries behavioral rather than mirroring old directory or internal-module boundaries.
- Remove active Spec Kit tooling and stale contributor guidance.
- Leave the repository with one specification workflow and a structural regression guard.

**Non-Goals:**

- Change Arashi CLI runtime behavior.
- Recreate legacy plans, tasks, checklists, conceptual OpenAPI wrappers, or internal TypeScript API contracts in OpenSpec.
- Preserve obsolete thresholds, package-manager assumptions, command options, or repository topology merely because they appeared in a Draft artifact.
- Rewrite archived OpenSpec changes, which remain historical evidence.

## Decisions

### 1. Port capability baselines, not legacy directories verbatim

A legacy requirement is ported only when it is durable, matches verified current behavior, and lacks a canonical OpenSpec owner. Later OpenSpec capabilities and current implementation/tests resolve conflicts with early Draft assumptions.

**Alternatives considered:**

- Mechanical one-directory-to-one-capability conversion: rejected because it would canonize stale internal architecture and duplicate later capability specs.
- Delete all legacy files without porting: rejected because baseline behavior for list, setup, sync, CI, release, configuration, interaction, docs, add, create, and status is not fully owned today.

### 2. Consolidate related gaps into stable behavioral capabilities

The migration introduces focused baselines for shared CLI interaction, coordinated create, documentation site behavior, list, CI, release, setup, specification workflow, sync, and workspace configuration. Basic add behavior joins the existing `coordinated-add-materialization` capability; status output joins `status-command`.

This avoids reviving internal-module capabilities such as “git utility library,” “filesystem utilities,” “logger utilities,” or “prompt utilities.”

### 3. Record a complete legacy disposition matrix

| Legacy directory | Disposition / canonical owner |
| --- | --- |
| `001-git-worktree-manager` | Port missing create, list, setup, interaction, and configuration baselines; later capability specs own the rest. |
| `002-git-worktree-research` | Delete as historical research; current Git/worktree contracts are behavior-specific. |
| `003-research-tasks` | Delete as historical research; current package, test, CI, and interaction capabilities own durable outcomes. |
| `004-design-issues` | Delete as completed design-phase history; no standalone product capability. |
| `005-git-utility-lib` | Delete internal API design; user-observable Git behavior remains in command capabilities. |
| `006-config-management` | Port current shared load/validation/preservation/persistence behavior to `workspace-configuration`. |
| `007-filesystem-utilities` | Delete internal API design; ownership and filesystem safety remain command-specific. |
| `008-logger-utilities` | Port terminal color/capability behavior to `cli-interaction-conventions`; delete internal logger API. |
| `009-prompt-utilities` | Port cancellation/interrupt/terminal-restoration behavior to `cli-interaction-conventions`; delete generic prompt API. |
| `010-github-issues` | Delete obsolete hook-era artifact; lifecycle hook capabilities supersede it. |
| `011-repository-management` | Delete internal discovery/clone API design; add/materialization and workspace capabilities own current behavior. |
| `012-rollback-mechanism` | Delete generic operation-log architecture; command capabilities own scoped rollback and partial-failure contracts. |
| `013-worktree-orchestration` | Port coordinated create preflight, conflict, execution, rollback, and result baselines. |
| `014-ci-workflow` | Port current CI trigger, quality, platform-build, validation, and reporting baseline to `project-ci`. |
| `015-init-command` | Delete as superseded by init, managed-ignore, hook, and standalone-workspace capabilities. |
| `016-nested-worktree-paths` | Delete as superseded by configurable location and authoritative destination planning. |
| `017-list-command` | Port current list discovery and output modes to `list-command`. |
| `018-add-command` | Add basic validation, naming, clone, persistence, and cleanup requirements to `coordinated-add-materialization`. |
| `019-release-workflow` | Port semantic-release and complete supported publication baseline to `release-workflow`. |
| `020-status-command` | Add retained default/verbose/compact output and continuation semantics to `status-command`. |
| `021-remove-command` | Delete as superseded by coordinated removal, dry-run, pruning, hook, and interaction capabilities. |
| `023-fix-remove-confirmation` | Delete after shared cancellation and existing remove selection contracts cover the durable behavior. |
| `024-fix-remove-grouping` | Delete as superseded by path-based descendant planning and pruning capabilities. |
| `025-pull-command` | Delete as superseded by `coordinated-pull`; do not port stale timing/presentation detail. |
| `026-sync-command` | Port current branch alignment, selection, continuation, and result behavior to `sync-command`. |
| `027-rework-hooks` | Delete as superseded by lifecycle, scope, input, inline, and global hook capabilities. |
| `028-fix-create-dry-run` | Delete as superseded by create planning, machine-readable output, and materialization preview requirements. |
| `029-implement-setup-command` | Port current target discovery, ordering, filtering, execution, and summaries to `setup-command`. |
| `030-setup-oxlint-oxfmt` | Port maintained lint/format quality gates into `project-ci`; delete tool-setup history. |
| `031-audit-readmes` | Preserve current onboarding ownership through `specification-workflow` and modified README guidance; delete audit evidence. |
| `032-fix-bare-create-command` | Delete as superseded by repository-aware init, standalone/configured resolution, and destination planning. |
| `033-skills-sh-integration` | Delete as superseded by authored/packaged skill guidance and security/release capabilities. |
| `034-init-docs-site` | Port public docs repository, validation, publication, and discovery baseline to `documentation-site`. |
| `035-update-docs-domain` | Port the canonical public domain rule to `documentation-site`; delete one-time migration inventory. |
| `036-add-logo-assets` | Port coherent cross-surface branding baseline to `documentation-site`. |
| `038-add-install-script` | Delete as superseded by POSIX/npm/Windows installer and ownership capabilities. |
| `039-fix-windows-cli` | Delete as superseded by npm binary and Windows PowerShell installer capabilities. |
| `040-fix-safari-hero-image` | Port resilient supported-browser hero-media behavior to `documentation-site`. |
| `041-fix-child-repo-hooks` | Delete as superseded by current configured create lifecycle and context requirements. |

Directories `022-*` and `037-*` do not exist.

### 4. Delete the retired workflow as one atomic tracked-source migration

After deltas validate, remove `specs/`, `.specify/`, and `.opencode/command/speckit.*.md`; retain `/opsx-*` commands and OpenSpec skills. Update `.gitignore`, README, CONTRIBUTING, and process docs in the meta-repository, plus the CLI repository's canonical contribution pointer, so no active guidance points at deleted paths.

### 5. Use a structural test, not prose policing

A focused meta-repository test will assert that canonical OpenSpec paths and commands exist while retired top-level Spec Kit directories and command assets do not. It will not enforce broad documentation wording through brittle natural-language assertions. A narrow CLI repository test will pin the canonical contribution pointer to OpenSpec and reject the exact retired process label. Stale-reference checks remain an explicit migration verification command.

## Risks / Trade-offs

- **[Risk] A durable legacy requirement is omitted.** → Mitigation: retain the disposition matrix, author scenario-complete capability deltas, compare them against current CLI tests/source, and run an independent scope review.
- **[Risk] Stale Draft behavior becomes a new contract.** → Mitigation: current implementation and later canonical specs outrank legacy text; omit abandoned options and conceptual wrappers.
- **[Risk] Large deletions obscure substantive additions.** → Mitigation: review OpenSpec additions and docs changes separately from the mechanical removal; report counts and path sets programmatically.
- **[Risk] External links to old files break.** → Mitigation: GitHub history preserves committed files; current repository guidance points only to canonical OpenSpec paths.
- **[Risk] The structural guard becomes overly broad.** → Mitigation: assert exact retired paths and command filename patterns only; allow historical terms inside archived OpenSpec records.

## Migration Plan

1. Author and strictly validate all new and modified OpenSpec capability deltas.
2. Add the structural regression test and prove it fails against the legacy tracked layout.
3. Remove retired Spec Kit specs, toolkit, commands, and ignore rules.
4. Rewrite active onboarding/process docs around `/opsx-propose`, `/opsx-apply`, and `/opsx-archive`, including the CLI repository's canonical contribution pointer.
5. Run strict OpenSpec validation, cross-repository stale-reference scans excluding intentional archives, formatting, typechecking, tests, and contract checks.
6. Independently review both exact repository diffs and the migration matrix before coordinated delivery.

Rollback is a normal Git revert; no runtime state, user data, or external publication format changes.

## Open Questions

None. Any newly discovered current behavior without an owner is added to the closed capability manifest before removal; stale or unimplemented Draft behavior is documented as intentionally not ported.
