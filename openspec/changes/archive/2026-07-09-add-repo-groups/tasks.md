## 1. Config and shared selection model

- [x] 1.1 Extend `RepoConfig` and `WorkspaceRepository` in `repos/arashi/src/lib/config.ts` to carry optional `groups?: string[]` metadata.
- [x] 1.2 Update config validation and schema generation so `repos.<name>.groups` accepts non-empty string arrays and rejects invalid entries.
- [x] 1.3 Add unit tests for loading repositories with no groups, one group, multiple groups, and invalid group definitions.
- [x] 1.4 Extend the shared repository-selection helper to normalize repeatable/comma-separated group filters and build a derived group-to-repository index.
- [x] 1.5 Add unit tests for group-only selection, multi-group union selection, `--only` plus `--group` intersection, unknown groups, unknown repos, and empty intersections.

## 2. CLI command integration

- [x] 2.1 Add `--group <group>` to `arashi status` and filter collected status records before output/summary generation.
- [x] 2.2 Add `--group <group>` to `arashi create` and apply it before worktree creation, dry-run planning, hooks, and move-changes follow-up.
- [x] 2.3 Add `--group <group>` to `arashi exec` and include effective group filters in human summaries and JSON results/errors.
- [x] 2.4 Add `--group <group>` to `arashi push`, `arashi pull`, `arashi setup`, and `arashi sync` using the shared selection helper.
- [x] 2.5 Ensure mutating commands fail before mutation when valid filters produce an empty intersection.
- [x] 2.6 Ensure JSON-capable commands report unknown groups and effective filters in the existing single-envelope JSON contract.

## 3. CLI tests and validation

- [x] 3.1 Add command tests for `status --group` human and JSON output, including summary counts and unknown-group errors.
- [x] 3.2 Add command tests for `create --group` dry-run and non-mutating empty-selection behavior.
- [x] 3.3 Add command tests for `exec --group`, including multi-group selection and `--only` intersection.
- [x] 3.4 Add focused tests for `push`, `pull`, `setup`, and `sync` group selection behavior.
- [x] 3.5 Run `bun run lint`, `bun run test`, and `bun run build` in `repos/arashi`.

## 4. Docs and skills

- [x] 4.1 Update `repos/arashi-docs` configuration reference with repo group examples.
- [x] 4.2 Update relevant command pages with `--group` option descriptions and examples.
- [x] 4.3 Update agent/workflow docs and generated Markdown exports so `/llms-full.txt` and command `.md` routes include group guidance where applicable.
- [x] 4.4 Update `repos/arashi-skills` guidance to prefer `--group` for known semantic repo sets.
- [x] 4.5 Run `bun run validate` in `repos/arashi-docs` and the appropriate validation command in `repos/arashi-skills`.

## 5. Closeout

- [x] 5.1 Open implementation PRs for affected child repos and cross-link them with the meta/OpenSpec PR and issue #181.
- [x] 5.2 After implementation PRs pass review and CI, archive/sync the OpenSpec change into `openspec/specs/repository-group-selection/spec.md`.
- [x] 5.3 Update the meta PR body from `Tracks #181` to `Closes #181` after archive/sync is pushed.
