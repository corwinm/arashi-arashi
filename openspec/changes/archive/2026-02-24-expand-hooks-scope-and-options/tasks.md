## 1. Hook Resolution Foundation

- [x] 1.1 Add a shared hook discovery utility in `repos/arashi` that resolves lifecycle scripts from repository-local, workspace-root, and user-global paths.
- [x] 1.2 Implement deterministic ordering in the resolver: repository-local -> workspace-root -> user-global (repo-targeted before shared within global scope).
- [x] 1.3 Extend hook execution plan metadata to include hook scope, source script path, target repository name, and working directory.

## 2. Hook Execution Integration

- [x] 2.1 Update remove lifecycle hook invocation to execute all discovered `pre-remove` hooks in order and abort on first failure/timeout.
- [x] 2.2 Update remove lifecycle hook invocation to execute all discovered `post-remove` hooks in order after remove attempts complete.
- [x] 2.3 Ensure hook process working directory is scope-correct (repo-local in child repo, workspace-root in root repo, user-global in target repo).
- [x] 2.4 Expose scope/source environment variables (for example `ARASHI_HOOK_SCOPE`, `ARASHI_HOOK_SOURCE_PATH`) alongside existing `ARASHI_*` context.

## 3. Verification and Regression Coverage

- [x] 3.1 Add integration tests covering hook discovery across all three scopes for remove lifecycle events.
- [x] 3.2 Add tests validating execution order across scopes and within global scope (repo-targeted before shared).
- [x] 3.3 Add tests for failure semantics (`pre-remove` abort behavior, `post-remove` error reporting with non-zero exit).

## 4. Documentation and Skills Sync

- [x] 4.1 Update `repos/arashi` command and hook docs to document new hook locations, targeting, order, and execution context.
- [x] 4.2 Update `repos/arashi-docs` with user guidance and examples for repo-local and global hook setup patterns.
- [x] 4.3 Update `repos/arashi-skills` guidance to align automation workflows with scoped hook behavior.

## 5. Quality Gates

- [x] 5.1 Run `bun run lint` in `repos/arashi` and fix any failures.
- [x] 5.2 Run `bun test` in `repos/arashi` and fix failing tests.
- [x] 5.3 Run `bun run build` in `repos/arashi` to validate distributable output.
