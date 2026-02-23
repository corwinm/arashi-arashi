## 1. Config Option and Normalization

- [x] 1.1 Add a workspace config field in `repos/arashi/src/lib/config.ts` for the worktree base location and include it in load/save types.
- [x] 1.2 Implement normalization for configured location inputs (`../`, `.`, `./`, `.arashi/worktrees`, optional trailing slash) into a canonical internal form.
- [x] 1.3 Apply default fallback behavior so omitted configuration resolves to `.arashi/worktrees/`.

## 2. Shared Worktree Path Resolution

- [x] 2.1 Create a shared path-resolution utility that derives the absolute/normalized destination base from workspace root + configured location.
- [x] 2.2 Update all worktree-creating command flows in `repos/arashi/src` to use the shared resolver instead of command-specific path logic.
- [x] 2.3 Ensure equivalent configured inputs resolve to identical destination paths across commands.

## 3. Default Ignore Management

- [x] 3.1 Update init/setup logic to ensure `.arashi/worktrees/` is added to git ignore rules when the default managed location is used.
- [x] 3.2 Make ignore updates idempotent so existing `.arashi/worktrees/` entries are preserved without duplication.
- [x] 3.3 Avoid auto-editing ignore rules for non-default custom locations.

## 4. Tests for Requirements Coverage

- [x] 4.1 Add unit tests for config location parsing, normalization, and default fallback behavior.
- [x] 4.2 Add integration tests verifying worktree destination resolution for `../`, `.`, `./`, `.arashi/worktrees`, and trailing-slash variants.
- [x] 4.3 Add tests for ignore handling that cover both missing and pre-existing `.arashi/worktrees/` entries.

## 5. Validation and Quality Checks

- [x] 5.1 Run required checks in `repos/arashi`: `bun run lint` and `bun test`.
- [x] 5.2 Run recommended build check in `repos/arashi`: `bun run build`.
