## ADDED Requirements

### Requirement: Delete is the configured repository lifecycle inverse

Arashi SHALL provide `aw delete <repository>` as the destructive inverse of configured `aw add`, SHALL interpret `<repository>` only as an exact canonical `repos.<repository>` key, and SHALL keep `aw remove` dedicated to branch/worktree removal. Delete SHALL reject implicit standalone/zero-config workspaces and SHALL NOT delete remote repositories or remote branches.

#### Scenario: Exact configured key is selected

- **WHEN** a user runs `aw delete api` and `repos.api` exists in the active configured workspace
- **THEN** Arashi plans deletion for exactly `repos.api`
- **AND** does not treat `api` as a path, branch, fuzzy match, or alias

#### Scenario: Key is absent

- **WHEN** the exact configured repository key does not exist and no valid receipt proves the configuration-removal phase completed
- **THEN** Arashi fails with `DELETE_REPOSITORY_NOT_FOUND`
- **AND** performs no filesystem, Git, hook, configuration, ignore, or remote mutation

#### Scenario: Standalone workspace invokes delete

- **WHEN** delete is invoked from an implicit standalone workspace
- **THEN** Arashi returns the configured-workspace-required failure for command `delete`
- **AND** does not infer a repository from the current Git checkout

#### Scenario: Remove retains its meaning

- **WHEN** command registration, help, or execution is inspected
- **THEN** `delete` owns configured repository dependency deletion
- **AND** `remove` retains branch/worktree selection and does not accept a hidden repository-deletion alias

### Requirement: Deletion planning resolves independent configuration and Git authorities

Before any mutation, Arashi SHALL resolve the active parent configuration authority and compute `configuredActivePath` exactly once: an absolute configured path remains absolute, while a relative path resolves beneath the active execution root, both normalized without following links. This config-derived leaf is the initial authority independent of filesystem existence. Arashi SHALL then independently resolve exact configuration bytes/entry, child Git common-directory/primary identity, local refs/commits, hooks, and worktrees. The accepted clone-owned path set SHALL contain only `configuredActivePath`, the primary worktree reported by that same common directory, and exact NUL-delimited worktree paths reported by that common directory, each independently passing URL/common-dir/no-follow identity. No sibling, lexical prefix, or other common-directory path is admitted. Records SHALL preserve main/bare, branch/detached OID, locked reason, and prunable state; malformed, duplicate, or unknown ownership SHALL fail closed.

#### Scenario: Direct main parent invokes delete

- **WHEN** delete is invoked from the configured parent's primary checkout
- **THEN** planning binds configuration to that checkout and resolves the configured child through its Git common directory
- **AND** inventories every worktree registered by that child clone

#### Scenario: Linked parent invokes delete

- **WHEN** delete is invoked from a linked parent worktree
- **THEN** planning binds configuration to that active parent checkout
- **AND** independently resolves the canonical child clone plus the active and other linked child worktrees from Git common-directory metadata

#### Scenario: Nested child path invokes delete

- **WHEN** delete is invoked beneath a configured child nested inside a linked parent worktree
- **THEN** configured-root discovery walks through the unrelated child Git boundary to the active parent execution root
- **AND** resolves the selected child from the same active configuration authority

#### Scenario: Custom configured locations are used

- **WHEN** `reposDir`, `worktreesDir`, or `repos.<repository>.path` uses a supported custom relative or absolute location
- **THEN** planning uses normalized configured and Git-authoritative roots
- **AND** does not require default directory names or branch-shaped paths

#### Scenario: Absolute configured authority is external

- **WHEN** the exact normalized configured repository projection is an absolute path outside the active checkout
- **THEN** that exact config-derived leaf is initial authority before existence/Git probing, and only its same-common-directory primary/registered paths may join the clone-owned set after independent URL/common-dir/no-follow validation
- **AND** no sibling, lexical prefix, similarly named external path, or other common-directory path is admitted

#### Scenario: Worktree records include lifecycle states

- **WHEN** NUL-delimited worktree inventory contains locked, prunable, detached, main, or ordinary branch records
- **THEN** locked records block deletion, exactly absent prunable records become owned metadata items, present prunable records are treated as live worktrees, and detached OIDs are preserved
- **AND** malformed or duplicate records fail before mutation

#### Scenario: Configured bare parent invokes delete

- **WHEN** delete is invoked through a configured bare parent with its existing canonical configuration authority
- **THEN** planning retains the bare parent as configuration authority
- **AND** resolves child canonical and linked-worktree identity through child Git topology

#### Scenario: Topology cannot prove identity

- **WHEN** the configured path is missing unexpectedly, not Git, belongs to another Git common directory, ambiguously aliases multiple identities, or resolves to the parent/meta repository
- **THEN** planning fails with `DELETE_TOPOLOGY_INVALID`
- **AND** `--force` cannot bypass the failure

#### Scenario: Configured and repository URLs are compared

- **WHEN** the configured `gitUrl` and child remotes use Git URL rewrites, SCP/SSH variants, trailing `.git`/slash differences, host-case differences, or local/file paths
- **THEN** planning normalizes them without network access and requires at least one matching fetch URL
- **AND** push-only, missing, ambiguous, or mismatched URLs do not establish ownership

### Requirement: Deletion scope is complete and minimal

The plan SHALL include the selected child's canonical clone, all owned linked worktrees and stale owned registrations including coordinated descendants under other parent worktrees, child-local branch/tag/stash/detached-commit refs that cease to exist, the temporary resume-receipt path, the complete active `repos.<repository>` entry, and only exact canonical workspace-root `pre-create.<repository>` and `post-create.<repository>` active files/templates. It SHALL preserve all unrelated configuration, managed-ignore policy, shared hooks, and user-global hooks.

#### Scenario: Complete repository entry is planned

- **WHEN** the selected entry contains `gitUrl`, `path`, `baseBranch`, `groups`, `copy`, `symlink`, and inline `hooks`
- **THEN** one config-entry item plans removal of the complete `repos.<repository>` value
- **AND** no field in another repository, `meta`, defaults, root groups, or shared hook configuration is planned

#### Scenario: Coordinated descendants exist

- **WHEN** the child clone owns worktrees nested beneath several linked parent worktrees, including branch names containing `/`
- **THEN** every registered child worktree is present exactly once in the plan
- **AND** worktree removal order is deepest physical descendant first with deterministic normalized-path ties

#### Scenario: Stale owned worktree metadata exists

- **WHEN** the selected child common directory contains a stale registration whose filesystem path is exactly absent
- **THEN** the plan includes one owned worktree-metadata item for that registration
- **AND** cleanup occurs only after filesystem removal for present owned worktrees succeeds

#### Scenario: Repository-local hooks exist inside the child

- **WHEN** the child repository contains `.arashi/hooks` files
- **THEN** those files are covered only by canonical clone/worktree ownership
- **AND** no separate path broadening is needed to remove them

#### Scenario: Workspace-targeted hook files exist

- **WHEN** canonical discovery finds exact active native files for logical names `pre-create.<repository>` or `post-create.<repository>` or a concrete inert template formed only by appending `.example` to one exact active candidate path
- **THEN** each exact path is planned as a workspace-hook item
- **AND** hook contents are not read or emitted

#### Scenario: Concrete and generic templates coexist

- **WHEN** `pre-create.api.sh.example` or its exact native Windows equivalent coexists with literal generic `pre-create.<repo>.sh.example` or `pre-create.REPO.ps1.example`
- **THEN** only the concrete exact-key template is planned
- **AND** every generic placeholder template is preserved

#### Scenario: Shared and global hooks exist

- **WHEN** workspace-shared or user-global repository-targeted hook paths exist
- **THEN** shared hooks are excluded and repository-targeted user-global paths are reported as preserved-global-hook guidance
- **AND** no user-global file is removed

#### Scenario: Managed ignore state exists

- **WHEN** managed-ignore policy covers `reposDir` or `worktreesDir`
- **THEN** deletion preserves the policy and every owning tracked/local preference file
- **AND** no ignore reconciliation is performed merely because the selected or last repository is deleted

### Requirement: Structural filesystem and hook safety is non-overridable

Arashi SHALL validate existing target kind, physical containment, canonical identity, and every existing ancestor with fail-closed metadata inspection. Only `ENOENT` SHALL be treated as absence. A path escape, symlink/junction target or ancestor, unexpected non-file hook candidate, parent/meta identity, unrelated common directory, or canonical hook ambiguity SHALL block planning and SHALL NOT be overridden by `--force`. Canonical clone and hook deletion SHALL use same-parent atomic quarantine rename followed by moved-object identity verification before recursive/unlink removal; linked worktrees SHALL be removed only through Git from the exact refreshed registration. Unsupported no-follow/identity primitives SHALL fail rather than degrade to path-only recursion.

#### Scenario: Path escapes an authoritative root

- **WHEN** a configured, worktree, clone, or hook path resolves outside its accepted authoritative root
- **THEN** planning fails with `DELETE_PATH_UNSAFE`
- **AND** performs no deletion or config edit

#### Scenario: Symlink or junction is encountered

- **WHEN** a target or existing ancestor traverses an unexpected symbolic link, junction, or physical alias
- **THEN** planning fails closed before mutation
- **AND** reports sanitized path/identity context without following the target for deletion

#### Scenario: Metadata inspection fails

- **WHEN** `lstat`, canonicalization, directory enumeration, or Git metadata inspection fails for a reason other than exact absence
- **THEN** planning fails rather than treating the target as missing or completed

#### Scenario: Target is swapped at the destructive boundary

- **WHEN** a planned clone/hook or ancestor identity changes before atomic quarantine, or the quarantined object does not match the planned identity
- **THEN** delete fails without recursively deleting the replacement
- **AND** restores a moved mismatched object when that restoration is itself identity-safe

#### Scenario: Hook logical name is ambiguous

- **WHEN** canonical lifecycle discovery finds multiple active native candidates, an inline/file collision affecting the deletion candidate, an unexpected file kind, or another ambiguous owner for one targeted logical name
- **THEN** planning fails with `DELETE_HOOK_AMBIGUOUS`
- **AND** neither `--force` nor `--dry-run` returns an accepted deletion plan

### Requirement: Git data-loss checks cover worktrees and local refs

Before confirmation, Arashi SHALL inspect every owned worktree for tracked, staged, untracked, conflicted, and ignored changes and SHALL inspect local heads, tags, stash, and detached checked-out commits for reachability from locally available remote-tracking commit evidence. It SHALL peel annotated/lightweight tags to commits for this commit-loss check, disclose tag refs/metadata, and SHALL NOT claim to protect reflog-only unreachable objects. Dirty or apparently unpublished/unmerged live-ref state SHALL block deletion unless `--force` is supplied; the accepted forced plan SHALL still disclose every overridden blocker. Planning SHALL NOT fetch, push, or otherwise mutate remotes.

#### Scenario: Any worktree state would be lost

- **WHEN** any owned worktree contains tracked, staged, untracked, conflicted, or ignored local changes
- **THEN** planning records a `DELETE_GIT_DATA_LOSS` blocker with sanitized worktree/file status
- **AND** mutation without `--force` is rejected

#### Scenario: Local branch is ahead or local-only

- **WHEN** a local branch tip is not reachable from locally available remote-tracking commit evidence
- **THEN** planning records the full local ref and immutable tip OID as protected data
- **AND** mutation without `--force` is rejected

#### Scenario: Stash or detached commit is local-only

- **WHEN** `refs/stash` or a detached checked-out commit is not reachable from local remote-tracking evidence
- **THEN** the protected commit is disclosed without commit-message/body output
- **AND** mutation without `--force` is rejected

#### Scenario: Local tag peels to a unique commit

- **WHEN** a local tag peels to a commit not reachable from locally available remote-tracking commit evidence
- **THEN** adjacent deterministic local-ref items record `refs/tags/<name>` with the exact tag object OID and `refs/tags/<name>^{}` with the peeled commit OID
- **AND** the peeled item is a blocker and deletion requires `--force`

#### Scenario: Reflog-only object exists

- **WHEN** an object is reachable only from a reflog and from no live local branch, tag, stash, detached checked-out HEAD, or remote-tracking ref
- **THEN** deletion does not claim that the bounded live-ref safety model preserves that object
- **AND** the plan warning states that reflog-only objects are outside the publication check

#### Scenario: Git evidence is unavailable or malformed

- **WHEN** local ref, object reachability, or status evidence cannot be read completely
- **THEN** planning fails closed as Git data-loss risk
- **AND** does not fabricate a clean state

#### Scenario: Force accepts only data-loss risk

- **WHEN** `--force` is supplied and all non-overridable structural checks pass
- **THEN** confirmation and Git data-loss blockers become disclosed warnings in the accepted plan
- **AND** topology, path, symlink, hook ambiguity, identity, and concurrent-config checks remain enforced

### Requirement: Preview and confirmation use the accepted immutable plan

`--dry-run` SHALL display/return the complete plan without mutation. A clean human TTY mutation without `--force` SHALL display the exact repository key, canonical clone, linked worktrees, local refs, config field/file, targeted local hook paths, protected Git state, and preserved global hook paths, then require one explicit default-no destructive confirmation. A dirty mutation without `--force` SHALL stop at Git-loss refusal; a clean non-TTY or JSON mutation without `--force` SHALL fail with confirmation guidance and SHALL NOT prompt.

Failure precedence SHALL be: CLI parse; configured workspace/config load; exact key lookup; topology/path/hook/Git inspection; complete plan; Git-loss refusal; dry-run success; confirmation requirement or prompt; post-lock invalidation/concurrent change; execution failure; partial failure after any irreversible completion. Therefore a dirty TTY/non-TTY/JSON mutation without `--force` SHALL return `DELETE_GIT_DATA_LOSS` exit `1` without prompting; only a clean TTY mutation may prompt, and a clean non-TTY/JSON mutation without force SHALL return `DELETE_CONFIRMATION_REQUIRED` exit `2`.

#### Scenario: Dirty TTY mutation omits force

- **WHEN** a TTY mutation has any Git-loss blocker and omits `--force`
- **THEN** delete returns `DELETE_GIT_DATA_LOSS` before confirmation and performs no mutation
- **AND** the user may inspect with dry-run or explicitly accept with force

#### Scenario: Human dry-run previews deletion

- **WHEN** a user runs `aw delete <repository> --dry-run`
- **THEN** Arashi prints the deterministic complete plan and warnings
- **AND** does not prompt, acquire/create a transaction lock, or mutate Git, filesystem, hooks, config, ignore state, or remotes

#### Scenario: Human TTY confirms

- **WHEN** a TTY user reviews an accepted plan and explicitly confirms
- **THEN** execution consumes that exact plan subject to refreshed identity checks
- **AND** does not rediscover a broader target set silently

#### Scenario: Human declines or cancels

- **WHEN** the confirmation is declined or cancelled
- **THEN** Arashi exits with status `2` and `DELETE_CANCELLED`
- **AND** all state remains unchanged

#### Scenario: Non-TTY mutation omits force

- **WHEN** stdin is not a TTY and a mutating delete omits `--force`
- **THEN** Arashi exits with status `2` and `DELETE_CONFIRMATION_REQUIRED`
- **AND** recommends `--dry-run` for inspection or `--force` for accepted automation without prompting

#### Scenario: Dry-run plus force

- **WHEN** `--dry-run --force` is supplied
- **THEN** force affects Git-loss classification in the preview but no mutation occurs
- **AND** confirmation remains not required

### Requirement: Execution revalidates and orders destructive phases

Read-only planning SHALL NOT acquire or create a transaction lock. After confirmation or `--force`, execution SHALL acquire and hold one workspace-common-directory transaction lock through final verification using the existing `.arashi-add.transaction.lock` on-disk identity so cooperating old/new add/configure/delete clients remain serialized. After full revalidation it SHALL atomically create an owner-only receipt (`0600` on POSIX and platform-equivalent owner-only ACLs on Windows) at `<parent-common-dir>/.arashi-delete-receipts/<repositoryKeySha256>.json`, where `repositoryKeySha256` is the lowercase SHA-256 of the exact UTF-8 repository key and is independent of plan ID; it SHALL update the completed phase prefix through expected-byte atomic writes, remove linked worktrees deepest-first, prune only owned stale metadata, quarantine/remove the canonical clone and planned workspace hooks, remove the exact configuration entry last under byte-identity validation, and delete the receipt only after final verification.

The receipt SHALL contain only deterministic plan identity, repository key, non-secret config digest, exact path/ref/OID identities, and completed phase prefix. It SHALL NOT contain config bytes, hook/inline bodies, environment values, or commit bodies. Multiple, malformed, permission-unsafe, or mismatched receipts SHALL fail closed.

#### Scenario: Receipt cannot be created safely

- **WHEN** provenance creation fails before the first destructive phase
- **THEN** delete returns a no-mutation execution failure
- **AND** no repository, hook, config, ignore, or remote state changes

#### Scenario: Successful deletion

- **WHEN** every accepted identity remains current and each phase succeeds
- **THEN** all child linked worktrees/metadata and the canonical clone are gone, planned local hooks are gone, and only `repos.<repository>` is removed from active configuration
- **AND** managed ignore, shared/global hooks, unrelated configuration, and remotes are unchanged

#### Scenario: Configuration changes after planning

- **WHEN** `.arashi/config.json` bytes change after the plan snapshot and before config removal or any earlier destructive phase
- **THEN** Arashi fails with `DELETE_CONCURRENT_CHANGE`
- **AND** preserves the newer bytes rather than merging or overwriting them

#### Scenario: Worktree inventory changes after confirmation

- **WHEN** a hook-external process or concurrent Git operation adds, moves, or changes a registered worktree/ref/path after confirmation
- **THEN** refreshed identity validation aborts before the affected destructive phase
- **AND** the result reports completed and surviving state truthfully

#### Scenario: Child worktree removal fails

- **WHEN** one linked worktree cannot be removed
- **THEN** its phase fails, the canonical clone/config phases remain not-started, and unrelated unplanned paths are untouched

#### Scenario: Canonical clone removal completes

- **WHEN** all worktree phases complete and canonical clone removal succeeds
- **THEN** local child refs are reported completed as part of clone ownership
- **AND** config removal may proceed only after hook cleanup succeeds or records its own deterministic partial failure

#### Scenario: Config entry is removed last

- **WHEN** repository/worktree deletion and planned local hook cleanup complete
- **THEN** Arashi verifies exact config bytes under the lock and removes only `repos.<repository>`
- **AND** if a later config phase fails, preserves the exact entry and reports that it now points at completed deletion state for safe retry rather than claiming success

### Requirement: Partial failure and retry state are deterministic

Arashi SHALL return a phase and item ledger for every mutating execution, SHALL distinguish no-mutation failure from irreversible partial failure, and SHALL accept already-completed owned absence only when one valid durable receipt proves the exact plan and completed prefix. It SHALL NOT claim rollback for deleted Git/filesystem state.

#### Scenario: Failure occurs before mutation

- **WHEN** accepted-plan revalidation fails before the first destructive action
- **THEN** the command returns the specific failure with every item incomplete
- **AND** does not use `DELETE_PARTIAL_FAILURE`

#### Scenario: Failure occurs after one completed phase

- **WHEN** any worktree, clone, or hook item completed before a later phase failed
- **THEN** Arashi returns `DELETE_PARTIAL_FAILURE`
- **AND** the ledger marks completed, failed, and not-started items/phases exactly

#### Scenario: Receipt-backed retry observes completed worktree or clone phase

- **WHEN** the config entry still exists and one valid receipt plus current identity proves that an owned path/registration is absent exactly because an earlier accepted phase completed
- **THEN** replanning marks that owned phase completed and proceeds only with surviving planned phases
- **AND** does not interpret unrelated missing or changed identity as success

#### Scenario: Receipt-backed retry observes config already removed

- **WHEN** the exact entry is absent, one valid receipt proves the configuration phase completed, and all owned state is absent with no contradictory survivor
- **THEN** delete reports an idempotent already-completed result
- **AND** otherwise fails for manual review rather than selecting another repository

#### Scenario: Receipt is absent, stale, or cannot be updated

- **WHEN** prior destructive absence has no valid matching receipt or receipt persistence failed after irreversible work
- **THEN** `retry.safe` is false, retry argv is null, and delete requires manual inspection
- **AND** it never treats unrelated absence as invocation-owned completion

#### Scenario: Safe retry argv is rendered

- **WHEN** a matching receipt and current identities make automatic retry safe
- **THEN** human retry argv is exactly `["aw", "delete", repositoryKey, "--force"]`
- **AND** JSON retry argv is exactly `["aw", "delete", repositoryKey, "--force", "--json"]`

### Requirement: Human success and failure summaries are truthful and sanitized

Human output SHALL summarize repository key, canonical clone, linked worktrees, configuration entry, local targeted hooks, preserved global paths, completed phases, surviving state, and retry guidance as applicable. It SHALL NOT print hook contents, inline commands, environment values, commit bodies, or unrelated configuration.

#### Scenario: Human success is rendered

- **WHEN** deletion completes successfully
- **THEN** output lists the removed clone/worktrees/config entry/local hooks and any preserved global hook paths
- **AND** does not claim remote or managed-ignore deletion

#### Scenario: Human partial failure is rendered

- **WHEN** deletion partially fails
- **THEN** output distinguishes completed from surviving/failed state and gives one exact literal retry argument vector or manual-review guidance
- **AND** does not claim atomic rollback or full success
