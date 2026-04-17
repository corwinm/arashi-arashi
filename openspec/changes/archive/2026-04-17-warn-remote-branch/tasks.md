## 1. Remote refresh classification

- [x] 1.1 Detect the git fetch failure that means the resolved remote branch ref does not exist and represent it separately from generic stale remote-tracking failures.
- [x] 1.2 Thread the structured remote refresh warning state through `checkRepoStatus` without breaking local branch parsing or file status collection.

## 2. Status output updates

- [x] 2.1 Update default and verbose `arashi status` output to render a missing remote branch inline on the Branch line in warning styling.
- [x] 2.2 Suppress the generic `Remote tracking may be stale` warning for the missing-remote case while preserving it for other refresh failures.
- [x] 2.3 Adjust short output only as needed to keep warning reporting accurate for missing-remote and generic stale cases.

## 3. Tests and review

- [x] 3.1 Add unit coverage for missing-remote fetch detection and for preserving local status when that condition occurs.
- [x] 3.2 Add formatter tests for inline branch warnings and for preserving existing generic stale-warning behavior.
- [x] 3.3 Run `bun test`, `bun run lint`, and `bun run build` in `repos/arashi`.
- [x] 3.4 Review whether `repos/arashi-docs` or `repos/arashi-skills` need follow-up updates for the changed `arashi status` output.
