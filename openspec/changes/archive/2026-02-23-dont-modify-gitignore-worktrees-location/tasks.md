## 1. Remove `.gitignore` mutation behavior

- [x] 1.1 Locate and remove setup/init code paths in `repos/arashi/` that append `.arashi/worktrees/` to `.gitignore`.
- [x] 1.2 Ensure default and configured worktree location flows still resolve and create worktrees correctly after the removal.

## 2. Update and expand automated coverage

- [x] 2.1 Update existing tests that currently expect `.gitignore` to be modified for default worktree location.
- [x] 2.2 Add/adjust integration coverage to verify setup/init leaves `.gitignore` unchanged whether the entry is absent or already present.

## 3. Validate and document behavior

- [x] 3.1 Update user-facing docs in `repos/arashi/` (and companion docs repos if needed) to state that Arashi does not auto-edit `.gitignore` for worktree paths.
- [x] 3.2 Run `bun run lint`, `bun test`, and `bun run build` in `repos/arashi/` and fix any regressions before opening PR.
