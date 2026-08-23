## Context

Configured create resolves an effective `worktreesDir` base and then calculates the authoritative parent worktree destination used by both the parent repository and coordinated children. The implementation currently adds the configured repository naming component for non-bare parents and omits it for bare parents. That is inverted from the intended topology contract and from the sibling-safety motivation for the repository-aware bare default introduced by issue #232.

Repository identity, filesystem location, and branch identity are separate inputs. The repository component is already resolved as `worktreeName` when present and otherwise the repository's canonical configured name. The correction must consume that authority directly rather than derive a second name from a checkout path. Branches remain Git branch names; a slash remains a path boundary under the existing path behavior.

Existing worktrees may already use either old layout. Their lifecycle must continue through Git worktree metadata, not by reversing the new naming rule from a path.

## Goals / Non-Goals

**Goals:**

- Make newly created configured bare parents resolve beneath the effective base as `<canonical repository naming component>/<branch>`.
- Make newly created configured non-bare parents resolve beneath the effective base as `<branch>`.
- Use one immutable authoritative parent destination for parent planning, child path construction, preflight, execution, and all output renderers.
- Detect destination collisions before any create mutation.
- Preserve existing-worktree operability, slash branches, custom bases, standalone behavior, and cross-platform path semantics.

**Non-Goals:**

- Renaming or migrating an existing worktree or Git registration.
- Adding a configurable naming policy, template engine, slash-flattening policy, alternate collision name, or path-length shortening scheme.
- Guessing repository identity from linked-checkout or clone-directory basenames, Git administrative paths, remotes, or surrounding filesystem layout beyond the documented bare-source fallback.
- Changing configured child repository paths or standalone `.worktrees/<branch>` placement.

## Decisions

### 1. Separate the configured base from the topology naming component

The destination resolver first computes the existing normalized effective `worktreesDir` base. It then appends:

- bare configured parent: `<repository-component>/<branch>`;
- non-bare configured parent: `<branch>`.

A custom `worktreesDir` replaces only the base calculation. It cannot select or suppress the topology naming rule. For repository component `example`, branch `feature/auth`, and base `<root>`, the results are `<root>/example/feature/auth` for bare and `<root>/feature/auth` for non-bare.

When the bare source directory supplies the fallback naming component, a conventional terminal `.git` suffix is omitted so sibling source `/projects/example.git` and its default worktree namespace `/projects/example/` do not overlap. An explicit canonical `worktreeName` remains authoritative.

The branch is passed through unchanged to the established path join, so slash-containing branches retain nested hierarchy. No slugging or separator rewriting is introduced.

Alternative rejected: encoding repository identity into `worktreesDir` would conflate user-selected placement with the topology default and make explicit roots behave differently from defaults.

Alternative rejected: concatenating repository and branch with `-` is not an injective namespace when slash branches are preserved. Repository `example` with branch `feature/auth` and repository `example-feature` with branch `auth` would both resolve to `example-feature/auth`.

### 2. Reuse canonical configured naming authority

The planner receives the already resolved repository naming component: `worktreeName` when configured/resolved, otherwise the canonical configured repository name. It must not inspect a checkout basename or derive a name from the filesystem. That same value feeds path planning, diagnostics, tests, and output.

Alternative rejected: linked-checkout or clone-directory basename fallback can vary between clones, aliases, linked worktrees, and platform path spellings and would create a second repository identity contract.

### 3. Freeze one authoritative parent destination for coordinated planning

Configured create calculates the parent destination once and carries it as plan data. Every coordinated child destination is `parent destination + configured child path`. Preflight collision checks, human preview/result, dry-run, JSON, hook target context where applicable, and execution all consume this same frozen plan rather than recalculating topology independently.

This preserves configured child placement while correcting only the containing parent path. Nested or renamed child paths remain unchanged relative to the parent.

Alternative rejected: independently calculating child roots risks retaining the inversion or reporting one path while mutating another.

### 4. Fail destination collisions before mutation

Create completes destination and registration collision checks for the complete selected configured plan before managed create mutation. A collision blocks before workspace/repository hooks, branch creation, `git worktree add`, destination-directory creation, or other filesystem mutation. The resolver does not invent an alternate path.

Dry-run performs the same non-mutating resolution and collision analysis. Human and JSON modes project the same destination and blocker from the plan.

### 5. Treat the correction as prospective, not migratory

The new naming rule applies only when planning a destination for a newly created configured worktree. No startup, init, create, list, status, switch, remove, doctor, or prune flow renames existing directories or rewrites existing Git worktree registrations.

Existing lifecycle commands continue discovering exact paths and branches from Git worktree metadata. They do not parse a path to infer its repository or branch according to either the old or corrected naming layout. Therefore worktrees created under the inverted layout remain operable.

### 6. Keep standalone resolution isolated

Implicit standalone create remains `<main-root>/.worktrees/<branch>` with no repository prefix. The configured resolver correction is gated by configured workspace topology and cannot leak into standalone mode.

### 7. Prove portable and native behavior

Unit and integration coverage includes bare/non-bare configured parents, explicit custom bases, canonical `worktreeName` and configured-name fallback, slash-containing branches, coordinated children, collisions, existing old-layout worktrees, and human/dry-run/JSON parity using platform path APIs. Native acceptance runs on macOS, Linux, and Windows so separator and root behavior is not validated only through injected platform flags.

## Risks / Trade-offs

- **[A new destination can differ from a prior dry-run implementation]** → Build every renderer and execution from one frozen plan and compare exact paths in tests.
- **[Old and new layouts can coexist]** → Treat Git metadata as lifecycle authority and test list, status, switch, and remove against pre-existing old-layout registrations.
- **[Slash branches create nested directories]** → Preserve the existing behavior deliberately and test rollback/collision boundaries around intermediate parents.
- **[Shared bare bases can already contain a destination]** → Give each bare repository a dedicated namespace, run complete collision checks before hooks or mutation, and never choose an alternate name silently.
- **[Platform path APIs can conceal host-only assumptions]** → Add platform-neutral cases and real native CI acceptance on all supported operating systems.

## Migration Plan

1. Add CLI RED tests for corrected topology naming, canonical name authority, child paths, custom roots, slash branches, output parity, collisions, existing-worktree compatibility, and native platforms.
2. Implement the shared destination resolver and route configured planning, preflight, execution, and renderers through its frozen result.
3. Run focused and full CLI validation, then deliver and merge the CLI child PR first.
4. Re-run meta validation against the final child revision, archive/sync this OpenSpec change, and deliver the meta PR last.

No user migration step exists. Rolling back the implementation affects only future destination planning; it must not move any worktree created under either convention.

## Open Questions

None.
