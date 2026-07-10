## Context

Arashi already coordinates a meta-repo plus child repositories and exposes status/list output that agents use to reason about coordinated workspaces. During interrupted work, the current handoff practice is manual: agents summarize dirty repos, validations, PR/spec links, and remaining tasks in chat. That summary is useful but inconsistent, easy to omit critical per-repo state from, and difficult for another agent to parse reliably.

Issue #186 asks whether the feature should start as docs-only, CLI, or both. This design chooses both: the CLI provides a durable source-of-truth snapshot and repeatable Markdown/JSON shape, while docs and skills teach the workflow and expectations.

## Goals / Non-Goals

**Goals:**

- Provide `arashi handoff` as a non-mutating command that can be run from a coordinated workspace at natural pause points.
- Include actual per-repository workspace status gathered through Arashi's existing repository discovery/status machinery.
- Produce readable Markdown by default for chat, issue, PR, or file handoff contexts.
- Produce JSON with the standard Arashi envelope for automation, downstream formatting, and agent tools.
- Let callers add explicit context that Arashi cannot reliably infer, such as related links, validation commands/results, remaining checklist items, risks/blockers, and next commands.
- Update docs and skills so handoff reports become part of the multi-repo agent workflow.

**Non-Goals:**

- Persist handoff reports or introduce a new report file database in the first implementation.
- Automatically infer every issue, spec, PR, or validation result from GitHub, shell history, or previous chat context.
- Replace existing `status`, `list`, `exec`, or PR workflows.
- Mutate repository state, stage files, commit changes, push branches, or run validation commands automatically.

## Decisions

1. **Ship CLI plus docs/skills, not docs-only.**
   - Decision: implement `arashi handoff` in `repos/arashi` and document it in `repos/arashi-docs` plus `repos/arashi-skills`.
   - Rationale: the high-value part is actual per-repo state from the workspace; a docs-only template would still rely on manual status transcription.
   - Alternative considered: docs-only template first. It is lower effort, but misses the acceptance criterion to include status data from Arashi rather than free-form text only.

2. **Markdown is the default human output; JSON is opt-in.**
   - Decision: `arashi handoff` prints Markdown to stdout by default, with `--json` returning a structured envelope.
   - Rationale: the most common handoff destination is chat, an issue, or a PR comment, where Markdown is immediately useful. JSON remains available for automation and custom renderers.
   - Alternative considered: require `--markdown`. This is explicit but less ergonomic for the primary use case; `--markdown` can still be accepted as an alias if the implementation wants symmetry.

3. **Use explicit repeatable input flags for non-inferable context.**
   - Decision: support repeatable flags such as `--link`, `--validation`, `--todo`, `--risk`, and `--next-command` for caller-supplied context.
   - Rationale: Arashi can inspect repositories, branch names, paths, and dirty state, but it should not scrape shell history or guess which validation commands were run.
   - Alternative considered: free-form `--notes` only. It is flexible but makes JSON less useful and encourages unstructured blobs.

4. **Keep command non-mutating and safe for interrupted work.**
   - Decision: `handoff` performs discovery and status inspection only; it does not run validations, write reports by default, create commits, or contact GitHub for link discovery in the first slice.
   - Rationale: a handoff command should be safe to run at any time, including from dirty workspaces.
   - Alternative considered: automatically write `HANDOFF.md`. That can be added later, but stdout avoids surprising file changes.

5. **Reuse the standard JSON envelope and status-shaped data.**
   - Decision: `handoff --json` uses `ok`, `command`, `schemaVersion`, `data`, and `warnings`; `data` includes workspace metadata, per-repository status records, caller-supplied context arrays, and generated next-step hints.
   - Rationale: this aligns with existing machine-readable output requirements and makes the command safe for agents to parse.

## Risks / Trade-offs

- **Risk: Report grows too verbose for chat.** → Mitigation: keep default Markdown concise, summarize clean repositories, and reserve detailed dirty/status lines for repositories that need attention.
- **Risk: Users expect automatic PR/issue/spec discovery.** → Mitigation: document that explicit `--link` values are the reliable first implementation; future discovery can be layered on without changing the core report contract.
- **Risk: JSON shape duplicates `status --json`.** → Mitigation: treat handoff JSON as a report envelope that embeds or references status-shaped records plus human handoff context, not as a replacement for status.
- **Risk: Validation evidence can be inaccurate if entered manually.** → Mitigation: make validation fields explicit strings supplied by the caller and label them as provided evidence, not re-run proof.

## Migration Plan

No migration is required. The feature adds a new command and companion documentation. Existing workspace and status commands continue unchanged.

## Open Questions

- Should the initial CLI also support `--output <file>` for writing a report file, or should stdout-only ship first?
- Should `--markdown` be accepted as an explicit alias even if Markdown is the default output?
