## Context

Arashi currently has three partially overlapping hook implementations: configured create hooks, configured remove hooks with multiple scopes, and standalone global hooks. They share a low-level executor but differ in discovery, context construction, outcome recording, timeout defaults, and lifecycle timing. `arashi init`, the CLI docs, the website, generated agent exports, and the packaged skill have preserved older environment names and assumptions that no longer match configured create. Arashi also ships on Windows, but normal discovery finds only `.sh` files, leaving the executor's PowerShell path unreachable.

A dogfood run while creating this coordinated worktree demonstrated the practical failure: the CLI child hook selected the ancestor pnpm workspace, failed its build because child dependencies were absent, then returned success because the tracked script ended with `echo`. The change must repair both the product contract and the repository's own usage without making existing trusted hook files silently execute under a different lifecycle.

## Goals / Non-Goals

**Goals:**

- Make lifecycle name, scope, timing, cwd, context, timeout, failure, rollback, and outcome behavior explicit and testable.
- Make generated examples safe when activated exactly as instructed.
- Preserve existing configured hook filenames while removing false claims about their timing.
- Support native Windows lifecycle scripts with fail-closed discovery.
- Keep legacy environment aliases usable during a documented compatibility window while adding unambiguous canonical fields.
- Keep human, JSON, docs, generated exports, and packaged skills semantically aligned.
- Make Arashi's own coordinated setup deterministic and fail honestly.

**Non-Goals:**

- Introduce arbitrary hook configuration in `.arashi/config.json`; filesystem convention remains the discovery mechanism.
- Rename or remove `pre-create.<repo>` in this change.
- Make setup-hook side effects transactionally reversible.
- Execute POSIX shell hooks on Windows through an implicit Git Bash dependency.
- Redesign `arashi setup` discovery or add native Windows setup scripts; this change fixes only the misleading init-generated setup example.
- Add persisted per-repository package-manager commands to Arashi configuration.
- Change launch/switch behavior, remove selection, or Git worktree layout.

## Decisions

### 1. Preserve filenames and publish the actual lifecycle matrix

Configured create remains:

1. workspace `pre-create` once, before branch/worktree mutation;
2. for each selected repository, materialize its branch/worktree;
3. repository-specific `pre-create.<repo>` in the new worktree;
4. repository-specific `post-create.<repo>` in the new worktree;
5. workspace `post-create` once after coordinated Git creation and before move-changes and switch/launch handling.

Any configured create-hook validation, timeout, or nonzero failure fails create and enters the existing owned Git rollback boundary. The repository-specific pre-create name is retained for compatibility and is described as post-materialization/pre-setup. Moving it before materialization was rejected because existing scripts and tests rely on the new worktree path and cwd.

Configured remove retains per-target scope evaluation in repository → workspace → global-targeted → global-shared order. Workspace and shared hooks therefore run once per target repository and must receive a target-consistent context. This multiplicity is made explicit rather than silently changed because existing cleanup scripts may depend on it.

Standalone create/remove retain targeted-global then shared-global discovery only, keyed by the canonical main-root basename.

### 2. Separate execution, target, and aggregate context

Every executed hook receives stable common fields where applicable:

- `ARASHI_HOOK_NAME`: logical discovered hook name, including the repository suffix for configured repository-specific create hooks;
- `ARASHI_HOOK_SCOPE`: `workspace`, `repository`, `global-repository`, or `global-shared`;
- `ARASHI_HOOK_SOURCE_PATH`: exact discovered script;
- `ARASHI_HOOK_EXECUTION_PATH`: exact process cwd;
- `ARASHI_WORKSPACE_MODE`: `configured` or `standalone`;
- `ARASHI_MAIN_REPO_PATH`: canonical configured workspace or standalone main root;
- `ARASHI_BRANCH_NAME`: current create branch or unambiguous current remove-target branch;
- `ARASHI_HOOK_TARGET_REPOSITORY`: current target repository identity when one exists;
- `ARASHI_HOOK_TARGET_REPO_PATH`: configured source/main checkout or standalone main root for that target repository;
- `ARASHI_HOOK_TARGET_WORKTREE_PATH`: target worktree when exactly one applies;
- `ARASHI_PARENT_REPO_PATH`: coordinated parent worktree for configured repository-specific create.

`ARASHI_REPO_NAME`, `ARASHI_REPO_PATH`, and `ARASHI_WORKTREE_PATH` remain compatibility aliases. `ARASHI_REPO_NAME` mirrors the target repository; `ARASHI_WORKTREE_PATH` mirrors an unambiguous target worktree; and `ARASHI_REPO_PATH` retains its documented lifecycle-specific historical value rather than being presented as a canonical portable path. New guidance uses the explicit `ARASHI_HOOK_TARGET_*` fields. Operation data may not overwrite common executor-owned fields.

The exact execution/target and compatibility mapping is:

| Mode and scope | Execution path | Explicit target repo path | Explicit target worktree | `REPO_NAME` alias | `REPO_PATH` alias | `WORKTREE_PATH` alias |
| --- | --- | --- | --- | --- | --- | --- |
| Configured workspace create | workspace root | unset | unset | unset | workspace root | unset |
| Configured repository-specific create | new child worktree | configured child source checkout | new child worktree | child name | new child worktree | new child worktree |
| Configured repository/workspace/global remove for one target | child source checkout except workspace scope uses workspace root | child source checkout | target worktree when exactly one | child name | child source checkout | target worktree when exactly one |
| Standalone targeted/shared create or remove | standalone main root | standalone main root | lifecycle target worktree when exactly one | main-root basename | standalone main root | lifecycle target worktree when exactly one |

Workspace create no longer leaks the first configured child through target or `REPO_NAME` fields. `ARASHI_BRANCH_NAME` is always the requested create branch; for remove it is set only when the current repository invocation has exactly one branch target.

Remove additionally exposes `ARASHI_REMOVE_TARGETS_JSON`, a JSON array with one record per planned remove target: `{ "repository": string, "branchName": string|null, "worktreePath": string|null }`. Worktree paths use the normative absolute lexical `/`-separator representation without realpath resolution; exact duplicate triples are removed, absent values are JSON `null`, and records use normative Unicode-scalar repository/path/branch sorting with null paths/branches first. Per-target executions derive scalar branch/worktree values from that repository's records, never from another target. If multiple values remain ambiguous, the scalar is omitted and scripts use JSON. Existing named comma-separated `ARASHI_REMOVE_TARGET_*` and `ARASHI_REMOVE_TOTAL_*` variables are deterministically derived from distinct canonical record fields, remain for the 1.x compatibility window, and are documented as lossy and non-canonical.

This additive compatibility path was chosen over immediately removing old fields. The documented `ARASHI_REPO_*`, `ARASHI_WORKTREE_PATH`, and comma-separated remove compatibility fields remain supported throughout the 1.x release line and may be removed no earlier than 2.0 through a separate approved breaking-change proposal. `ARASHI_BRANCH` and `ARASHI_BASE_BRANCH` are not runtime compatibility fields because configured create never supplied them; generated/docs references are corrected rather than perpetuated.

### 3. Use platform-native discovery and reject ambiguity

On POSIX, each lifecycle location supports `<name>.sh`. On Windows, extension matching is case-insensitive and supports `<name>.ps1`, `<name>.cmd`, and `<name>.bat`. When more than one supported script exists for the same location/lifecycle, discovery fails before hook or lifecycle mutation and lists the conflicting paths; it never selects one by incidental filesystem order. Windows does not discover `.sh` without an explicitly designed Bash runtime.

Windows discovery and interpreter availability are preflighted before lifecycle mutation. PowerShell hooks use system `powershell.exe -NoLogo -NoProfile -NonInteractive -ExecutionPolicy Bypass -File <absolute-script-path>` with the script path as its own process argument; this change does not prefer or require `pwsh`. Command hooks use system `cmd.exe /d /e:on /v:off /s /c call <encoded-absolute-script-path>`, pass the `.cmd`/`.bat` path through one Windows-command-line escaping helper, and do not concatenate environment values or extra user arguments into the command string. Missing interpreters or unsafe/unrepresentable command paths are `interpreter_unavailable` validation failures. Native tests cover spaces, `%`, `!`, `&`, parentheses, and mixed-case extensions. Doctor uses the same discovery/preflight library so it cannot diagnose a different candidate set from execution.

`init` generates platform-matched examples. Command-level Windows tests exercise PowerShell and command-script discovery, environment delivery, timeout/failure handling, and create/remove mutation boundaries. This was chosen over documenting hooks as POSIX-only because hooks are already part of configured and standalone lifecycle contracts on a product that publishes Windows binaries.

### 4. Keep examples inert but make activation correct

Example files remain non-executable so `init` does not activate trusted-code execution automatically. Human next steps and all documentation use one-to-one activation commands and explicitly create executable POSIX scripts, preferably with `install -m 755`; Windows guidance uses a copy command appropriate to the selected native extension.

Workspace create examples use only workspace context. Repository-specific dependency examples are explicitly named with a `<repo>` placeholder. Remove examples distinguish per-target scalars from command-wide JSON aggregates.

On POSIX, the setup example moves to `.arashi/setup.sh.example`, documents cwd rather than nonexistent hook environment, and does not alter `core.hooksPath`; activation produces the already supported `.arashi/setup.sh`. On Windows, init omits this POSIX-only setup example and points users to current setup documentation rather than generating a PowerShell file that existing discovery cannot find. Existing setup discovery precedence remains unchanged and is not conflated with lifecycle-hook discovery.

### 5. Unify timeout and outcome behavior

The default hook timeout is one exported `300000` millisecond value for configured create, configured remove, and standalone lifecycle hooks. `hooks.timeout` accepts only an integer from 1 through 2147483647 milliseconds and overrides the default wherever configured hooks execute. Zero, negative, fractional, non-numeric, or out-of-range values fail configuration/schema validation before hook discovery or lifecycle mutation and use the canonical structured configuration error in JSON mode. Timeout results retain per-hook records; aggregate status is timeout when any failed hook timed out, not whichever failure happened last.

Workspace configured create hooks are recorded in the same outcome ledger as repository-specific hooks, including skipped, success, validation failure, timeout, and nonzero exit. Standalone create records its targeted and shared user-global hooks in the same result shape. Human and JSON output derive from those complete mode-specific ledgers while hook stdout/stderr remain off JSON stdout.

### 6. Make package-manager examples and dogfood deterministic

Generated examples do not infer npm merely from `package.json`. Canonical guidance tells users to follow the repository's committed `packageManager` and lockfile. The pnpm coordinated command is `corepack pnpm --ignore-workspace install --frozen-lockfile`; POSIX shell prefixes it with `CI=true`, PowerShell sets `$env:CI = "true"` first, and command scripts use `set "CI=true"` first.

Arashi's tracked post-create hooks add fail-fast shell settings, use each child's pinned Corepack pnpm with `--ignore-workspace`, and set an explicit timeout sufficient for install/build. Presentation receives the same install hook if ready-after-create is the chosen project invariant; otherwise the meta guidance explicitly identifies it as manual. The default implementation choice is consistent automatic provisioning for every configured pnpm child.

The pre-remove tmux hook matches exact target worktree paths against tmux pane cwd and kills only sessions containing an exact target path. It consumes `ARASHI_REMOVE_TARGETS_JSON`, remains idempotent across per-target workspace invocations, and does not match branch/session substrings.

### 7. Enforce cross-repository semantic parity test-first

CLI tests first exercise generated template content through real temporary configured workspaces, then platform discovery, timing, cwd, context, outcomes, timeout, JSON isolation, and rollback. Docs add a focused checker before prose edits and assert canonical source pages, generated Markdown routes, and `llms-full.txt`. Skills add source and extracted-package checks. The meta repository owns a normalized semantic record/checker covering the CLI producer, docs, and skill consumer so stale aliases or activation guidance fail CI.

## Risks / Trade-offs

- **Existing scripts may rely on overloaded scalar remove values.** → Keep compatibility aggregate fields, add canonical JSON, and change scalars only to same-target values; document ambiguity and test multi-target runs.
- **Windows extension support broadens trusted-code execution.** → Generate inert examples, require explicit activation, restrict discovery to native known extensions, and fail on multiple candidates.
- **A 300-second default delays failure compared with configured create today.** → Document the value and retain positive per-workspace override; test timeout behavior without real waits through injection.
- **Fail-fast dogfood hooks can now roll back coordinated creation after transient install failures.** → Treat ready-after-create as a hard invariant; emit the actual failure and document explicit `arashi setup` as the alternative for projects choosing convenience over transactionality.
- **Workspace remove hooks still execute repeatedly.** → Publish multiplicity, provide target-consistent context, and keep tracked cleanup idempotent.
- **Large coordinated change can cause companion drift.** → Deliver child PRs separately, use semantic records/checkers, merge children before the meta archive PR, and validate generated/package artifacts from clean inputs.

## Migration Plan

1. Land CLI tests and runtime/template changes, retaining compatibility remove fields.
2. Land canonical docs and generated-export checker against the new CLI contract.
3. Land skill references and packaged-artifact checks.
4. Land meta semantic contract and dogfood hook/config changes after the supporting CLI behavior is available on the coordinated branch; do not rely on unreleased context variables on `main` before release.
5. Validate Windows on the native test host/CI and POSIX on macOS/Linux.
6. Merge and release the supporting CLI before the meta dogfood hooks reach `main`; verify the installed CLI exposes the new environment contract.
7. Update the existing proposal/meta PR with merged child SHAs and completed dogfood changes, complete all implementation/acceptance tasks, then archive/sync and commit the archive as the final update before meta merge.

Rollback is repository-specific: revert child changes in reverse dependency order. Compatibility fields and unchanged filenames allow rollback without rewriting user hook files.

## Open Questions

- None for proposal scope. Public hook-outcome and remove-target JSON shapes are normative; internal types may vary.
