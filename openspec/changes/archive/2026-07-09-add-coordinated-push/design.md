## Context

Arashi coordinates a parent/meta repository and configured child repositories through commands such as `create`, `sync`, `pull`, `status`, and `remove`. After a coordinated branch contains commits, publishing still requires manually entering each changed repo and running the correct `git push` command. That manual step is easy to get wrong: an agent can forget a child repo, push an untouched child branch only because the coordinated worktree exists, or omit upstream tracking needed by follow-up PR tooling.

The new `push` command should mirror Arashi's existing repository-discovery, `--only`, human summary, and JSON envelope conventions while keeping Git as the source of truth for whether a branch needs publishing.

## Goals / Non-Goals

**Goals:**

- Publish the current coordinated branch for the parent repo and eligible managed child repos with one command.
- Respect standard repository filtering with `--only <repos>`.
- Support `--set-upstream` for newly published branches and ordinary `git push` behavior for branches with upstreams.
- Provide a faithful `--dry-run` preview that does not contact/mutate remotes beyond safe local inspection.
- Return a single structured JSON envelope in `--json` mode with per-repo outcomes and aggregate counts.
- Treat intentionally untouched child repositories as skipped rather than failures so coordinated worktree symmetry does not create unnecessary remote branches.

**Non-Goals:**

- Opening pull requests or editing PR bodies; `push` only publishes branches.
- Force-pushing, deleting remote branches, or rewriting history.
- Creating local branches/worktrees that do not already exist; `sync`/`create` remain responsible for alignment.
- Replacing normal Git authentication, credential prompts, or remote configuration.

## Decisions

### Determine repository eligibility before pushing

`push` should discover the current parent workspace and configured repositories, apply `--only`, and then inspect each selected repository's current branch, upstream, HEAD relationship, and whether the branch contains commits that differ from the repository's default/base branch. A repository is eligible when it is on the coordinated branch and either has an upstream that needs pushing or has local branch commits worth publishing with `--set-upstream`.

Alternative considered: push every selected repository unconditionally. That is simpler but would create remote branches for untouched child repos, conflicting with Arashi's existing practice of not manufacturing child branches just because a coordinated worktree exists.

### Use Git-native push commands with a small runner abstraction

Implementation should use a helper that executes `git push` in each repository directory, records stdout/stderr/exit status/duration, and maps expected no-op cases to skipped outcomes before mutation. `--set-upstream` should run the equivalent of `git push --set-upstream <remote> <branch>` only when the branch has no upstream or the command needs to publish a new upstream; normal pushes should rely on existing upstream config.

Alternative considered: manually update refs or call GitHub APIs. Git already handles remotes, credentials, hooks, and non-GitHub hosts, so shelling out to Git is the correct boundary.

### Keep dry-run local and conservative

`--dry-run` should produce the same selected-repository plan and clearly say which `git push` command would run, but it should not invoke `git push --dry-run` by default. Git's dry-run can still contact the remote and trigger credential/network behavior. A local preview is safer for agents and enough to satisfy the non-mutating planning contract.

Alternative considered: use `git push --dry-run` to catch remote rejection early. That improves remote accuracy but violates the safest reading of a preview because it depends on network/auth and remote-side checks. Remote rejections can be reported by the real push path.

### JSON mode mirrors existing envelope contracts

`arashi push --json` should reserve stdout for exactly one envelope with `command: "push"`, `schemaVersion: 1`, `ok`, `data`, and `warnings`. Human progress/spinners should be suppressed. Partial failures should result in `ok: false`, non-zero exit, and data/error details that identify failed repositories while preserving successful/skipped results.

### Update docs and agent guidance alongside CLI behavior

Because `push` affects the core feature-branch lifecycle, implementation should add command documentation in `repos/arashi` and `repos/arashi-docs`, plus Arashi skill guidance so agents know to use `arashi push` before opening cross-repo PRs and avoid manually pushing child repos one at a time.

## Risks / Trade-offs

- **Eligibility false positives could publish untouched child branches** → Use local branch/default-branch divergence and upstream status checks, and add integration tests for coordinated worktrees with untouched child repos.
- **Eligibility false negatives could skip a repo with meaningful changes** → Include skipped reasons in human/JSON output and support explicit `--only` so users can force a focused selection; tests should cover repos with local commits and existing upstreams.
- **Remote/auth failures can leave a partial publish** → Record per-repo success/failure, exit non-zero on any failure, and make output clear enough for users to retry after fixing credentials or remote protections.
- **JSON output can be polluted by progress** → Reuse the existing JSON envelope writer and suppress spinners/progress in JSON mode.
- **Dry-run may not catch remote rejection** → Document dry-run as a local non-mutating preview, not a remote acceptance guarantee.
