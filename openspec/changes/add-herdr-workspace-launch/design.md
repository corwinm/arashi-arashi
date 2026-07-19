## Context

Arashi's `launchSwitchTarget` is shared by `arashi switch` and post-create launch. Its current order is explicit sesh, explicit IDE, active tmux, automatic cmux, integrated IDE, terminal app, and platform fallback. `SwitchCandidate` carries only repository name, branch, and worktree path, while Herdr's worktree-aware open command also requires the repository's non-bare source/main checkout. Configured repository paths are relative to the active coordinated workspace and can themselves be linked worktrees, so they cannot be copied directly into Herdr `--cwd`.

Herdr v0.7.4 exposes an argv-safe socket API wrapper:

```text
herdr worktree open --cwd <source-checkout> --path <existing-worktree> --label <repo-name>: <branch-name> --focus --json
```

Local verification against an Arashi linked worktree produced `result.already_open=false` and `result.workspace.workspace_id` on the first invocation, then `already_open=true` with the same workspace ID on the second. Herdr associated the linked workspace with the existing main-checkout workspace, confirming that Herdr-native repository grouping and reuse work without transferring Git lifecycle ownership.

## Goals / Non-Goals

**Goals:**

- Support explicit, configured, and automatically detected Herdr launch from both switch and post-create flows.
- Open only worktrees that Arashi/Git already created, focus and reuse existing Herdr workspaces, and preserve repository provenance.
- Pass source checkout, target checkout, and label as distinct argv entries; validate structured success before reporting it.
- Preserve deterministic launcher precedence and completed worktree creation on launch failure.
- Keep CLI help, configuration schema, canonical docs, generated docs exports, and skill guidance aligned.

**Non-Goals:**

- Call `herdr worktree create`, `herdr worktree remove`, or otherwise transfer Git worktree ownership to Herdr.
- Close Herdr workspaces automatically during `arashi remove`.
- Add a direct Herdr socket client, package dependency, named-session selector, remote-session support, or fallback to `herdr workspace create`.
- Change cmux, tmux/sesh, IDE, shell-integration, or generic terminal behavior except where the new precedence rules select Herdr.

## Decisions

- Resolve Herdr source checkout state on every launch candidate

Extend the internal switch candidate contract with resolved Herdr source state: either an absolute non-bare main checkout or an explicit unavailable state. Candidate discovery runs Git main-worktree resolution from each candidate repository path rather than treating `WorkspaceRepository.path` as canonical. Augmented `--all` child candidates resolve from the matching child checkout, create resolves from the successful primary repository, and standalone mode reuses its already-resolved shared main checkout. Tests use real linked-worktree topology to prove the result is the main checkout rather than an injected path.

This keeps the generic process-launch helper deterministic while making bare-repository limitations explicit. When a repository has no non-bare main checkout, switch Herdr launch fails before invoking Herdr; post-create Herdr launch fails after creation and preserves the successfully created worktrees. Arashi does not fall back to generic workspace creation because that would lose Herdr worktree provenance.

**Alternative considered:** derive the source with `git` inside the Herdr launcher. This would add subprocess and failure branches at launch time, duplicate repository discovery, and make injected test candidates incomplete in less obvious ways.

### Use Herdr's existing-worktree contract and native grouping

Invoke `herdr worktree open` with `--cwd`, `--path`, `--label`, `--focus`, and `--json` as separate argv entries. The source checkout is the repository's canonical main checkout, target path is the selected existing worktree, and label is `<repo-name>: <branch-name>`.

Accept Herdr's native source/worktree hierarchy. Local v0.7.4 verification showed that it records provenance, associates worktrees with the source repository, and reuses an already-open workspace. This is preferable to generic workspace creation because duplicate detection and Git provenance remain Herdr-owned while Arashi remains the only creator/remover of Git worktrees.

**Alternative considered:** `herdr workspace create --cwd ...`. It always creates a new workspace and would require Arashi to invent duplicate detection while losing worktree provenance.

### Model Herdr as an explicit/configured launch mode and an automatic environment

Add `herdr` to launch result types and to switch/create launch-mode configuration. Add `--herdr` to switch and create; on create it implies launch in the same way `--sesh` does. `HERDR_ENV` is considered active only when trimming produces the exact string `1`.

Resolution order is:

1. existing switch behavior selection (`--cd`, `--no-cd`, configured `mode`, and shell integration), rejecting `--cd` with an explicit launcher;
2. explicit per-invocation launcher (`--herdr`, `--sesh`, or switch IDE flag), with conflicts rejected;
3. configured `launchMode`, including `herdr`, unless `--no-default-launch` opts out;
4. automatic environment behavior, retaining active tmux before Herdr and Herdr before cmux/IDE/terminal fallback;
5. existing generic fallback.

Configured or explicit Herdr therefore works outside a Herdr pane when the CLI reaches the default running session, while nested tmux keeps its existing behavior only in automatic mode. For create, `--herdr` mirrors current `--sesh` semantics: it is the sole additional explicit launcher, implies launch, and takes explicit precedence over `--no-launch`; configured launch remains suppressible by `--no-launch`.

**Alternative considered:** automatic-only integration. That prevents launching into a running Herdr session from another terminal and does not satisfy persisted user defaults.

### Validate structured Herdr success and never silently fall through

A Herdr launch succeeds only when the process exits zero, stdout is valid JSON, `result.type` is exactly `worktree_opened`, `result.already_open` is a boolean, and `result.workspace.workspace_id` is a non-empty string. Reuse does not change launch mode or success output. Process execution failure, structured API error/non-zero exit, malformed or protocol-mismatched JSON, or missing workspace ID produces `LAUNCH_FAILED` with the attempted command, target path, and useful stderr/stdout guidance about the CLI and running server/socket.

Once Herdr is explicitly, configurably, or automatically selected, Arashi does not try another launcher. For create, this error occurs after creation and MUST leave successful worktrees intact.

Existing machine-readable restrictions remain unchanged: `switch --json` does not perform launch behavior, and `create --json` combined with `--herdr` is rejected before mutation alongside other interactive/launch modes. Human output and internal command results may report `herdr`; this change does not add a machine-readable launch execution contract.

**Alternative considered:** trust exit code alone or fall back. Exit-only success can mask incompatible output contracts; fallback can open the wrong app and falsely report that the requested mode worked.

### Keep workspace lifecycle independent

`arashi remove` does not call Herdr. Documentation explains that Herdr workspaces can retain agents or unsaved terminal state and may become stale after Git worktree removal. Optional cleanup guidance MUST NOT use Git-mutating `herdr worktree remove`; if shown, it resolves the Herdr workspace while the checkout still exists and uses `herdr workspace close` from a pre-remove hook.

## Risks / Trade-offs

- **Herdr changes its JSON shape or CLI syntax** → Pin docs to the verified v0.7.4 contract, test representative first-open/reuse payloads, and emit actionable response-validation errors.
- **Source checkout metadata is wrong for augmented or standalone candidates** → Derive it during existing repository discovery, normalize it to an absolute path, and cover configured, `--all`, create, and standalone paths.
- **Bare repositories have no non-bare Herdr source checkout** → Represent the limitation explicitly, fail switch launch before Herdr invocation, and preserve newly created worktrees when post-create launch reports the unsupported source.
- **A running Herdr session is unavailable outside Herdr** → Explicit/configured launch fails clearly with server/socket guidance and does not use another launcher.
- **A workspace remains after `arashi remove`** → Preserve terminal state by design and document manual/hook cleanup rather than risking data loss.
- **Post-create launch fails after multiple worktrees were created** → Preserve and report the created worktrees; never roll back successful Git operations for an external launcher failure.

## Migration Plan

1. Add failing candidate, config, precedence, parser, switch, and create tests.
2. Extend Git-backed candidate source metadata and launch-mode resolution, then implement the Herdr launcher in the shared path.
3. Run focused tests followed by CLI lint, full tests, build, schema checks, generated CLI contract checks, and workspace contract checks.
4. Update Arashi's maintained CLI docs, generated schema/contracts, canonical docs/curated exports, and skill references, then validate each repository.
5. Exercise the real v0.7.4 command with shell-significant paths if practical and verify repeated open reuses one workspace.
6. Release additively; rollback removes Herdr resolution while leaving existing worktrees and Herdr workspaces untouched.

## Open Questions

None. Local v0.7.4 verification resolves the issue's grouping question in favor of Herdr-native repository/worktree grouping.
