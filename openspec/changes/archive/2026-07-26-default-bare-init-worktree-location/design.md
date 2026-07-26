## Context

Configured `executeInit` currently normalizes `options.worktreesDir ?? DEFAULT_WORKTREES_DIR` after `resolveInitRoot`, then passes that value through managed-ignore reconciliation and persists it in `.arashi/config.json`. `DEFAULT_WORKTREES_DIR` also remains the compatibility fallback for existing configured workspaces whose older config omits the field. Changing that shared constant would incorrectly move non-bare and legacy workspaces.

Two current implementation details are material:

- `resolveInitRoot` returns the invocation directory for an existing repository, so a command run below a bare root could write configuration in the wrong directory.
- `reconcileManagedIgnore` runs worktree-dependent `git check-ignore`. A bare root has no working tree, so even though `..` is unsafe and skipped, the otherwise-safe default `reposDir` causes inspection to fail. Ignore rules also have no meaningful relationship to administrative directories resolved from a bare root.

Arashi already asks Git whether create was invoked from a bare repository and uses branch-only worktree naming there. Init needs a repository-aware resolution result, a bare-specific non-worktree ignore policy, result/output coverage, rollback guard corrections, generated contracts, and documentation. The config schema shape does not change.

## Goals / Non-Goals

**Goals:**

- Resolve existing repository type through Git and canonicalize bare invocations to the absolute bare Git directory.
- Select and persist `..` for bare roots and `.arashi/worktrees` for non-bare roots when `--worktrees-dir` is omitted.
- Preserve explicit-option precedence, existing-config authority, force semantics, and non-bare bootstrap/dry-run bootstrap.
- Report one resolved value through human preview, ordinary human success, standard/preference-only JSON results, config persistence, and create.
- Avoid all worktree-dependent ignore inspection and ignore-file mutation for paths rooted from bare configured init while preserving scope reporting and preference semantics.
- Repair rollback residual-state checks so unsafe/non-applicable pre-existing paths never suppress restoration.
- Keep JSON isolated and document the behavior across CLI, docs, exports, and packaged skill guidance.

**Non-Goals:**

- Changing the fallback for an existing configuration that omits `worktreesDir`.
- Migrating existing configs automatically.
- Changing standalone `arashi init --zero-config` or enabling it for bare repositories.
- Changing bare worktree naming or the config schema.
- Creating, deleting, or treating the bare repository parent as invocation-owned.
- Reusing create's temporary linked-worktree reconciliation for bare init; administrative paths resolved from a bare root are not working-tree paths.

## Decisions

### 1. Enrich init root resolution with repository type and canonical bare root

`InitResolution` will carry `repositoryType: "bare" | "non-bare"` alongside `workspaceRoot`.

For an existing repository, resolution will ask Git for `--is-bare-repository`. If bare, it will resolve `workspaceRoot` with `git rev-parse --absolute-git-dir`; this makes invocation from `example.git`, `example.git/objects`, or another discoverable descendant converge on `example.git`. If non-bare, existing init-root behavior remains unchanged to avoid broadening this issue.

For interactive bootstrap, plain `git init` deterministically creates a non-bare repository, so the result carries `non-bare` without a second classification probe. Dry-run bootstrap carries the same synthetic `non-bare` type even though no repository is created. A Git classification or canonicalization failure for an existing repository fails before init mutation and does not guess.

Alternatives considered:

- Filesystem heuristics such as `.git`: rejected because bare, linked-worktree, and platform layouts differ.
- Requiring invocation exactly at the bare root: rejected because Git can provide the canonical directory and nested invocation should not create misplaced state.

### 2. Select one init-only default after existing-config authority is known

Ordinary existing-config and preference-only gates run against the canonical workspace root before any new default is selected. For new or forced init, an omitted option uses `..` when `repositoryType` is bare and `DEFAULT_WORKTREES_DIR` otherwise. Explicit input remains authoritative and is normalized through the existing path validator.

`DEFAULT_WORKTREES_DIR` remains unchanged for non-bare init and legacy config omission. Later create uses persisted config rather than re-inferring the default.

### 3. Use a bare-specific non-worktree managed-path policy

Configured init whose resolved root is bare will not call the normal worktree-dependent effective-ignore inspector. Instead it will produce a deterministic, non-mutating managed-ignore result:

- parent traversal such as the default `..` is reported as external/unsafe;
- repository-relative subdirectories rooted in the bare Git directory, such as `reposDir`, are reported as non-applicable to working-tree ignore rules;
- no `.gitignore`, common `info/exclude`, global ignore, or temporary linked worktree inspection/write is attempted;
- `local`, `tracked`, and `none` remain valid reported scopes; explicit non-default preference may continue to use clone-local Git config, but no ignore-file write is implied while all paths are unsafe or non-applicable.

This policy is identical whether the bare repository has an existing linked worktree, has committed branches but no linked worktree, or is fresh/unborn. It avoids create's temporary-worktree restrictions and, more importantly, avoids writing rules for paths that are not in that temporary worktree.

Non-bare init continues using existing managed-ignore reconciliation.

### 4. Expose the normalized value through every applicable init result

`InitResult` and configured init JSON data will include normalized `worktreesDir`. Standard init uses the selected value. Preference-only existing init reports the existing normalized configured value, or `DEFAULT_WORKTREES_DIR` for a legacy omission, without repository-type recalculation.

Dry-run human output continues to show the generated config preview; ordinary successful human output adds the active worktree location. JSON and dry-run JSON emit exactly one envelope with no human stdout or stderr progress/warning leakage.

### 5. Base rollback retention only on applicable surviving managed paths

Managed-ignore rollback will not use raw existence of every resolved configured path. A parent directory selected through unsafe traversal and any bare-root non-applicable path are excluded from residual-state retention. For non-bare safe managed paths, existing final-state semantics remain: surviving relevant `reposDir` or worktree state retains required coverage; full removal restores invocation-owned ignore/preference changes; restoration failure remains structured with observed final state.

Init never creates the worktree base itself and never removes or rewrites the bare repository parent.

### 6. Verify the persisted bare-init-to-create path

A real integration fixture will initialize both committed and unborn bare repositories. The create-path case will provide a committed branch, initialize from a nested bare-repository directory, then create `feature/example`. The expected destination is under the canonical bare repository parent using the existing branch-only path layout, and no checked-out worktree may appear beneath Git storage.

### 7. Update authoritative guidance and generated contracts

CLI help will state that omitted `--worktrees-dir` defaults to `..` for bare repositories and `.arashi/worktrees` otherwise. Source help tests precede regeneration of `contracts/cli-commands.json`.

Required documentation updates include:

- `repos/arashi/docs/commands/init.md` and relevant CLI configuration guidance;
- `repos/arashi-docs/docs/commands/init.md` and `docs/getting-started/index.md`, followed by agent-readable export regeneration;
- `repos/arashi-skills/skills/arashi/references/tutorial.md`, `commands.md`, and `workflows.md`, followed by package-boundary verification.

Cross-repository semantic metadata/checkers change only if needed to enforce the new source-of-truth fields, and any checker change begins with a deliberate failing drift fixture.

## Risks / Trade-offs

- **Bare administrative paths are mistaken for working-tree paths** → Use an explicit bare non-worktree result rather than `git check-ignore` or temporary worktrees.
- **Nested invocation writes state below the bare root** → Canonicalize with `--absolute-git-dir` and test nested invocation.
- **Bootstrap dry-run probes a nonexistent repository** → Carry deterministic `non-bare` type in bootstrap resolution without probing.
- **Parent existence prevents ignore rollback** → Exclude unsafe/non-applicable paths from retention and test complete cleanup, surviving safe state, and restoration failure.
- **Legacy workspaces move unexpectedly** → Keep `DEFAULT_WORKTREES_DIR` and config-load fallbacks unchanged.
- **Preference-only JSON recalculates from repository type** → Read existing config value/fallback and test it explicitly.
- **Docs or generated outputs drift** → Update named canonical sources, regenerate derived artifacts, and run package/cross-repo checks.

## Migration Plan

No migration is required. Existing configs retain their persisted value; legacy configs without the field continue using `.arashi/worktrees`. New configured initialization, or forced reinitialization with the option omitted, persists the repository-aware value. Existing configs containing `..` remain valid if the feature is rolled back because that path is already supported.

## Open Questions

None.
