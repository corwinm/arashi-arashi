# Implementation Workflow

Arashi separates cross-repository planning from repository-owned implementation.

## Ownership

```text
arashi-arashi/
├── openspec/              # Change context and canonical requirements
├── docs/                  # Workspace process guidance
└── repos/
    ├── arashi/            # CLI implementation
    ├── arashi-docs/       # Documentation site
    ├── arashi-skills/     # Agent skill package
    ├── arashi-vscode/     # VS Code extension
    └── arashi-presentation/
```

A parent commit cannot contain child-repository code. Commit and open a pull request in every repository that owns changed files.

## 1. Define the Change

Confirm the issue, current behavior, affected repositories, acceptance criteria, and contract impact. Use OpenSpec when the change creates or modifies a durable product requirement, needs design decisions resolved before implementation, or carries destructive, migration, or security risk. Routine maintenance, narrow fixes to already-specified behavior, test gaps, internal refactors, CI cleanup, and copy-only documentation can proceed directly from the issue. Cross-repository scope alone does not require OpenSpec when the issue fully specifies a mechanical change.

When OpenSpec is warranted, use the agent-native interface for each phase. Pi and OpenCode provide `/opsx-*` prompts; with Hermes, request the phase in plain language.

1. Use OpenSpec Explore for unresolved questions.
2. Use OpenSpec Propose to create the named change.
3. Review:
   - `openspec/changes/<change-name>/proposal.md`
   - `design.md`
   - `specs/*/spec.md`
   - `tasks.md`
4. Validate before implementation:

   ```bash
   openspec validate <change-name> --strict
   ```

For modified capabilities, delta requirements must preserve complete existing requirement blocks when using `## MODIFIED Requirements`.

## 2. Create the Worktree

Use Arashi when configured child repositories are affected:

```bash
aw create issue-NNN-short-name --only arashi --no-launch --no-switch
```

Add each affected child with another `--only` value or select a configured group. For meta-only work, use a normal Git branch/worktree.

Before editing, record each repository's branch, exact head, and dirty state. Do not overwrite unrelated local work.

## 3. Implement

Use OpenSpec Apply, follow `tasks.md`, or implement directly from the issue when OpenSpec is not warranted.

- Write tests before runtime behavior changes.
- Keep source, tests, and repository-specific docs in the owning child repository.
- Keep shared requirements, coordination notes, and OpenSpec artifacts in the parent.
- Update docs, skills, editor integration, and generated contracts when their canonical interfaces are affected.
- Commit each repository separately and cross-link companion pull requests.

## 4. Validate

Parent repository:

```bash
openspec validate --all --strict
pnpm run format:check
pnpm run typecheck
pnpm test
pnpm run contracts:check
```

CLI repository:

```bash
pnpm run format:check
pnpm run lint
pnpm run typecheck
pnpm test
pnpm run contract:check
pnpm run build
```

Use each other child repository's `AGENTS.md` and package scripts for its exact checks. Report actual outcomes; do not describe unrun checks as passing.

## 5. Review and Deliver

1. Review the complete base-to-head diff in every changed repository.
2. Run an independent repository-aware review before the first ready-for-review push.
3. Push exact reviewed heads and open issue-linked pull requests.
4. Verify remote CI on those heads.
5. Merge child implementation first when the parent archives child-owned behavior.
6. When an OpenSpec change exists, use OpenSpec Archive only after implementation is complete and approved.

The archived change is historical evidence; `openspec/specs/` is the post-archive canonical contract.
