## Context

`repos/arashi/src/commands/init.ts` currently assumes `process.cwd()` is already a git repository. If that check fails, the command returns `NOT_GIT_REPOSITORY` and prints guidance to run `git init` manually or change directories. That creates friction for first-time users and leaves the intended bootstrap path undocumented.

This change spans the CLI implementation in `repos/arashi/`, onboarding docs in `repos/arashi-docs/`, and workflow guidance in `repos/arashi-skills/`. The command behavior is interactive, so the design needs to keep prompt handling, rollback, and dry-run behavior predictable while preserving the existing initialization flow for already-initialized repositories.

Constraints:
- Preserve current `arashi init` behavior when the command is run inside an existing git repository.
- Keep the bootstrap target simple enough to avoid ambiguous path resolution or accidental repository creation outside the working directory.
- Keep documentation and skill guidance consistent so the new workflow is discoverable without reading implementation details.

## Goals / Non-Goals

**Goals:**
- Allow `arashi init` to bootstrap a git repository when started from a non-repository directory.
- Support two bootstrap targets: `.` for the current directory and a simple child directory name under the current working directory.
- Reuse the existing Arashi initialization pipeline after the repository root is resolved so config, hooks, gitignore updates, and discovery stay consistent.
- Update getting-started docs and Arashi skill references to explain where to run `init` and how the bootstrap target prompt works.

**Non-Goals:**
- Supporting arbitrary nested relative paths, parent traversal, or absolute paths as bootstrap targets.
- Changing `arashi init` semantics for users who already run the command from a git repository root.
- Adding remote setup, initial commits, README scaffolding, or other repository bootstrapping beyond `git init`.

## Decisions

1. Add bootstrap prompting before the hard git-repository failure path.
- Decision: when `init` detects that `process.cwd()` is not a git repository, it will enter an interactive bootstrap flow instead of returning an immediate error.
- Rationale: this keeps the beginner workflow inside one command and matches the issue's requested behavior.
- Alternatives considered:
- Keep the current failure and only improve docs: lower implementation cost, but still forces users through a manual bootstrap detour.
- Add a required new flag for bootstrap: explicit, but worse for discoverability and unnecessary for the default interactive path.

2. Constrain bootstrap target input to `.` or a direct child directory name.
- Decision: accept `.` for the current directory and a single child directory name such as `my-arashi-repo`; reject empty input, path traversal, absolute paths, and multi-segment paths.
- Rationale: this satisfies the requested workflow while avoiding surprising repository placement and keeping validation easy to explain.
- Alternatives considered:
- Allow any relative path: more flexible, but introduces ambiguous nesting and more edge cases around safety, messaging, and rollback.
- Separate prompts for current-dir versus child-dir choices: clearer, but more verbose than a single validated target prompt.

3. Refactor init execution around a resolved workspace root instead of raw `process.cwd()`.
- Decision: split bootstrap path resolution from the existing initialization steps so the command can compute a target repository root, optionally create it with `git init`, and then run the current workspace setup logic against that resolved root.
- Rationale: this avoids duplicating config, hook, gitignore, and discovery logic, and it keeps behavior aligned between existing repositories and newly created ones.
- Alternatives considered:
- Use `process.chdir()` and leave the current code structure intact: simpler mechanically, but makes tests and error handling harder to reason about.
- Duplicate the init logic for bootstrapped repositories: faster initially, but increases drift risk and maintenance cost.

4. Treat documentation and skill updates as part of the same contract.
- Decision: update `repos/arashi-docs/docs/getting-started/index.md`, `repos/arashi-docs/docs/commands/init.md`, and the relevant Arashi skill references/tutorials so they explain both the existing-repository and bootstrap workflows with matching target examples.
- Rationale: command behavior changes are only useful if new users can discover them, and repo policy already requires docs/skills review when command behavior changes.
- Alternatives considered:
- Update only CLI help text: too easy to miss for users who start from docs or skills.
- Update docs but not skills: creates drift in onboarding guidance.

## Risks / Trade-offs

- [Risk] Interactive bootstrap introduces new prompt paths and failure modes in integration tests -> Mitigation: add dedicated tests for decline, current-directory, child-directory, and invalid-target flows.
- [Risk] Users may initialize the wrong directory by mistake -> Mitigation: echo the resolved target clearly before creating the repository and keep accepted inputs narrowly scoped.
- [Risk] Bootstrapping a child directory could break existing rollback assumptions -> Mitigation: track filesystem operations against the resolved root and verify cleanup behavior in new failure-path tests.
- [Risk] Docs and skills may diverge from actual prompt wording over time -> Mitigation: update command docs and skill references in the same change and keep examples aligned with tested prompt semantics.

## Migration Plan

1. Refactor the init command so it can resolve a target root and optionally create a git repository before standard Arashi setup begins.
2. Add integration coverage for non-repository bootstrap flows and preserve existing in-repository init coverage.
3. Update docs and skill references to explain where to run `arashi init` and how `.` versus child-directory input behaves.
4. Roll back by reverting the CLI bootstrap flow and matching docs/skills updates if the interactive behavior proves confusing or unstable.

## Open Questions

- Should dry-run mode display the resolved bootstrap target and simulated `git init` action even though it does not create a repository?
- Should the command show a short post-success note when initialization was performed in a new child directory so users know to `cd` there for follow-up commands?
