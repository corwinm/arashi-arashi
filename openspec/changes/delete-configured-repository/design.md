## Context

Arashi stores one repository dependency under `repos.<repository>` in the active parent checkout's `.arashi/config.json`. In a direct parent checkout, the configured path normally names the canonical child clone. In a linked parent worktree, the same configured path names the active child worktree while the canonical child clone remains owned by the parent's canonical Git topology. A child clone can own additional coordinated worktrees nested beneath any linked parent worktree.

Today users can add/materialize that state but cannot delete it as one guarded operation. Manual deletion risks treating path shape as identity, editing configuration in the wrong parent branch, losing uncommitted or unpublished child data, following links outside managed roots, removing unrelated lifecycle hooks, or leaving Git worktree registrations behind.

Relevant existing foundations include configured `configurationRoot`/`executionRoot` discovery in `src/lib/workspace-context.ts`, canonical-main resolution through Git common-directory metadata, the workspace transaction lock, fail-closed physical-path helpers and deepest-first worktree closure in remove, canonical lifecycle-hook discovery, byte-identity configuration checks used by add/configure, and standard JSON envelopes/CLI-derived command contracts.

## Goals / Non-Goals

**Goals:**

- Make `aw delete <repository>` the explicit inverse of configured `aw add` without changing `aw remove`.
- Produce one immutable, sanitized plan used by human preview, JSON preview, confirmation, and guarded execution.
- Identify the child repository by configuration plus Git common-directory identity, not directory naming conventions.
- Protect every owned worktree, local ref, configuration byte snapshot, and candidate hook path before mutation.
- Make irreversible phase ordering and partial failure truthful, deterministic, and safe to retry.
- Keep active-parent configuration ownership separate from workspace-wide child materialization ownership.
- Synchronize all maintained CLI, docs, generated, completion, packaged-skill, and meta-contract surfaces.

**Non-Goals:**

- Deleting standalone/zero-config repositories, remote repositories, remote branches, user-global hooks, shared hooks, or managed-ignore policy.
- Editing tracked configuration in another parent worktree, another branch, or history.
- Providing a config-only detach/keep-files mode.
- Guaranteeing rollback after a Git worktree or canonical clone has been physically deleted.
- Treating reflog-only unreachable objects as durable published work; advertised local refs, stashes, and checked-out detached commits are the guarded local-data boundary.

## Decisions

### 1. Register a separate configured-only command

`delete` takes one exact canonical `repos` key and registers `-f, --force`, `-n, --dry-run`, and `-j, --json`. It has no alias under `remove`, accepts no fuzzy/path/branch interpretation, and rejects implicit standalone mode through the existing configured-command boundary.

Exit status is `0` for success or dry-run, `2` for declined/cancelled or missing required destructive confirmation, and `1` for planning, structural safety, execution, or partial-failure errors. JSON mode is always non-interactive; mutating JSON therefore requires `--force`, while `--dry-run --json` does not.

Why: a separate noun and exact key keep destructive repository lifecycle distinct from worktree lifecycle and make shell completion bounded to configured names. A keep-files or fuzzy target mode would weaken the initial contract.

### 2. Split planning from execution with closed typed records

`src/commands/delete.ts` owns command policy and orchestration. Read-only discovery produces an immutable `DeleteRepositoryPlan`; execution accepts that plan plus its identity snapshots and produces a `DeleteRepositoryResult`. Shared helpers may be extracted from add/remove only when both consumers retain existing behavior.

Every planned/result item has the same public projection:

- `id`: deterministic operation identity derived without hook contents;
- `kind`: `resume-receipt`, `canonical-clone`, `linked-worktree`, `worktree-metadata`, `local-ref`, `config-entry`, `workspace-hook`, or `preserved-global-hook`;
- `ownership`: `delete` or `preserve`;
- `path`: normalized absolute path or `null` for ref-only records;
- `ref`: full Git ref/config field/logical hook name or `null`;
- `oid`: immutable Git object ID or `null`;
- `planned` and `completed`: booleans;
- `state`: `planned`, `completed`, `preserved`, `blocked`, `failed`, or `not-started`;
- nullable sanitized `reasonCode` and `message`, always present.

Ordering is phase order; linked worktrees are deepest physical descendant first with normalized-path bytewise ties; refs and hooks are bytewise by canonical identity. Warnings are sorted and deduplicated. Paths use platform-native absolute form consistently within one invocation. `null` is used where the record kind has no path/ref; fields are never conditionally omitted.

Why: one record shape supports preview/result comparison and deterministic retry evidence. Generic free-form objects or different human/JSON planners could drift.

### 3. Resolve three authorities independently

Planning retains:

1. **Configuration authority** — the `.arashi/config.json` found from the active parent execution tree (or configured bare authority), its exact bytes, and the exact `repos.<repository>` value.
2. **Canonical child identity** — the child Git common directory, canonical clone/primary path, repository format/identity evidence, and canonical remote/configured-path relationship.
3. **Execution/materialization paths** — every registered child worktree, including the active child beneath the current linked parent and coordinated children beneath other parent worktrees.

The planner starts with `findConfiguredWorkspaceRoots("delete")` and computes `configuredActivePath` exactly once using normal config semantics: absolute `repos.<repository>.path` remains absolute; otherwise it is resolved beneath the active execution root and normalized without following links. This config-derived leaf—not its existence or Git metadata—is the initial authority. The planner then independently probes that exact leaf and its Git common directory. The accepted clone-owned set is exactly: `configuredActivePath`; the primary worktree reported by that same common directory; and each NUL-delimited `git worktree list --porcelain -z` path reported by that common directory. Every member must independently pass URL/common-dir/no-follow identity checks; no sibling, lexical prefix, or path discovered from another common directory is admitted. Records preserve main/bare, branch/detached OID, locked reason, and prunable state. A locked record blocks deletion; an exactly absent prunable record becomes owned stale metadata; an existing prunable record is live; malformed, duplicate, or unknown-ownership records fail closed. Direct-main, linked-parent, nested-child, absolute/custom configured paths, and configured bare parents all pass through this model; no `.arashi/worktrees`, branch-name, `reposDir` replacement, or parent-worktree basename convention is used.

The canonical child must match the configured entry's expected Git repository and must not be the parent/meta repository. `gitUrl` is normalized without network access through Git's configured URL rewrite, then canonicalized across equivalent SCP/SSH spellings, trailing slash/`.git`, host case, and local/file realpaths. At least one normalized fetch URL must match; push-only URLs do not establish ownership. Missing/ambiguous URLs, mismatched repositories, duplicate physical aliases, or malformed topology fail before mutation. A retry may accept expected absence only through the durable receipt defined below; unrelated missing configured state remains an error.

Why: configuration ownership and physical repository ownership intentionally differ in coordinated worktrees.

### 4. Fail closed on physical containment and link traversal

For every existing target and every ancestor from the authoritative managed root, planning uses `lstat`, native `realpath`, device/inode or platform-equivalent identity, and fail-closed error handling. Only `ENOENT` is absence. Existing symlink/junction targets, symlinked ancestors, path escapes, the parent/meta repository, unrelated Git common directories, and ambiguous aliases are structural blockers that `--force` cannot override.

Filesystem deletion is identity-anchored. Canonical clones and hook files are first atomically renamed within the same physically revalidated parent to a unique transaction quarantine name, then the moved object's recorded identity is rechecked before unlink/recursive removal; a mismatch is restored when safe and otherwise fails without deleting the moved object. Linked worktrees are removed only through Git using the exact NUL-parsed registration after an immediate identity refresh. If a platform/runtime cannot provide required no-follow metadata, same-parent rename, or identity comparison for a target, deletion fails with `DELETE_PATH_UNSAFE` rather than falling back to unanchored path recursion.

Canonical clone deletion is allowed only when the repository identity and configured ownership establish the entire root as owned. Linked worktree removal is allowed only for registrations owned by that exact common directory. Workspace-hook deletion is allowed only for exact active candidates returned by canonical lifecycle discovery for `pre-create.<repository>` and `post-create.<repository>` and a finite concrete template grammar formed by appending `.example` to those exact native candidate paths (for example `pre-create.api.sh.example` and `pre-create.api.ps1.example`). Literal generic init placeholders such as `pre-create.<repo>.sh.example` and `pre-create.REPO.ps1.example` are shared templates and are preserved. Multiple active candidates for one logical hook, unexpected file kinds, parent links, or canonical-name ambiguity block the operation. Repository-local hooks disappear only with their owned checkout; shared workspace hooks and all user-global hooks are preserved, with repository-specific global paths reported as guidance only. Hook contents are never read for planning, output, or identity.

Why: broad globbing and lexical prefix checks are unsafe for destructive operations.

### 5. Use local Git evidence for data-loss guards

Before confirmation, the planner inspects every registered child worktree with porcelain-v2 status including tracked, staged, untracked, conflicted, and ignored entries. Any such entry is a Git data-loss blocker.

It also inventories `refs/heads/*`, `refs/tags/*`, `refs/stash`, and detached checked-out commits. A local branch/stash/detached commit or the commit peeled from a local tag is protected when it is not reachable from any locally available `refs/remotes/*` commit or another explicitly preserved remote-backed object. Annotated tag metadata is disclosed but is not treated as separate commit-publication evidence. Reflog-only unreachable objects are outside this bounded live-ref model. Missing/invalid comparison evidence fails closed. The command performs no fetch or remote mutation: results describe that publication evidence is based on local remote-tracking state. `--force` may override these Git data-loss blockers after they are still disclosed in the accepted plan; it cannot suppress discovery or structural errors.

Why: deleting the clone deletes all local refs, not only currently checked-out branches. Network access inside confirmation would make dry-run nondeterministic and could mutate remote-tracking state.

### 6. Hold one workspace transaction lock and revalidate before each destructive phase

Read-only planning never acquires or creates a transaction lock, so dry-run and refused/declined invocations remain mutation-free. After an accepted human confirmation or `--force`, execution acquires the existing workspace-common-directory transaction lock at its current `.arashi-add.transaction.lock` common-directory path, revalidates the full plan before the first mutation, and holds the lock through final verification. Shared helper/type names may be generalized, but the on-disk lock identity is not renamed because add/configure/delete and older cooperating clients must remain in one lock domain. The accepted plan records exact config bytes, child common-directory identity, per-path metadata, worktree registrations, ref OIDs, and hook candidate metadata.

Execution revalidates the full accepted plan immediately before the first mutation, then revalidates the relevant subset before each phase:

1. create/update the exact resume receipt after full revalidation;
2. remove registered linked worktrees deepest-first;
3. prune only stale worktree metadata proven to belong to the child common directory;
4. quarantine/remove the canonical child clone;
5. quarantine/remove only planned workspace-root repository-targeted hook files/templates;
6. under the lock, verify exact config bytes and remove only `repos.<repository>`;
7. observe final state, remove the receipt only on verified completion, and produce the ledger.

The configuration entry is never removed before child materialization deletion completes. Managed ignore settings/files are not reconciled or removed. A phase stops on its first failure; later dependent phases are `not-started`. Previously completed phases stay completed and are not falsely rolled back.

Why: complete preflight limits irreversible surprises, while phase-local refresh closes time-of-check/time-of-use windows introduced after confirmation.

### 7. Make retries state-aware and partial failure explicit

Each phase records `not-started`, `started`, `completed`, or `failed`, start/end order, sanitized error code/message, and item IDs. On failure the command returns `DELETE_PARTIAL_FAILURE` when any irreversible item completed, otherwise the specific planning/execution error. Human output names completed and surviving state plus one safe literal retry argument vector/guidance without emitting an interpolated shell string. JSON failure preserves the standard envelope and places `{plan, result}` at `error.details`.

Before the first destructive phase, accepted execution atomically creates owner-only resume provenance (`0600` on POSIX and platform-equivalent owner-only ACLs on Windows) at `<parent-common-dir>/.arashi-delete-receipts/<repositoryKeySha256>.json`. `repositoryKeySha256` is the lowercase SHA-256 of the exact UTF-8 repository key, so receipt location is independent of plan identity. `planId` is a deterministic SHA-256 of the closed projected plan plus non-secret authority digests. The receipt stores only exact plan identity, repository key, config digest, path/ref/OID identities, and completed phase prefix—never config bytes, hook bodies, inline commands, or environment values. Updates use expected-byte atomic replacement under the unchanged workspace lock. Multiple, malformed, permission-unsafe, or identity-mismatched receipts fail closed.

A retry replans from current state under the same configuration authority and may accept an absent worktree/clone/hook or missing final config key only when one valid receipt proves that exact accepted phase prefix and all surviving identities still match. It never broadens to a new path. Successful final verification removes the receipt. If receipt persistence fails after irreversible work, `retry.safe` is false and guidance requires manual inspection. For a safe human retry, `argv` is exactly `["aw", "delete", repositoryKey, "--force"]`; JSON results append `"--json"` as the final element. No receipt means unrelated disappearance is never accepted as completion.

Why: filesystem deletion cannot be transactional, so honest resumability is safer than pretending rollback.

### 8. Confirmation and output disclose scope without secrets

Human TTY mutation without `--force` prints repository key, canonical clone, every linked worktree and local ref, exact config field/file, workspace hook paths, Git-loss warnings, and preserved user-global hook paths, then asks one default-no destructive confirmation. A non-TTY mutation without `--force` fails before mutation with guidance to use `--dry-run` or `--force`. Decline/cancel leaves all state unchanged.

JSON uses the standard single-document envelope. Dry-run success returns `data.plan` and `data.result: null`; mutating success returns both; failure returns them at `error.details.plan` and `error.details.result`, using `null` when execution never began. Base fields are `workspace`, `repositoryKey`, `dryRun`, `force`, `confirmation`, `plan`, and `result`. Hook records expose only logical identity, path, kind, ownership, and status—not bytes, inline command bodies, environment values, or shell snippets.

`plan` contains exactly `id`, `items`, and sorted `warnings`. `result` contains exactly `items`, `phases`, `retry`, and sorted `warnings`. `retry` contains `safe`, `argv`, and `guidance`; `argv` is an argument array or `null`, never a shell-interpolated command string. `workspace` uses the existing configured workspace JSON metadata fields (`mode`, `repositoriesBase`, `workspaceRoot`, and `worktreesBase`). `confirmation` is `not-required`, `confirmed`, `declined`, or `required`; JSON never uses `confirmed` or `declined` because it never prompts.

Failure precedence is fixed: CLI parsing first; configured-workspace/config loading; exact key lookup; topology/path/hook/Git-inspection errors; complete plan construction; Git-loss refusal before any confirmation requirement; dry-run success; confirmation requirement or TTY prompt; post-lock plan invalidation/concurrent change; execution failure; and `DELETE_PARTIAL_FAILURE` whenever irreversible work completed. Dirty interactive or non-interactive mutation without `--force` returns `DELETE_GIT_DATA_LOSS` and does not prompt; a clean TTY mutation may prompt, while clean non-TTY/JSON mutation returns `DELETE_CONFIRMATION_REQUIRED`.

Stable error codes are `CONFIGURED_WORKSPACE_REQUIRED`, `DELETE_REPOSITORY_NOT_FOUND`, `DELETE_CONFIG_INVALID`, `DELETE_TOPOLOGY_INVALID`, `DELETE_PATH_UNSAFE`, `DELETE_HOOK_AMBIGUOUS`, `DELETE_GIT_DATA_LOSS`, `DELETE_CONFIRMATION_REQUIRED`, `DELETE_CANCELLED`, `DELETE_CONCURRENT_CHANGE`, `DELETE_EXECUTION_FAILED`, and `DELETE_PARTIAL_FAILURE`.

Why: automation needs exact state, while hook/config secrecy must survive both successful and failed paths.

### 9. Companion behavior is generated and proportionate

The CLI-derived command contract owns command registration, options, configured-only support, JSON/confirmation semantics, completion candidate class, docs/skills requirements, and explicit VS Code exclusion. Bash/Zsh/Fish completion offers exact configured repository keys for the delete argument and static options through the existing bounded local query.

CLI docs get a dedicated `delete` command-list page plus concise README/config/hook references. Website docs get one command page and one proportionate configured-workspace workflow cross-link; generated Markdown/LLM exports are regenerated. The packaged skill adds deletion procedure to the smallest configured-workspace reference and keeps `SKILL.md` minimal. Existing stable semantic aggregates and the meta registry enforce source/package/export alignment; no feature-specific workflow step is added unless workflow topology actually changes. VS Code remains explicitly excluded because this destructive command has no approved editor UI.

## Risks / Trade-offs

- **Local remote-tracking refs can be stale** → disclose the evidence boundary, fail closed on absent/invalid evidence, and require explicit `--force` after the plan lists affected refs.
- **Ignored build/cache files make deletion conservative** → list counts/paths in blockers and let an informed user clean them or use `--force`; do not silently discard ignored files.
- **Canonical clone deletion is not rollbackable** → order config last, retain a deterministic phase ledger, and support state-aware retries.
- **Cross-platform path aliases differ** → use native physical canonicalization and platform-aware equality, with native Windows integration fixtures.
- **A concurrent external process can mutate after planning** → hold the workspace transaction lock and revalidate exact config/Git/filesystem identities before every phase; abort on mismatch.
- **Hook discovery can expose executable content** → inspect metadata only and prohibit bodies/environment values from all renderers and errors.
- **The feature spans several repositories** → deliver separate child PRs, cross-link them, merge children first, then archive/sync the OpenSpec change before the meta PR merges.

## Migration Plan

1. Land the CLI command, tests, generated contracts/completions, and CLI docs behind the new registered command.
2. Land website/generated-export and packaged-skill companions with coordinated contract checks.
3. After child PRs merge, archive this change and sync canonical specs on the meta PR.
4. No configuration migration is required. Existing workspaces gain the command; managed-ignore rules remain unchanged.
5. Rollback before execution is ordinary version rollback. After a user has completed deletion, recovery is `aw clone`/`aw add` from remaining branch configuration or source control; Arashi does not reconstruct deleted local-only data.

## Open Questions

None. The initial contract deliberately chooses exact configured keys, local-only publication evidence, no lifecycle hook execution, no config-only detach mode, and explicit VS Code exclusion.
