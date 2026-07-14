## Context

Arashi already has two partial models for ordinary repositories: `list` tolerates missing configuration, while core worktree orchestration classifies repositories as `standalone` and falls back to a minimal configuration. Most command entry points still call `findWorkspaceRoot` and `loadConfig`, so they reject a configless repository before core behavior can run. Core path calculation also treats standalone repositories like configured non-bare workspace roots and can add a repository-name path segment, which does not match the desired `.worktrees/<branch>` convention.

The trigger must be repository-scoped rather than current-directory-scoped. A linked worktree stores Git metadata through a `.git` file and shares a common repository with the main worktree; `.worktrees/` and `.arashi/config.json` must therefore be inspected at the main worktree root resolved by Git. Existing configured workspaces, including invalid configurations, remain authoritative and must never be masked by fallback behavior.

The change spans discovery, initialization, Git ignore safety, lifecycle commands, result types, documentation, packaged skill guidance, and generated command/export contracts. It must reuse the recently introduced Git-native managed-ignore inspection where semantics align without applying configured-workspace scope preferences or owned-block reconciliation to passive standalone discovery.

## Goals / Non-Goals

**Goals:**

- Establish one typed workspace-resolution boundary that distinguishes configured, implicit standalone, and unavailable workspaces.
- Preserve real-config precedence and exact config errors while resolving implicit mode from main or linked worktrees.
- Support the natural single-repository lifecycle with `.worktrees/<branch>` paths and no persisted implicit state.
- Make `init --zero-config` safe, local, idempotent, previewable, and transactional.
- Block creation before mutation when `.worktrees/` is exposed to Git status.
- Keep human, JSON, dry-run, rollback, docs, skill, and generated-contract behavior aligned.

**Non-Goals:**

- Change configured workspace defaults, `reposDir`, `worktreesDir`, hooks, command defaults, or managed-ignore scope preferences.
- Add child-repository coordination to implicit standalone mode.
- Automatically repair ignore state during passive discovery, read-only commands, cleanup commands, or `doctor`.
- Modify tracked `.gitignore`, global Git configuration, or persist `.arashi/config.json` for zero-config mode.
- Change bare-repository behavior or infer standalone mode without an existing root-level `.worktrees/` directory.

## Decisions

### Resolve a typed workspace context through Git

Introduce a shared resolver that starts from the invocation path, asks Git for repository state and the main worktree root, then returns a discriminated context such as configured, standalone, or unavailable. For configured context it loads and validates the real config. For standalone context it returns an in-memory config with `reposDir: "./repos"`, `worktreesDir: ".worktrees"`, and an empty repository map plus explicit mode metadata.

Resolution order is:

1. Preserve configured-workspace discovery from the invocation path, including a config at the current linked-worktree root or an enclosing configured meta-worktree; if a candidate config exists, load it and propagate parse, validation, version, or read failures.
2. If no configured context is found, resolve whether the invocation is in a non-bare Git repository and identify its main worktree.
3. Re-run configured-workspace discovery from the resolved main root so an externally located linked worktree of a managed child can recover the enclosing configured workspace; load any discovered config and propagate parse, validation, version, or read failures.
4. Otherwise, if the main root has a directory named `.worktrees`, return implicit standalone context.
5. Otherwise, return the existing not-in-workspace guidance.

This resolver is preferred over making `loadConfig` silently synthesize state because callers that truly require persisted configuration must remain able to reject standalone mode explicitly. It also prevents broad catch blocks from converting malformed config into fallback behavior.

### Keep command capability policy explicit

Naturally single-repository commands consume the typed context: `create`, `list`, `status`, `switch`, `remove`, `prune`, `doctor`, `move`, and `handoff`. Each receives one repository anchored at the main worktree and reports the workspace mode where its result format has workspace metadata. `list` retains its broader existing configuration-optional Git discovery when no implicit trigger exists; typed standalone context enriches it when `.worktrees/` does exist rather than narrowing current behavior.

Commands that configure, discover, clone, synchronize, execute across, set up, pull, or push coordinated child repositories continue to require configured context. At minimum `add`, `clone`, and `sync` retain explicit initialization guidance; the implementation audit applies the same policy to every command whose semantics require persisted repositories, groups, hooks, or coordination. `--only`, `--group`, and interactive multi-repository selection are rejected in standalone mode before worktree mutation instead of being ignored or interpreted as the sole repository.

This centralized capability policy is preferred over allowing empty `repos` to produce accidental no-ops because a successful no-op is misleading to humans and automation.

### Model the standalone repository as the main worktree

Standalone lifecycle orchestration uses the repository's main worktree as the sole repository regardless of where the command is invoked. Existing worktrees are discovered through `git worktree list --porcelain` from that repository. The workspace root and repository path are both the main worktree root; linked-worktree invocation metadata may still record the caller location where relevant. The stable standalone repository identity is the main-root basename.

Worktree path calculation gets an explicit standalone strategy that resolves `.worktrees/<branch>` without a repository-name prefix. Branch names retain `/` separators and therefore create nested directories. Path validation and Git conflict checks remain authoritative, and rollback removes partially created nested directories when no surviving worktree needs them.

An explicit strategy is preferred over overloading configured sibling behavior because the two layouts have different naming contracts.

### Separate passive ignore inspection from explicit bootstrap mutation

Implicit discovery and read-only/cleanup commands inspect but never repair ignore state. Before `create` or `create --dry-run` reaches branch or worktree mutation, Arashi asks Git with `--no-index` whether the exact normalized destination `.worktrees/<branch>` is effectively ignored by a tracked, repository-local, or existing global rule. The destination-specific probe is authoritative so negations, contents-only patterns, and branch-selective rules cannot expose the new worktree. A missing effective match produces a blocking plan/error with `arashi init --zero-config` and manual repository-local exclude guidance.

`init --zero-config` is the only automatic bootstrap path. It:

- verifies the invocation is inside an existing non-bare Git repository;
- rejects incompatible configured-init options and an existing `.arashi/config.json` before mutation;
- plans creation of the main-root `.worktrees/` directory;
- probes a deterministic descendant such as `.worktrees/.arashi-ignore-probe` with `git check-ignore --no-index` to determine whether the convention is already covered by an effective Git ignore source;
- otherwise appends the literal `.worktrees/` rule to the common repository's `info/exclude`, preserving newline conventions and existing content;
- verifies the same deterministic descendant after writing and rolls back with actionable higher-precedence-rule guidance if the local rule is not effective;
- never writes a managed block, clone-local ignore-scope preference, `.gitignore`, global configuration, or `.arashi/` state.

Directory and exclude-file mutations share one transaction. A downstream failure restores exact prior exclude content and removes only the newly created empty directory. Dry-run returns the same plan without writes. Repeated execution reports no changes.

Reusing low-level effective-ignore inspection and reversible file helpers is preferred over invoking configured reconciliation, whose ownership blocks, stale cleanup, multiple managed paths, and scope preferences are intentionally different.

### Preserve applicable user-global lifecycle hooks

Zero-config mode does not create or activate repository-local or workspace-root `.arashi/hooks` scopes because those belong to configured mode. Existing user-global hooks remain applicable: shared `~/.arashi/hooks/<lifecycle>.sh` hooks and repository-targeted `~/.arashi/hooks/<main-root-basename>/<lifecycle>.sh` hooks execute with the main repository as their working directory and explicit standalone workspace metadata. Existing ordering, pre-operation gating, post-operation finalization, error reporting, and rollback behavior remain unchanged for create/remove lifecycles.

Keeping user-global hooks preserves the existing all-repositories contract without pretending that zero-config mode has persisted workspace hook configuration. Using the main-root basename gives targeted hooks a stable identity from both main and linked worktrees.

### Preserve output contracts with explicit workspace metadata

Human output identifies standalone mode where workspace context matters and keeps actionable errors free of misleading configured-repository language. JSON-capable commands add stable mode/path/bootstrap fields to existing data or error details and continue emitting exactly one envelope on stdout. `init --zero-config --json` describes directory and local-exclude actions, effective ignore source, dry-run/applied/restored state, and blockers. `create --dry-run --json` reports an unignored exact `.worktrees/<branch>` destination blocker without mutation.

The envelope schema version remains unchanged because fields are additive. Commands that do not support JSON retain their documented classification rather than gaining ad hoc output.

### Update source documentation, generated exports, and packaged guidance together

Add a dedicated standalone workflow page showing explicit and manual bootstrap, create/list/status/switch/remove lifecycle, path layout, configured-mode contrast, and upgrade with ordinary `arashi init`. Link it from Getting Started and relevant command pages. Update CLI-owned help/docs and the packaged skill. Regenerate command contracts, Markdown routes, and LLM exports, and validate cross-repository coverage so generated artifacts do not drift from source guidance.

## Risks / Trade-offs

- **A nested or linked configured workspace could be mistaken for a standalone repository** → Preserve invocation-path configured discovery before Git main-root fallback, then check the main root before accepting implicit mode; cover configured meta-worktrees, managed children, standalone linked worktrees, and linked-worktree branches that contain valid or invalid config.
- **Malformed config could be hidden by fallback** → Check config existence separately and only synthesize after confirmed absence; propagate every non-not-found config error.
- **`git check-ignore` probes can differ for directory, descendant, and negated patterns** → Use `--no-index`, a deterministic bootstrap sentinel for convention-wide coverage, and the exact normalized create destination as the mutation gate; cover tracked, local, global, contents-only, branch-selective, negated, and absent rules with Git-backed fixtures.
- **Creation could expose untracked linked-worktree content** → Perform ignore verification before branch creation, directory creation, hooks, or any other mutation, including dry-run planning.
- **Existing command assumptions about multiple repositories can leak into standalone behavior** → Use typed context plus an explicit command capability audit and integration lifecycle tests rather than only patching `findWorkspaceRoot`.
- **Main and linked worktree paths can be confused** → Resolve main root/common metadata through Git and assert exact paths in linked-worktree fixtures on POSIX and Windows-style path tests.
- **Zero-config init could damage local exclude formatting** → Preserve exact original bytes for rollback, append with correct newline handling, and test empty, missing-newline, CRLF, existing-rule, and repeated runs.
- **Generated docs/contracts can drift** → Regenerate through normal project scripts and assert standalone option/workflow presence in source and generated outputs.

## Migration Plan

1. Add failing resolver and Git fixture tests for main/linked worktrees, precedence, invalid config, bare/missing-directory rejection, and no writes.
2. Implement typed context resolution and explicit configured-only policy helpers; migrate read-only commands first.
3. Add failing `init --zero-config` option, compatibility, dry-run, JSON, idempotency, formatting, and rollback tests; implement transactional bootstrap.
4. Add failing create/path/filter/ignore-blocker tests; implement standalone orchestration and path strategy.
5. Migrate and test switch, remove, prune, doctor, move, and handoff, including full real-repository lifecycle coverage.
6. Update CLI contracts/docs, docs site, packaged skill, and generated exports; run cross-repository validations.

Rollback is code-only. Existing zero-config bootstrap state is ordinary user-owned `.worktrees/` plus a local exclude rule and remains safe if the feature is reverted. No persisted Arashi migration or destructive downgrade is required.

## Open Questions

None. Issue #212 establishes the trigger, path layout, command scope, ignore policy, precedence, persistence boundary, and documentation expectations.
