## 1. Add remote refresh support for status checks

- [x] 1.1 Extract or add a shared git helper that resolves a repository's tracking remote/branch and performs the targeted fetch used by `arashi status`
- [x] 1.2 Extend status result data so non-fatal fetch refresh warnings are tracked separately from hard repository errors

## 2. Integrate refresh behavior into `arashi status`

- [x] 2.1 Update repository status collection to run the targeted remote refresh before parsing branch divergence for eligible repositories and skip refresh when no target can be resolved
- [x] 2.2 Update default, verbose, and short status output to show stale-remote warnings without turning fetch degradation into a command failure

## 3. Verify behavior in tests and validation

- [x] 3.1 Add or update unit tests covering successful refresh, no-remote skip behavior, and fetch-failure fallback for local status reporting
- [x] 3.2 Run `bun test`, `bun run lint`, and `bun run build` in `repos/arashi`
