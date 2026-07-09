## 1. CLI Planning and Tests

- [x] 1.1 Add strict TDD coverage for `arashi remove --dry-run` branch-targeted preview and prove worktrees/branches remain after the command.
- [x] 1.2 Add tests for path-targeted dry-run, dirty worktree preview details, missing branch/skipped main reporting, and `--keep-worktrees` / `--keep-branches` plan effects.
- [x] 1.3 Add JSON-mode tests for `arashi remove <target> --dry-run --json`, explicit-target errors, stdout isolation, and no-op keep-flag plans.
- [x] 1.4 Add hook preview tests proving configured remove hooks are reported but not executed during dry-run.

## 2. CLI Implementation

- [x] 2.1 Add the `--dry-run` option to `arashi remove` command parsing and `RemoveCommandOptions`.
- [x] 2.2 Extract reusable removal-plan construction after target resolution, dirty checks, branch presence checks, skipped-main detection, and hook target discovery.
- [x] 2.3 Implement non-mutating dry-run execution that returns after plan formatting and bypasses destructive confirmation prompts, hook execution, worktree removal, worktree detach, and branch deletion.
- [x] 2.4 Add human preview formatting with explicit preview headings, planned operations, blockers, skipped/missing repositories, option effects, and hook context.
- [x] 2.5 Add JSON preview formatting under the standard envelope while preserving existing mutating remove JSON output shape.

## 3. Documentation and Skill Guidance

- [x] 3.1 Update `repos/arashi/docs/commands/remove.md` with dry-run usage, examples, and safety notes.
- [x] 3.2 Update `repos/arashi-docs/docs/commands/remove.md` with dry-run and JSON preview examples.
- [x] 3.3 Update `repos/arashi-skills/skills/arashi/references/commands.md` and hook guidance where appropriate so agents preview uncertain destructive cleanup first.

## 4. Validation and PR Choreography

- [x] 4.1 Run `bun run lint`, `bun run test`, and `bun run build` in `repos/arashi`.
- [x] 4.2 Run `bun run validate` in `repos/arashi-docs`.
- [x] 4.3 Run the arashi-skills validation command if present, or inspect/package the affected skill files according to existing repo scripts.
- [ ] 4.4 Open focused, cross-linked implementation PRs for `corwinm/arashi`, `corwinm/arashi-docs`, and `corwinm/arashi-skills` as needed, then update the meta/spec PR with the related PR set.
