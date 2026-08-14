## Context

`add.ts` currently collapses configuration authority, clone destination, repository source, and command execution into one `workspaceRoot`. The Commander wrapper already calls `findConfiguredWorkspaceRoots`, but passes only `configurationRoot` into `executeAdd`. In a normal non-bare linked parent worktree, the active checkout contains the tracked `.arashi/config.json`, so that active checkout is both the discovered configuration and execution root. The command consequently clones the new child into the active feature workspace and leaves it on the child's default branch.

Arashi already distinguishes configuration and execution roots for configured bare workspaces, and `clone.ts` can materialize a missing linked child from a central source clone. This change extends that topology model to initial repository onboarding without changing configuration schema or command options.

Constraints:

- The active feature checkout owns the tracked config change.
- The parent repository's primary non-bare worktree owns canonical child clones.
- The child canonical clone must remain on its default branch while the active child uses the parent branch.
- Bare configured roots, direct main-checkout invocation, configured-only guards, duplicate fallback, and JSON stdout isolation must not regress.
- Rollback may delete only resources created by the current invocation.

## Goals / Non-Goals

**Goals:**

- Preserve coordinated topology when `add` starts in a non-main parent worktree or a nested independent child beneath it.
- Resolve roots and branch state through Git rather than configured path naming conventions.
- Make canonical clone, coordinated branch/worktree, config, and managed-ignore changes one deterministic transaction.
- Provide stable human and JSON result roles for both direct and coordinated materialization.
- Cover real Git behavior, including custom worktree paths, slash branches, existing remote branches, and rollback.

**Non-Goals:**

- Add a new CLI option or configuration field.
- Automatically add the new repository to every pre-existing coordinated parent worktree.
- Change configured bare-workspace authority or placement.
- Change duplicate-name selection or the interactive `arashi clone` fallback.
- Implement #274's optional onboarding prompts, copy/symlink materialization, or inline hooks.
- Generalize all clone/create orchestration in this change beyond extracting a safely reusable low-level helper where needed.

## Decisions

### 1. Resolve three explicit roles

The command action will pass the full configured workspace roots into a testable add executor. The executor will resolve:

- **configuration root**: the checkout whose `.arashi/config.json` is loaded and saved;
- **execution root**: the enclosing active parent checkout where the child must be usable;
- **canonical parent root**: the primary non-bare parent worktree returned by Git for the execution root.

`resolveGitMainWorktree(executionRoot)` or an equivalent Git-common-directory helper will identify the canonical parent. No decision may depend on the literal `.arashi/worktrees/` path, the configured `worktreesDir`, or a worktree basename. Invocation from a nested independent child must first resolve the enclosing active parent through existing configured-root discovery.

A coordinated linked mode is selected only when the canonical parent is usable and differs from the active execution root. If canonical and active roots are the same, add retains direct-main behavior. If Git identifies a configured bare authority without a primary non-bare parent, add retains the existing bare behavior.

**Alternative considered:** Reuse `clone.ts`'s current string-based `resolveCoordinatedSourceWorkspaceRoot`. Rejected because custom or external worktree locations need topology-based resolution and because `add` must distinguish tracked config authority from canonical clone ownership.

### 2. Preflight all knowable active-workspace conflicts before cloning

After loading and validating active configuration and checking duplicate names, coordinated mode will resolve the active parent branch with `git symbolic-ref --short HEAD`. Detached HEAD, an empty branch, an existing active destination, or an existing canonical destination fails before clone mutation. The relative repository path is derived once from normalized configuration and resolved independently beneath canonical and active roots.

Managed-ignore handling remains before filesystem materialization, but coordinated mode must account for the selected scope before any write:

- `local` resolves the common repository exclude authority, so one reconciliation can cover both canonical and active destinations;
- `tracked` may write only the active branch's `.gitignore`; therefore the canonical destination must already be effectively ignored from the canonical checkout before active reconciliation. If it is not, `add` fails before mutation with guidance to reconcile and commit the managed rule on the branch checked out in the canonical parent checkout first. The command never edits the canonical checkout's tracked `.gitignore`;
- `none` preserves the user's explicit opt-out, performs no ignore-file writes, reports both destinations as unignored when applicable, and may continue under the existing policy;
- an existing effective user/global rule may satisfy either destination without an Arashi-owned write.

After this scope-aware gate, active reconciliation may update only the authority allowed by the canonical managed-ignore contract.

**Alternative considered:** Write the missing tracked rule into the canonical checkout automatically. Rejected because `add` invoked from a feature worktree must not dirty tracked state on main. Also rejected: proceeding under tracked scope while only the active branch covers the rule, because that would materialize an unignored canonical clone contrary to the selected policy.

**Alternative considered:** Clone first and infer the parent branch later. Rejected because detached invocation and tracked-scope canonical coverage are knowable before mutation and should fail without network or filesystem side effects.

### 3. Clone once, then materialize the coordinated branch from the canonical child

Coordinated mode will:

1. clone into the canonical child path;
2. detect and retain the clone's default branch;
3. inspect branch refs for the active parent branch;
4. create the active child worktree from the canonical clone.

Branch resolution is deterministic:

- if `refs/remotes/origin/<branch>` exists, create a local tracking branch from that ref;
- otherwise create the branch from the detected default branch;
- if the coordinated branch equals the checked-out child default branch, or a matching branch is checked out elsewhere/conflicts, fail and roll back rather than detach or invent a different name.

Branch names are passed as Git arguments, not shell-composed paths, and may contain `/`.

Direct-main and configured-bare modes retain one clone at their current destination with no extra worktree.

**Alternative considered:** Clone independently into both parent checkouts. Rejected because the active child would not be a linked worktree, would duplicate object storage, and would not participate in Git's worktree branch-safety rules.

### 4. Persist active configuration after repository materialization

The config entry remains the existing relative `repos.<name>.path` plus `gitUrl`; no schema change is needed. In coordinated mode, `saveConfig` targets the active configuration root only after the canonical clone and active child worktree both succeed. The canonical parent checkout's tracked config is not edited.

Setup-script detection runs against the checkout configured for the invoking workspace: the active child worktree in coordinated mode and the clone in single-placement mode. A requested setup template is created in that same checkout, while the returned setup path remains config-relative. Future #274 onboarding must collect values in memory and join the same final config write.

A managed-ignore-unsafe `reposDir` (including absolute paths and repository-root relative values such as `.`) cannot safely represent two independently ignored canonical and active locations. Linked-parent invocation therefore retains the existing single-placement clone behavior in the active workspace for that configuration instead of requiring repository-relative managed-ignore coverage or attempting two coordinated materializations.

Cooperating `add` invocations that belong to the same parent repository serialize the complete mutation transaction through a lock in the parent's Git common directory. The lock spans managed-ignore reconciliation, materialization, config persistence, and rollback, so canonical and linked parent checkouts cannot restore over one another. Owner metadata permits abandoned-lock recovery without stealing a live lock, and the transaction wait budget accommodates ordinary remote clone duration rather than reusing the short config-write budget.

**Alternative considered:** Update main config and rely on merge/cherry-pick. Rejected because it dirties the user's main checkout and removes the configuration change from the feature branch where the new child is being introduced.

### 5. Use an ownership ledger for reverse-order rollback

The executor will record only successful invocation-owned operations: managed-ignore changes, canonical clone, created local branch, linked worktree, and config write. Rollback runs in reverse dependency order while preserving the canonical clone as the Git common-directory owner whenever linked state survives:

1. restore active config when written;
2. remove the invocation-created linked worktree through Git, then verify both its path and worktree metadata are gone;
3. if either the linked path or its worktree metadata survives, retain the canonical clone and coordinated branch, stop dependent destructive cleanup, and report incomplete rollback;
4. only after linked path and metadata removal are verified, delete the invocation-created child branch when Git proves it is not checked out, then remove the invocation-created canonical clone;
5. restore managed-ignore state only when no applicable materialized/config state survives.

Pre-existing paths, refs, config entries, and user-authored ignore content are never removed. Cleanup failures are accumulated with final observed path/worktree-metadata/ref/config state and reported alongside the initiating error. A surviving linked worktree or worktree-metadata record always retains its canonical clone, coordinated branch, and required managed-ignore coverage so rollback cannot orphan or corrupt it.

### 6. Extend results without changing the existing config-relative path

The existing JSON envelope and `repository.path` remain. `repository.path` continues to be the config-relative repository path. Add results also expose:

- `materialization`: `"clone"` or `"coordinated-worktree"`;
- `canonicalPath`: normalized absolute canonical clone path;
- `worktreePath`: normalized absolute linked child path, or `null` for direct/bare cloning;
- `defaultBranch`: detected child default branch;
- `coordinatedBranch`: active parent branch, or `null` when no linked child was created;
- `setupScript`: the existing config-relative setup-script path, or `null`, with `setupScriptCreated` retaining its boolean contract.

Human output labels the canonical clone and, when present, active worktree and coordinated branch separately. JSON mode emits exactly one envelope and no spinners, prompts, or human summaries on stdout. Structured failures include rollback/final-state details without creating a second document.

### 7. Enforce companion guidance through existing contract pipelines

The CLI command registry does not change, but generated semantic contract metadata and tests will describe the new materialization/result policy. Canonical CLI docs, website add/workflow guidance, generated agent-readable exports, and packaged skill references will explain where the canonical clone and active child are created. Existing repository-local and meta cross-repository checks will be extended only where they currently own add-command guidance.

## Risks / Trade-offs

- **A remote feature branch may already exist.** → Inspect exact refs and create a local tracking branch from `origin/<branch>` rather than silently basing it on the default branch.
- **The coordinated name may equal the child's checked-out default branch.** → Fail and fully roll back; do not detach the canonical clone or violate the requested default-branch invariant.
- **Git worktree creation can partially materialize metadata or a directory.** → Record operation completion conservatively; if path or metadata cleanup fails, retain the canonical common-directory owner and report incomplete rollback.
- **A config write can fail after both repository locations exist.** → Keep an original config snapshot and remove only invocation-created worktree/clone state; canonical deletion is gated on verified linked path and metadata removal before restoring managed-ignore changes.
- **Absolute result paths expose machine-local layout.** → They are already represented in diagnostics and are necessary to distinguish roots; preserve the existing config-relative `repository.path` for portable automation.
- **Concurrent processes may create a destination/ref after preflight.** → Rely on Git/filesystem create operations to fail closed and never overwrite or clean up state not proven invocation-owned.
- **Companion work can expand scope.** → Update only existing add command/workflow guidance and current deterministic contract owners; do not introduce a new documentation architecture.

## Migration Plan

1. Add real-Git RED fixtures and focused result/rollback tests on the CLI child branch.
2. Implement the topology-aware executor and ownership ledger, then make focused and full CLI gates green.
3. Update and validate CLI contract metadata, docs, generated exports, and packaged skill guidance on their owning branches.
4. Open child PRs, merge verified child PRs first, then archive/sync this OpenSpec change and merge the meta PR last.

No persisted config migration or release sequencing gate is required because the configuration shape is unchanged. Rollback is a normal package rollback; existing configs continue to use direct behavior on older versions.

## Open Questions

None. The accepted issue defines active-config ownership, main-source placement, coordinated branch naming, and preserved bare behavior.
