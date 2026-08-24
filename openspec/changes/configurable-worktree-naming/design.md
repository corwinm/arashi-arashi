## Context

Issue #323 corrected configured worktree defaults so bare parents use `<repository>/<branch>` and non-bare parents use `<branch>` beneath the effective `worktreesDir`. The CLI now computes a complete ordered destination plan in `calculateWorktreePathPlan`, passes the planned parent destination to coordinated children, rejects occupied destinations in command-level preflight, and exposes the same planned paths through human and JSON renderers.

Issue #322 adds a constrained root configuration policy on top of that corrected baseline. The policy affects only newly planned configured filesystem destinations. Git branch identity, standalone mode, existing Git registrations, coordinated child-relative paths, output envelope shapes, and collision behavior remain authoritative compatibility boundaries.

The change crosses the CLI configuration model/schema, path planner, configured create orchestration, renderers, tests, canonical documentation, generated agent exports, and packaged guidance. It therefore requires explicit design and cross-repository validation before implementation.

## Goals / Non-Goals

**Goals:**

- Accept only the closed `worktreeNaming.style` and `worktreeNaming.branchSlashes` value sets.
- Make omission and explicit `current`/`preserve` equivalent to the corrected #323 defaults without persisting a migration.
- Keep Git branch names exact while deterministically mapping their `/` separators for filesystem placement.
- Compute one immutable ordered destination plan before any create mutation and consume it everywhere.
- Reject naming-derived path aliases and occupied destinations deterministically without inventing a suffix.
- Preserve coordinated child placement, standalone behavior, existing-worktree metadata authority, and public output envelope compatibility.
- Keep configuration/schema/docs/generated exports synchronized and validate portable behavior on supported native platforms.

**Non-Goals:**

- Arbitrary templates, interpolation, dates, usernames, environment values, network values, shortening, hashes, or automatic alternate names.
- Absolute or clone-local worktree-root overrides.
- Git branch transformation or new Git branch validation rules.
- Renaming or migrating existing worktrees.
- Per-child naming policies or changes to configured child checkout paths.
- Adding these nested fields to interactive `aw configure`; the initial slice accepts authored configuration and documents it without expanding that command's current flat descriptor model.

## Decisions

### 1. Normalize a closed root policy without migrating omitted fields

Add exported configuration types equivalent to:

```ts
type WorktreeNamingStyle = "current" | "branch" | "repo-branch";
type WorktreeBranchSlashes = "preserve" | "flatten";

interface WorktreeNamingConfig {
  style?: WorktreeNamingStyle;
  branchSlashes?: WorktreeBranchSlashes;
}
```

`Config.worktreeNaming` is optional. Loading validates that the value is an object with only supported enum values. The effective policy is `{ style: "current", branchSlashes: "preserve" }`; normalization and persistence preserve omission rather than writing defaults into existing files. Invalid object shapes or enum values fail through the established invalid-configuration path before configured create planning or mutation.

The generated JSON Schema is produced from the typed model, keeps both nested properties optional, and rejects unsupported values. Maintained examples explain defaults rather than relying only on schema annotations.

**Alternative considered:** a single string enum combining topology and slash behavior. Rejected because it creates a Cartesian product, obscures independent defaults, and makes future compatible additions harder.

### 2. Convert Git branch separators explicitly, then compose naming components

Git branch names use `/` independent of host path separators. The resolver splits the already validated branch name on literal `/` into non-empty components and never changes the original branch value passed to Git.

For `branchSlashes: "preserve"`, the branch filesystem representation remains those components. For `flatten`, it becomes one component joined with `-`. The style then composes the parent-relative destination:

| Style         | Non-bare                                                                                                                                                    | Bare                                             |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `current`     | branch representation                                                                                                                                       | repository component, then branch representation |
| `branch`      | branch representation                                                                                                                                       | branch representation                            |
| `repo-branch` | repository component prefixed to the first branch component with `-`, followed by remaining preserved components; or one fully flattened prefixed component | same as non-bare                                 |

Examples for repository `example` and branch `feature/auth`:

| Style              | Slash policy | Relative destination   |
| ------------------ | ------------ | ---------------------- |
| `current` non-bare | preserve     | `feature/auth`         |
| `current` bare     | preserve     | `example/feature/auth` |
| `current` bare     | flatten      | `example/feature-auth` |
| `branch`           | preserve     | `feature/auth`         |
| `branch`           | flatten      | `feature-auth`         |
| `repo-branch`      | preserve     | `example-feature/auth` |
| `repo-branch`      | flatten      | `example-feature-auth` |

The existing resolved `worktreeName`/canonical configured-name authority remains the repository component. A conventional terminal `.git` is omitted only by the existing bare fallback rule. The complete candidate is resolved beneath the effective worktree base and must remain contained by that base according to the existing configured destination safety semantics.

**Alternative considered:** preserve repository and branch as separate path components for `repo-branch`. Rejected because the issue deliberately defines a hyphen-prefixed directory style and names it `repo-branch`; changing it to `repo/branch` would duplicate corrected bare `current` rather than provide the requested policy.

### 3. Extend the existing immutable destination plan rather than adding renderer-specific resolution

`calculateWorktreePathPlan` remains the single configured-create planning boundary. It receives the normalized effective policy, computes the parent first, and passes that exact parent path to every selected child. Child paths remain `authoritativeParentWorktreePath + configured child path` and never independently apply parent naming policy.

Command preflight freezes the ordered plan before managed-ignore reconciliation, hooks, branch creation, directory creation, or `git worktree add`. Human preview, dry-run, JSON success/plans/errors, execution, lifecycle context, materialization, and rollback ownership consume the same records. No renderer reconstructs a path from repository or branch labels.

**Alternative considered:** apply naming inside each existing `calculateWorktreePath` caller. Rejected because divergent callers would recreate the inconsistency and partial-mutation risks that #323 removed.

### 4. Treat flattened aliases as ordinary deterministic destination collisions

Flattening is intentionally non-injective: `feature/auth` and `feature-auth` can resolve to one path. The planner does not append a suffix or hash. Existing filesystem occupancy and Git worktree registration checks run against the resolved candidate before mutation and return the established `WORKTREE_DESTINATION_COLLISION` result naming the first conflicting ordered plan record.

Exact live registered worktree reuse remains governed by the established branch-and-canonical-path rules; a registration for a different branch at the same flattened destination is a collision. Parent-first, then configured selected-child order determines the public first conflict when multiple candidates collide.

**Alternative considered:** a stable hash or incrementing suffix. Rejected as out of scope and because it would make a configured policy's destination unpredictable.

### 5. Preserve metadata-driven existing and standalone workflows

The policy is consulted only while planning new configured worktrees. `list`, `status`, `switch`, `remove`, and existing-worktree reuse continue reading Git worktree metadata and do not reverse or reapply naming rules. Changing configuration never renames a path or registration.

Standalone remains `<main-root>/.worktrees/<branch>` with slash preservation and ignores `worktreeNaming` because standalone has no persisted configured workspace policy. Coordinated children retain their configured path beneath the exact parent destination.

### 6. Keep public output shapes stable while changing destination values

Human create output and dry-run preview show the exact planned destination. JSON continues using:

- success `data.repositories[].worktreePath`;
- dry-run `data.dryRunOutcome.plannedWorktrees[].worktreePath`;
- collision `error.details.conflict.repositoryName` and `.worktreePath` with code `WORKTREE_DESTINATION_COLLISION`.

Record ordering, omission/null rules, one-document stdout isolation, and existing fields do not change. Invalid naming configuration uses the established configuration failure envelope and is distinct from a resolved-path collision.

### 7. Keep authored and generated guidance coordinated

The CLI owns the generated JSON Schema and maintained README/config guidance. The docs repository owns the canonical workflow/configuration explanation and regenerates public Markdown/agent exports. The packaged skill is audited for concrete configured path claims and receives concise configuration guidance only where required; correct standalone and metadata-driven guidance remains unchanged. Cross-repository checks must fail when closed enum values, defaults, or example destinations drift.

## Risks / Trade-offs

- **Flattened names can alias literal hyphenated branch names** → deterministic pre-mutation collision reporting; no suffix fallback.
- **`repo-branch` can be ambiguous as a textual encoding across unrelated repositories sharing one base** → collisions are detected against actual filesystem/Git state; arbitrary global injective encoding is intentionally out of scope.
- **Host path APIs may interpret separators differently** → split Git branch names on literal `/`, compose with platform path functions, and run platform-neutral plus native macOS/Linux/Windows tests.
- **A caller could bypass the authoritative planner** → regression tests cover human/dry-run/JSON/execution parity and coordinated child paths; repository searches and staged-diff review audit all planner call sites.
- **Invalid nested config could be partially normalized** → validate the object and both closed enums before returning configured context; test no hooks, branches, directories, managed-ignore writes, or Git registrations.
- **Docs/schema could drift across repositories** → add focused source/package/export checks and run the coordinated aggregate after child changes.

## Migration Plan

1. Add CLI RED tests for config normalization/schema, all style/slash combinations, corrected omission/current defaults, branch identity, containment, collisions, renderers, coordinated children, standalone, existing worktrees, and native platforms.
2. Implement configuration and the shared destination-policy helper, then route only the existing authoritative configured plan through it.
3. Run focused and complete CLI validation and exact-head native CI; merge the CLI child PR first.
4. Add authored docs and any necessary packaged guidance with RED drift checks, regenerate exports, validate packages/sites, and merge companion PRs.
5. Record merged child SHAs in the proposal branch, rerun coordinated validation against child `main`, archive/sync the OpenSpec change, and merge the meta PR last.

Rollback is a normal code/docs revert. Because no configuration migration or existing-worktree rename occurs, reverting returns newly planned worktrees to corrected topology defaults while leaving every existing registration at its actual path.

## Resolved Questions

- **Meaning of bare `current`:** The live issue initially contained a stale hyphenated bare example that contradicted its `current === omission` requirement and merged #323. The issue body now defines bare `current + preserve` as `<repository>/<branch>`, bare `current + flatten` as `<repository>/<flattened-branch>`, and reserves the hyphen prefix for `repo-branch`.
- **Interactive configuration:** The initial slice deliberately excludes interactive `aw configure` support. Canonical website and packaged guidance must say to edit `.arashi/config.json` directly so authored-config acceptance is not mistaken for a new interactive descriptor.

No implementation questions remain. Invalid configuration, separator mapping, `repo-branch` composition, collision precedence, output fields, and compatibility boundaries are defined above.
