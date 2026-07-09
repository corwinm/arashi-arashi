## 1. CLI command contract

- [x] 1.1 Add `arashi handoff` command registration and help text in `repos/arashi`.
- [x] 1.2 Reuse existing workspace discovery and status inspection to collect workspace path, branch, repository status, dirty/touched repositories, drift, and warnings.
- [x] 1.3 Implement Markdown report rendering for the default human output path.
- [x] 1.4 Add repeatable context flags for related links, validation evidence, remaining tasks, risks/blockers, and suggested next commands.
- [x] 1.5 Ensure the command is non-mutating and does not run validation commands, write files, stage changes, commit, push, or delete worktrees.

## 2. JSON output

- [x] 2.1 Implement `arashi handoff --json` using the standard Arashi JSON envelope.
- [x] 2.2 Include workspace metadata, effective options, per-repository status records, user-supplied context arrays, warnings, aggregate status totals, and suggested next-command hints in the JSON payload.
- [x] 2.3 Ensure JSON mode writes exactly one JSON document to stdout with no Markdown, prompts, spinners, color, or progress noise.
- [x] 2.4 Return structured JSON errors for workspace resolution failures.

## 3. Tests

- [x] 3.1 Add CLI tests for Markdown output from a representative coordinated workspace with multiple repositories.
- [x] 3.2 Add tests for supplied links, validations, todos, risks, and next commands in Markdown output.
- [x] 3.3 Add tests for dirty/touched repository reporting and clean workspace summaries.
- [x] 3.4 Add JSON tests for success, supplied context preservation, stdout isolation, and workspace resolution errors.
- [x] 3.5 Run `bun run lint`, `bun run test`, and `bun run build` in `repos/arashi`.

## 4. Documentation and skills

- [x] 4.1 Add `arashi handoff` command documentation with Markdown and JSON examples in `repos/arashi-docs`.
- [x] 4.2 Update multi-repo/agent workflow docs to explain when to create a handoff report before pausing, switching agents, requesting review, or leaving dirty work.
- [x] 4.3 Verify generated agent-readable docs include the handoff command and workflow guidance where applicable.
- [x] 4.4 Update `repos/arashi-skills` guidance so agents know when and how to generate handoff reports.
- [x] 4.5 Run docs and skills validation commands for changed companion repositories.

## 5. PR choreography and closeout

- [ ] 5.1 Open focused, cross-linked implementation PRs for affected child repositories.
- [x] 5.2 Update the OpenSpec tasks as implementation and validation complete.
- [ ] 5.3 Archive and sync the OpenSpec change after implementation is ready for merge.
- [ ] 5.4 Update the meta/spec PR body with related PR links, synced spec paths, validation evidence, and `Closes #186` before final merge.
