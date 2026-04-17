## 1. Resolve and compare the default branch target

- [x] 1.1 Add a shared helper in `repos/arashi` that resolves a repository's default branch into a comparison target and refreshes it when a remote ref is available
- [x] 1.2 Implement behind-default comparison logic that compares `HEAD` against the resolved default branch and returns structured status for behind, skipped, and unavailable states
- [x] 1.3 Extend status data types to carry default-branch comparison results separately from upstream tracking and hard repository errors

## 2. Render default-branch drift in `arashi status`

- [x] 2.1 Update repository status collection to run default-branch comparison only when it is applicable and to preserve existing local status collection when comparison is skipped or unavailable
- [x] 2.2 Update default and verbose status output to show a dedicated `Default:` line when the current branch is behind the repo default branch and to surface unavailable comparison states concisely
- [x] 2.3 Update short status output to include a compact behind-default indicator without obscuring the existing branch and clean/dirty summary

## 3. Verify behavior and review follow-up docs

- [x] 3.1 Add unit tests for default-branch target resolution, behind-default comparisons, skipped cases, and unavailable comparison fallbacks
- [x] 3.2 Add formatter tests covering default, verbose, and short output when a branch is behind default and when comparison is unavailable
- [x] 3.3 Run `bun test`, `bun run lint`, and `bun run build` in `repos/arashi`
- [x] 3.4 Review whether `repos/arashi-docs/` or `repos/arashi-skills/` need follow-up updates for the new `arashi status` output examples
